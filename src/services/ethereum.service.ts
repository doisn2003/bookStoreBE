import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { Book } from '../models/book.model';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load dotenv từ thư mục gốc
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Debug
console.log('ENV trong ethereum.service:', {
  rpcUrl: process.env.ETHEREUM_RPC_URL || 'http://localhost:8545'
});

// Danh sách các tài khoản mặc định của Hardhat node (chỉ dùng cho môi trường test)
const HARDHAT_ACCOUNTS = [
  {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  },
  {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
  },
  {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a'
  },
  {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    privateKey: '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6'
  },
  {
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    privateKey: '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a'
  }
];

// Đọc ABI của contract
const getContractABI = () => {
  try {
    const artifactPath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'ethereum',
      'artifacts',
      'src',
      'ethereum',
      'contracts',
      'BookPayment.sol',
      'BookPayment.json'
    );
    
    const contractArtifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return contractArtifact.abi;
  } catch (error) {
    console.error('Error loading contract ABI:', error);
    throw new Error('Failed to load contract ABI');
  }
};

// Lấy địa chỉ contract đã triển khai
const getContractAddress = () => {
  try {
    const addressPath = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'ethereum',
      'config',
      'contract-address.json'
    );
    
    const contractInfo = JSON.parse(fs.readFileSync(addressPath, 'utf8'));
    return contractInfo.address;
  } catch (error) {
    console.error('Error loading contract address:', error);
    throw new Error('Failed to load contract address');
  }
};

// Khởi tạo provider và contract
const getProvider = () => {
  const rpcUrl = process.env.ETHEREUM_RPC_URL || 'http://localhost:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Lấy private key tương ứng với địa chỉ ví
const getPrivateKeyForAddress = (userAddress: string): string => {
  // Chuẩn hóa địa chỉ người dùng
  const normalizedUserAddress = userAddress.toLowerCase();
  
  // Tìm tài khoản tương ứng trong danh sách Hardhat accounts
  const account = HARDHAT_ACCOUNTS.find(acc => 
    acc.address.toLowerCase() === normalizedUserAddress
  );

  if (account) {
    return account.privateKey;
  }
  
  // Sử dụng private key mặc định nếu không tìm thấy
  return HARDHAT_ACCOUNTS[0].privateKey;
};

const getContract = () => {
  const provider = getProvider();
  const contractABI = getContractABI();
  const contractAddress = getContractAddress();
  
  // Khởi tạo contract với provider chỉ đọc
  return new ethers.Contract(contractAddress, contractABI, provider);
};

const getSignerContract = (userAddress?: string) => {
  const provider = getProvider();
  
  // Lấy private key tương ứng với địa chỉ người dùng hoặc sử dụng key mặc định
  let privateKey;
  
  if (userAddress) {
    privateKey = getPrivateKeyForAddress(userAddress);
  } else {
    // Sử dụng private key mặc định (owner của contract)
    privateKey = HARDHAT_ACCOUNTS[0].privateKey;
  }
  
  console.log('Using account address:', userAddress || HARDHAT_ACCOUNTS[0].address);
  
  try {
    const signer = new ethers.Wallet(privateKey, provider);
    const contractABI = getContractABI();
    const contractAddress = getContractAddress();
    
    // Khởi tạo contract với signer để gửi transaction
    return new ethers.Contract(contractAddress, contractABI, signer);
  } catch (error) {
    console.error('Error creating signer contract:', error);
    throw error;
  }
};

// Chuyển đổi VND sang ETH
const convertVNDToETH = async (amountInVND: number): Promise<string> => {
  // Giả định tỷ giá: 1 ETH = 100,000,000 VND (tỷ giá này cần cập nhật từ API thực tế)
  const exchangeRate = 100000000; 
  const amountInETH = amountInVND / exchangeRate;
  
  // Làm tròn đến 8 chữ số thập phân
  return amountInETH.toFixed(8);
};

// Tạo transaction data cho frontend
export const createEthereumTransaction = async (
  orderId: string,
  userAddress?: string
): Promise<{
  orderAmount: string;
  contractAddress: string;
  transactionData: string;
}> => {
  try {
    // Lấy thông tin đơn hàng trực tiếp
    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    // Lấy tổng tiền đơn hàng
    const totalAmount = order.totalAmount;
    
    // Chuyển đổi giá tiền từ VND sang ETH
    const priceInETH = await convertVNDToETH(totalAmount);
    
    // Lấy contract instance với quyền ghi (sử dụng tài khoản admin/owner)
    const contract = getSignerContract(); // Sử dụng tài khoản mặc định để thiết lập giá
    
    // Đặt giá trị đơn hàng vào contract
    const tx = await contract.setOrderAmount(
      orderId,
      ethers.parseEther(priceInETH)
    );
    await tx.wait();
    
    // Tạo transaction data cho hàm makePayment
    const iface = new ethers.Interface(getContractABI());
    const transactionData = iface.encodeFunctionData('makePayment', [orderId]);
    
    return {
      orderAmount: priceInETH,
      contractAddress: getContractAddress(),
      transactionData
    };
  } catch (error) {
    console.error('Error creating Ethereum transaction:', error);
    throw error;
  }
};

// Kiểm tra trạng thái thanh toán
export const checkEthereumPayment = async (
  orderId: string
): Promise<boolean> => {
  try {
    const contract = getContract();
    return await contract.isPaymentCompleted(orderId);
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

// Xác minh giao dịch ETH
export const verifyEthereumTransaction = async (
  txHash: string,
  orderId: string
): Promise<boolean> => {
  try {
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt || receipt.status === 0) {
      return false;
    }
    
    // Kiểm tra trong contract xem đơn hàng đã được thanh toán chưa
    const isCompleted = await checkEthereumPayment(orderId);
    return isCompleted;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
};

// Lấy thông tin tài khoản hardhat cho frontend
export const getHardhatAccounts = () => {
  // Chỉ trả về địa chỉ, không trả về private key
  return HARDHAT_ACCOUNTS.map(account => ({
    address: account.address
  }));
}; 