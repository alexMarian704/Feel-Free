import React, { useEffect, useState } from 'react';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import style from "../styles/Transactions.module.css"

export default function GetTransactions({ chain , userETHaddress }) {
    const { user } = useMoralis();
    const [hTransaction, setHTransaction] = useState([]);

    useEffect(async () => {
        if (chain) {
            const options = {
                chain: chain === "eth" ? "0x4" : chain === "bsc" ? "0x61" : "mumbai", address: userETHaddress, order: "desc", from_block: "0"
            };
            const transactions = await Moralis.Web3API.account.getTransactions(options);
            console.log(transactions.result);
            setHTransaction(transactions.result);
        }
    }, [chain])

    return (
        <div className={style.main}>
            {hTransaction.length > 0 &&
                <div className={style.container}>
                    <h2>Your transactions</h2>
                    {hTransaction.map((x) => (
                        <div key={x.hash} className={style.data}>
                            <p><span>Hash:</span> {x.hash}</p>
                            <p><span>Block timestamp:</span> {x.block_timestamp}</p>
                            <p><span>To address:</span> {x.to_address}</p>
                        </div>
                    ))}
                </div>
            }
            {hTransaction.length === 0 && <div>
                <div className={style.container}>
                    <h2>You have 0 transactions</h2>
                </div>
            </div> }
        </div>
    )
}