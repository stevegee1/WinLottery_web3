import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { BigNumber, ethers, ContractTransaction } from "ethers"
import { useNotification } from "web3uikit"
interface contractAddressesInterface {
    [key: string]: string
}

export default function LotteryEntrace() {
    const addresses: contractAddressesInterface = contractAddresses
    const { chainId, isWeb3Enabled } = useMoralis()
    const [entranceFee, setEntranceFee] = useState("0")
    const [participant, setParticipant] = useState("0")
    const [winner, setWinner]=useState("")
    const chainID = parseInt(chainId!).toString()

    let entranceFeeinWei: BigNumber
    const lotteryAddress =
        chainID in contractAddresses ? addresses[chainID] : null
    const dispatch = useNotification()

    const { runContractFunction: enterLottery } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress!,
        functionName: "enterLottery",
        params: {},
        msgValue: entranceFee,
    })
    const { runContractFunction: numberOfParticipants } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress!,
        functionName: "numberOfParticipants",
        params: {},
    })
    const { runContractFunction:getRecentWinner  } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress!,
        functionName: "getRecentWinner",
        params: {},
    })
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: lotteryAddress!,
        functionName: "getEntranceFee",
        params: {},
    })
    async function updateUI() {
        const entranceFeeFromCall = (
            (await getEntranceFee()) as BigNumber
        ).toString()
        setEntranceFee(entranceFeeFromCall)
        const recentWinner= (await getRecentWinner() as String).toString()
        setWinner(recentWinner)

        const numofParticipants = (
            (await numberOfParticipants()) as BigNumber
        ).toString()
        setParticipant(numofParticipants)

    

        
        //  console.log(entranceFeeinWei)
    }
    const handleSuccess = async function (tx: ContractTransaction) {
        await tx.wait(1)
        handleNewNotification( )
        updateUI()
    }
    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: (("Bell") as unknown) as React.ReactElement,
        })
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])
    return (
        <div>
            {lotteryAddress ? (
                <div>
                    <button
                        onClick={async () => {
                            await enterLottery({
                                onSuccess: (tx) =>
                                    handleSuccess(tx as ContractTransaction),
                                onError: (error) => console.log(error),
                            })
                        }}
                    >
                        Enter Lottery{" "}
                    </button>
                    <p> Number of participant: {participant}</p>
                    <p> Recent winner: {winner}</p>
                    <p>
                        Entrance fee: {ethers.utils.formatEther(entranceFee)}ETH
                    </p>
                </div>
            ) : (
                <div>no lottery address detected</div>
            )}
        </div>
    )
}
