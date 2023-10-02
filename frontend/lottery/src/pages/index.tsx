import Image from "next/image"
import { Inter } from "next/font/google"
import LotteryEntrance from "../../components/LotteryEntrance"


import Head from "../../node_modules/next/head"
import Header from "../../components/Header"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
    return (
        <div>
            <Head>
                <title>Smart Contract lottery</title>
            </Head>
            <Header />
            <LotteryEntrance/>
        </div>
    )
}
