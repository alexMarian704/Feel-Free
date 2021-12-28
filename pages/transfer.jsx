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
import {
  faCopy,
  faArrowLeft,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function Transfer() {
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const { user, isAuthenticated, web3 } = useMoralis();
  const [errorSend, setErrorSend] = useState("");
  Moralis.enableWeb3();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [balance, setBalance] = useState(0);

  const { fetch, error, isFetching } = useWeb3Transfer({
    amount: Moralis.Units.Token(Number(amount) , "18"),
    receiver: to,
    type: "erc20",
    contractAddress:"0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0"
  });

  useEffect(() => {
    setAmount("");
    setTo("");
    setConfirm(false);
    setErrorSend("");
  }, [isFetching, error]);

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }

  const userETHaddress = user.get("ethAddress");

  let userBalance;
  const getBalance = async () => {
    const balances = await Moralis.Web3API.account.getNativeBalance({
      chain:"mumbai",
      address: userETHaddress,
    });
    userBalance = (balances.balance / 1000000000000000000).toFixed(5);
    setBalance(userBalance);
  };
  getBalance();

  const CopyFunction = () => {
    navigator.clipboard.writeText(userETHaddress);
  };

  const validTransaction = () => {
    if (amount > 0 && web3.utils.isAddress(to)) {
      setConfirm(true);
      setErrorSend("");
    } else if (amount <= 0) {
      setErrorSend("Invalid amount");
    } else if (web3.utils.isAddress(to) === false) {
      setErrorSend("Invalid ethereum address");
    }
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
          <p className={style.label}>Your MATIC address</p>
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
          <p className={style.address}>Balance: {balance} MATIC</p>
        </div>
        <br />
        <div className={style.align}>
          <label className={style.label}>Amount</label>
          <br />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            //className="setUpInput"
            id={style.input}
            placeholder="0.0 MATIC"
            min="0"
            autoComplete="off"
          />
        </div>
        <div className={style.align}>
          <label className={style.label}>To</label>
          <br />
          <div className={style.toDiv}>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              // className="setUpInput"
              placeholder="To"
              id={style.input}
              autoComplete="off"
            />
            <button className={style.deleteBut} onClick={()=> setTo("")}>
              <FontAwesomeIcon icon={faTimes} color="#800040"  className={style.deleteButHover}/>
            </button>
          </div>
        </div>
        <div className={style.alignButton}>
          <button
            onClick={validTransaction}
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
        {confirm === true && isFetching === false && (
          <div className={style.transferConfirm}>
            <div className={style.alignDiv}>
              <button
                onClick={() => setConfirm(false)}
                className={style.backBut}
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  color="#800040"
                  className={style.copyButton}
                />
              </button>
              <p className={style.text}>From: {userETHaddress}</p>
              <p className={style.text}>To: {to}</p>
              <p className={style.text}>Amount: {amount} MATIC</p>
              <div className={style.alignButton}>
                <button
                  onClick={fetch}
                  disabled={isFetching}
                  className="setUpBut"
                  id={style.button}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        {error && <p className={style.error}>{error.message}</p>}
        {errorSend && <p className={style.error}>{errorSend}</p>}
      </div>
    </div>
  );
}
