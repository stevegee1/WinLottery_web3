import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import { networkName, networkConfig } from "../helpers.hardhat.config";
import { Verify } from "../utils/verify";

const deployLottery: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { getNamedAccounts, deployments } = hre;
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const minimumFee = ethers.parseEther("0.00001");
  const chainId = network.config.chainId!;

  if (!networkName.includes(network.name) && networkConfig.chainIds[11155111]) {
    log("deploying lottery contract...");
    console.log(network.name);
    const deployed = await deploy("Lottery", {
      from: deployer,
      args: networkConfig.chainIds[11155111],
      log: true,
    });
    const lotteryAddress = (await deployed).address;
    await Verify(lotteryAddress, networkConfig.chainIds[11155111]);
  } else if (!networkName.includes(network.name) && networkConfig.chainIds[1]) {
    log("deploying lottery contract...");
    console.log(network.name);
    const deployed = await deploy("Lottery", {
      from: deployer,
      args: networkConfig.chainIds[1],
      log: true,
      waitConfirmations:6
    });
    const lotteryAddress = (await deployed).address;
    

    await Verify(lotteryAddress, networkConfig.chainIds[1]);
  }
};

module.exports = deployLottery;
deployLottery.tags = ["all", "lottery"];
