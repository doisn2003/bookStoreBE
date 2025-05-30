# Hướng dẫn triển khai và sử dụng chức năng thanh toán bằng Ethereum

Tài liệu này hướng dẫn cách triển khai và sử dụng chức năng thanh toán ETH trong hệ thống backend của bookstore.

## Yêu cầu hệ thống

- Node.js (v14 trở lên)
- npm hoặc yarn
- MetaMask wallet (cho phía người dùng)

## Cài đặt các gói phụ thuộc

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers@^6.0.0 dotenv
```

## Cấu hình môi trường

Tạo file `.env` trong thư mục gốc của dự án với nội dung sau:

```
# Ethereum
PRIVATE_KEY=your_private_key_here
GOERLI_URL=https://goerli.infura.io/v3/your_infura_project_id
ETHEREUM_RPC_URL=http://localhost:8545
```

Lưu ý:
- `PRIVATE_KEY`: Khóa riêng tư của ví Ethereum dùng để triển khai contract
- `GOERLI_URL`: URL của mạng testnet Goerli (có thể thay bằng testnet khác)
- `ETHEREUM_RPC_URL`: URL của JSON-RPC endpoint (mặc định là localhost cho môi trường phát triển)

## Khởi động mạng Hardhat local

```bash
npx hardhat node
```

Lệnh này sẽ khởi động một blockchain Ethereum cục bộ tại địa chỉ `http://localhost:8545`.

## Triển khai smart contract

```bash
npx hardhat run --network localhost src/ethereum/scripts/deploy.ts
```

Nếu muốn triển khai lên mạng testnet:

```bash
npx hardhat run --network goerli src/ethereum/scripts/deploy.ts
```

## Cấu trúc thư mục

```
src/ethereum/
├── contracts/           # Smart contracts
│   └── BookPayment.sol
├── scripts/             # Scripts triển khai
│   └── deploy.ts
├── config/              # Cấu hình sau khi triển khai
│   └── contract-address.json
├── test/                # Tests cho smart contracts
└── artifacts/           # Compiled contracts (tự động tạo)
```

## Luồng thanh toán Ethereum

1. Người dùng chọn thanh toán bằng Ethereum trên frontend
2. Frontend gọi API `POST /api/payments/ethereum` với `orderId`, `bookId` và `userAddress`
3. Backend tạo giao dịch và trả về thông tin gồm:
   - `contractAddress`: Địa chỉ của smart contract
   - `orderAmount`: Số tiền ETH cần thanh toán
   - `transactionData`: Dữ liệu giao dịch
4. Frontend yêu cầu người dùng kết nối với MetaMask
5. Frontend gửi giao dịch thông qua MetaMask với dữ liệu nhận được
6. Sau khi giao dịch được xác nhận, frontend gọi API `POST /api/payments/ethereum/:paymentId` với `transactionHash`
7. Backend xác minh giao dịch trên blockchain và hoàn tất thanh toán

## Tích hợp MetaMask trên Frontend

### Kết nối MetaMask

```javascript
async function connectMetaMask() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error) {
      console.error("Người dùng từ chối kết nối:", error);
      throw new Error("Vui lòng kết nối MetaMask để thanh toán bằng Ethereum");
    }
  } else {
    throw new Error("MetaMask chưa được cài đặt. Vui lòng cài đặt extension MetaMask.");
  }
}
```

### Gửi giao dịch

```javascript
async function sendEthereumPayment(contractAddress, orderAmount, transactionData) {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];
    
    const transactionParameters = {
      to: contractAddress,
      from: userAddress,
      value: ethers.utils.parseEther(orderAmount).toHexString(),
      data: transactionData
    };
    
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });
    
    return txHash;
  } catch (error) {
    console.error("Lỗi khi gửi giao dịch:", error);
    throw error;
  }
}
```

## Khắc phục sự cố

1. **Lỗi kết nối MetaMask**:
   - Đảm bảo MetaMask extension đã được cài đặt
   - Kiểm tra MetaMask đã được mở khóa
   - Chuyển MetaMask sang mạng đúng (localhost:8545 hoặc Goerli)

2. **Giao dịch không được xác nhận**:
   - Kiểm tra số dư ETH đủ để thực hiện giao dịch
   - Kiểm tra gas price và gas limit phù hợp
   - Xác nhận lại giao dịch trong MetaMask

3. **Smart contract không hoạt động**:
   - Kiểm tra contract đã được triển khai đúng cách
   - Kiểm tra file `contract-address.json` đã được tạo
   - Kiểm tra biến môi trường `ETHEREUM_RPC_URL` đúng

## Test thanh toán trong môi trường phát triển

1. Khởi động Hardhat local node:
   ```bash
   npx hardhat node
   ```

2. Triển khai contract:
   ```bash
   npx hardhat run --network localhost src/ethereum/scripts/deploy.ts
   ```

3. Import một trong các tài khoản test từ Hardhat vào MetaMask:
   - Copy private key từ terminal sau khi chạy `npx hardhat node`
   - Trong MetaMask, chọn "Import Account" và dán private key

4. Thêm mạng Hardhat local vào MetaMask:
   - Network Name: Hardhat
   - RPC URL: http://localhost:8545
   - Chain ID: 1337
   - Currency Symbol: ETH

5. Tiến hành test thanh toán với tài khoản này 