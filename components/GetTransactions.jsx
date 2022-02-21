import React, { useEffect, useState } from 'react';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import style from "../styles/Transactions.module.css"

export default function GetTransactions({ chain }) {
    const { user } = useMoralis();

    useEffect(async () => {
        if (chain) {
            const options = {
                chain: chain === "eth" ? "0x4" : chain === "bsc" ? "0x61" : "mumbai", address: "0x0779896A4C93B04D83355A18a4BB092FcAe4BB0e", order: "desc", from_block: "0"
            };
            const transactions = await Moralis.Web3API.account.getTransactions(options);
            console.log(transactions.result);
        }
    }, [chain])

    return (
        <div className={style.main}>

        </div>
    )
}