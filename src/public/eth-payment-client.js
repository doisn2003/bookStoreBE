/**
 * Client JavaScript để tích hợp thanh toán ETH vào Frontend
 * 
 * @author Ethereum Payment System
 * @version 1.0.0
 */

class EthereumPayment {
  constructor(apiBaseUrl = 'http://localhost:5000/api') {
    this.apiBaseUrl = apiBaseUrl;
    this.userAccount = null;
    this.testAccounts = [];
  }

  /**
   * Kiểm tra và kết nối MetaMask
   * @returns {Promise<string>} Địa chỉ ví đã kết nối
   */
  async connectMetaMask() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask không được cài đặt. Vui lòng cài đặt MetaMask để thanh toán bằng ETH.');
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.userAccount = accounts[0];
      return this.userAccount;
    } catch (error) {
      console.error('Lỗi kết nối MetaMask:', error);
      throw new Error('Vui lòng kết nối với MetaMask để thanh toán bằng ETH');
    }
  }

  /**
   * Lấy danh sách tài khoản test (chỉ dùng cho môi trường dev)
   * @returns {Promise<Array>} Danh sách tài khoản test
   */
  async getTestAccounts() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payments/ethereum/test-accounts`);
      const data = await response.json();
      
      if (data.success) {
        this.testAccounts = data.data;
        return this.testAccounts;
      } else {
        throw new Error(data.message || 'Không thể lấy tài khoản test');
      }
    } catch (error) {
      console.error('Lỗi lấy tài khoản test:', error);
      throw error;
    }
  }

  /**
   * Tạo giao dịch thanh toán ETH
   * @param {string} orderId - Mã đơn hàng
   * @returns {Promise<Object>} Thông tin thanh toán
   */
  async createPayment(orderId) {
    if (!this.userAccount) {
      throw new Error('Vui lòng kết nối MetaMask trước khi thanh toán');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/payments/ethereum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          userAddress: this.userAccount
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Không thể tạo giao dịch thanh toán');
      }
    } catch (error) {
      console.error('Lỗi tạo giao dịch thanh toán:', error);
      throw error;
    }
  }

  /**
   * Thực hiện giao dịch thông qua MetaMask
   * @param {Object} paymentData - Dữ liệu thanh toán từ API
   * @returns {Promise<string>} Mã giao dịch trên blockchain
   */
  async sendTransaction(paymentData) {
    try {
      const { contractAddress, orderAmount, transactionData } = paymentData.ethereum;
      
      // Chuyển đổi số tiền từ ETH sang Wei (đơn vị nhỏ nhất của ETH)
      let amountInWei = BigInt(Math.round(parseFloat(orderAmount) * 1e18)).toString(16);
      // Thêm tiền tố '0x'
      amountInWei = '0x' + amountInWei;
      
      const transactionParameters = {
        to: contractAddress,
        from: this.userAccount,
        value: amountInWei,
        data: transactionData
      };
      
      // Gửi yêu cầu giao dịch đến MetaMask
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      });
      
      return txHash;
    } catch (error) {
      console.error('Lỗi gửi giao dịch:', error);
      throw error;
    }
  }

  /**
   * Xác nhận thanh toán đã hoàn tất
   * @param {string} paymentId - Mã thanh toán
   * @param {string} txHash - Mã giao dịch blockchain
   * @returns {Promise<Object>} Kết quả xác nhận
   */
  async confirmPayment(paymentId, txHash) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/payments/ethereum/${paymentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionHash: txHash
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Không thể xác nhận thanh toán');
      }
    } catch (error) {
      console.error('Lỗi xác nhận thanh toán:', error);
      throw error;
    }
  }
}

// Sử dụng trong môi trường browser
if (typeof window !== 'undefined') {
  window.EthereumPayment = EthereumPayment;
}

// Xuất module cho Node.js
if (typeof module !== 'undefined') {
  module.exports = EthereumPayment;
} 