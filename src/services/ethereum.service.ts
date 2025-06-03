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
  privateKey: process.env.PRIVATE_KEY ? 'Được cài đặt (ẩn)' : 'Không tìm thấy',
  rpcUrl: process.env.ETHEREUM_RPC_URL
});

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

const getContract = () => {
  const provider = getProvider();
  const contractABI = getContractABI();
  const contractAddress = getContractAddress();
  
  // Khởi tạo contract với provider chỉ đọc
  return new ethers.Contract(contractAddress, contractABI, provider);
};

const getSignerContract = () => {
  const provider = getProvider();
  
  // Hardcode private key cho môi trường dev (CHỈ DÙNG CHO MỤC ĐÍCH TEST)
  const privateKey = process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  
  console.log('Checking private key in getSignerContract:', privateKey ? 'Có private key' : 'Không có private key');
  
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
  orderId: string
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
    
    // Lấy contract instance với quyền ghi
    const contract = getSignerContract();
    
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