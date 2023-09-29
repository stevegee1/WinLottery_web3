import { run } from "hardhat";

export const Verify = async (contractAddress: string, args: any[]=[]) => {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error: unknown) {
    if (typeof error == "object" && error != null) {
      const errorMsgAssert = (error as { message: string })
      if ( errorMsgAssert.message.toLowerCase().includes("already verified")) {
        console.log("c");
      } else {
        console.log(error);
      }
    } else {
      console.log(error);
    }
  }
};
