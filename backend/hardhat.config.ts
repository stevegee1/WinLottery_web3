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
      chainId: 11155111,
      accounts: [PRIVATE_KEY!],
    },
    mainnet: {
      url: process.env.ETH_URL,
      chainId: 1,
      accounts: [PRIVATE_KEY!],
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {},
};

export default config;
