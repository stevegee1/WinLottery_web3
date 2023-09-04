import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployLottery: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const { getNamedAccounts, deployments } = hre;
  const { log, deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const minimumFee = ethers.parseEther("2");
  log("deploying lottery contract...");
  const deployed = await deploy("Lottery", {
    from: deployer,
    args: [minimumFee],
    log: true,
  });
};
export default deployLottery;
deployLottery.tags = ["all", "lottery"];
