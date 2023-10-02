import { ethers } from "hardhat";
export const networkConfig = {
  chainIds: {
    1: [
      "0x271682deb8c4e0901d1a1550ad2e64d568e69909",
      ethers.parseEther("0.0001"),
      2354,
      "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90ea201ae456421a2ded86805",
      100000,
      2,
      2,
      30,
    ],
    11155111: [
      "0x8103b0a8a00be2ddc778e6e7eaa21791cd364625",
      ethers.parseEther("0.00001"),
      2354,
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
      2500000,
      3,
      1,
      30,
    ],
    
  },
};
export const networkName = ["hardhat", "localhost"];
