import React, { useState, useEffect } from "react";
import { useMoralis, useWeb3Transfer } from "react-moralis";
import { Moralis } from "moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import Head from "next/head";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import style from "../styles/Transfer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

export default function Transfer() {
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const { user, isAuthenticated, logout } = useMoralis();
  const [errorSend, setErrorSend] = useState("");
  const web3 = Moralis.enableWeb3();
  const router = useRouter();

  const { fetch, error, isFetching } = useWeb3Transfer({
    amount: Moralis.Units.ETH(Number(amount)),
    receiver: to,
    type: "native",
  });

  useEffect(() => {
    setAmount("");
    setTo("");
  }, [isFetching]);

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }

  const userETHaddress = user.get("ethAddress");

  const setAmountETH = (e) => {
    setAmount(e.target.value);
  };

  const CopyFunction = () => {
    navigator.clipboard.writeText(userETHaddress);
  };

  return (
    <div>
      <Head>
        <title>Transfer</title>
      </Head>
      <Nav />
      <div className="marginDiv"></div>
      <div className={style.transfer}>
        <div className={style.align}>
          <p className={style.label}>Your ETH address</p>
          <div className={style.addressContainer}>
            <p className={style.address}>{userETHaddress}</p>
            <button onClick={CopyFunction}>
              <FontAwesomeIcon
                icon={faCopy}
                color="#800040"
                className={style.copyButton}
              />
            </button>
          </div>
        </div>
        <br />
        <div className={style.align}>
          <label className={style.label}>Amount</label>
          <br />
          <input
            type="number"
            value={amount}
            onChange={setAmountETH}
            className="setUpInput"
            id={style.input}
            placeholder="0.0"
            min="0"
            autoComplete="off"
          />
        </div>
        <div className={style.align}>
          <label className={style.label}>To</label>
          <br />
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="setUpInput"
            id={style.input}
            autoComplete="off"
          />
        </div>
        <div className={style.alignButton}>
          <button
            onClick={fetch}
            disabled={isFetching}
            className="setUpBut"
            id={style.button}
          >
            Send
          </button>
        </div>
        {isFetching === true && (
            <div className={style.loadingContainer}>
              <div className={style.loader}></div>
            </div>
          )}
        {error && <h3>{error.message}</h3>}
      </div>
    </div>
  );
}
