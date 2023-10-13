# WinLottery_web3
This is a fully automated Lottery DApp using Chainlink Verifiable Random Function to randomly select the winner: 

# Technologies:
1. [chainlink VRF](https://docs.chain.link/vrf)
2. [Chainlink Automation](https://docs.chain.link/chainlink-automation)
3. [Hardhat framework- Contract Deployment/Testing/Verification](https://hardhat.org/)
4. [IPFS](https://ipfs.tech/)
5. [React-moralis](https://www.npmjs.com/package/react-moralis)
6. [NextJS](https://nextjs.org/)
7. [Web3UIKit](https://web3uikit.com/)


Live Demo on IPFS: http://bafybeibqsl5mnkk5osa776a35edcxykebzq55e2pfacaigojdx7xh4ilue.ipfs.localhost:8080/

# Quickstart
```
git clone https://github.com/stevegee1/winRaffle_web3.git
cd  frontend/lottery
npm run dev
```
# Deploy Contract
* mainnet: ```npx hardhat deploy --network mainnet```
* sepolia: ```npx hardhat deploy --network sepolia```
* localhost: ```npx hardhat deploy --network localhost```

# Test Contract
```npx hardhat test --network sepolia``


