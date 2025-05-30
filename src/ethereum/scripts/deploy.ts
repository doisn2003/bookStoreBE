import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const BookPayment = await ethers.getContractFactory("BookPayment");
  const bookPayment = await BookPayment.deploy();

  await bookPayment.waitForDeployment();
  
  const contractAddress = await bookPayment.getAddress();
  console.log("BookPayment deployed to:", contractAddress);

  // Lưu địa chỉ contract vào file cấu hình
  const configDir = path.join(__dirname, "..", "config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const contractInfo = {
    address: contractAddress,
    network: process.env.HARDHAT_NETWORK || "localhost",
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(configDir, "contract-address.json"),
    JSON.stringify(contractInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 