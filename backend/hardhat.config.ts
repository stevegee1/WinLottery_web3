import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "dotenv/config";
const SEPOLIA_URL = process.env.URL;
const PRIVATE_KEY = process.env.KEY;
const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY!],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user:{
      default:1
    }
  },
};

export default config;
