import { ethers, network,getNamedAccounts } from "hardhat";
import fs, { writeFileSync } from "fs";
import "dotenv/config";
import { DeployFunction } from "hardhat-deploy/types";
//import { Lottery__factory } from "../typechain-types";

const ContractAddressPath = "../frontend/lottery/constants/contractAdd.json";
const abiPATH = "../frontend/lottery/constants/abi.json";


 const UpdateFrontend:DeployFunction = async () => {
    const deployer = (await getNamedAccounts()).deployer;
  if (process.env.UPDATE_FRONTEND) {
    console.log("updating frontend...");
    await updateContractAddress();
    await updateAbi()
  }

  async function updateAbi(){
    const Lottery = await ethers.getContract("Lottery",deployer)
    fs.writeFileSync(abiPATH, Lottery.interface.formatJson());
  }

  async function updateContractAddress() {
    const Lottery = await ethers.getContract("Lottery");
    const currentAddress = JSON.parse(
      fs.readFileSync(ContractAddressPath, "utf8")
    );
    const chainId=network.config.chainId?.toString()
    if(chainId! in currentAddress){

        if(!chainId?.includes(String(Lottery.target))){
            currentAddress[chainId!]=Lottery.target
        }
       
    }else{
        currentAddress[chainId!]=[Lottery.target]
    }
    fs.writeFileSync(ContractAddressPath,JSON.stringify(currentAddress))
  }

};
module.exports =UpdateFrontend
UpdateFrontend.tags=["all","updateFrontend"]
