import React, { useEffect, useState } from 'react';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import style from "../styles/Transactions.module.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleDown, faArrowCircleUp } from "@fortawesome/free-solid-svg-icons";

export default function GetTransactions({ chain, userETHaddress }) {
    const { user } = useMoralis();
    const [hTransaction, setHTransaction] = useState([]);
    const [open, setOpen] = useState("");
    const [loading, setLoading] = useState(false)

    useEffect(async () => {
        if (chain) {
            setLoading(true);
            const options = {
                chain: chain === "eth" ? "0x4" : chain === "bsc" ? "0x61" : "mumbai", address: userETHaddress, order: "desc", from_block: "0"
            };
            const transactions = await Moralis.Web3API.account.getTransactions(options);
            console.log(transactions.result);
            setHTransaction(transactions.result);
            setLoading(false);
        }
    }, [chain])

    return (
        <div className={style.main}>
            {hTransaction.length > 0 && loading === false &&
                <div className={style.container}>
                    <h2>Your transactions</h2>
                    {hTransaction.map((x) => {
                        if (open !== x.hash) {
                            return (
                                <div key={x.hash} className={style.data}>
                                    <p><span>Hash:</span> {x.hash}</p>
                                    <p><span>Block timestamp:</span> {x.block_timestamp}</p>
                                    <p><span>To address:</span> {x.to_address}</p>
                                    <div className={style.more}>
                                        <button><FontAwesomeIcon icon={faArrowCircleDown} onClick={() => setOpen(x.hash)} /></button>
                                    </div>
                                </div>
                            )
                        } else {
                            return (
                                <div key={x.hash} className={style.data} id={style.openContainer}>
                                    <p><span>Hash:</span> {x.hash}</p>
                                    <p><span>Block timestamp:</span> {x.block_timestamp}</p>
                                    <p><span>To address:</span> {x.to_address}</p>

                                    <p><span>Block hash:</span> {x.block_hash}</p>
                                    <p><span>Block number:</span> {x.block_number}</p>
                                    <p><span>Blcock timestamp:</span> {x.block_timestamp}</p>
                                    <p><span>Gas price:</span> {x.gas_price}</p>
                                    <section><span>Input:</span><h3 className={style.input}>{x.input}</h3></section>
                                    <div className={style.more}>
                                        <button><FontAwesomeIcon icon={faArrowCircleUp} onClick={() => setOpen("")} /></button>
                                    </div>
                                </div>
                            )
                        }
                    })}
                </div>
            }
            {hTransaction.length === 0 && loading === false && <div>
                <div className={style.container}>
                    <h2>You have 0 transactions</h2>
                </div>
            </div>}
            {loading && <div className={style.loadingContainer}>
                <div className={style.loader}></div>
            </div>}
        </div>
    )
}