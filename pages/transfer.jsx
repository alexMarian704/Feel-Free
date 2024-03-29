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
import { getBalance } from "../function/balance";
import Web3 from 'web3'
import TransferNFT from "../components/TransferNFT";
import GetTransactions from "../components/GetTransactions";
import CheckPassword from "../components/CheckPassword";
import Notifications from "../components/Notifications";
import { userStatus } from "../function/userStatus";
import { useInternetConnection } from "../function/hooks/useInternetConnection";
import OfflineNotification from "../components/OfflineNotification";
import UnsupportedChain from "../components/UnsupportedChain";

export default function Transfer({ tag }) {
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const { user, isAuthenticated, isWeb3EnableLoading, isWeb3Enabled, enableWeb3, chainId, isInitialized } = useMoralis();
  const [errorSend, setErrorSend] = useState("");
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [balance, setBalance] = useState(0);
  const [fetchBalance, setFetchBalance] = useState(false);
  const [toTag, setToTag] = useState("");
  const [transferMode, setTransferMode] = useState("Token")
  const [tagList, setTagList] = useState([]);
  const [openTagList, setOpenTagList] = useState(false);
  const internetStatus = useInternetConnection()

  const { fetch, error, isFetching } = useWeb3Transfer({
    amount: Moralis.Units.ETH(Number(amount)),
    receiver: to,
    type: "native",
  });

  useEffect(() => {
    if (isAuthenticated && chainId !== null) {
      getBalance(userETHaddress, chainId).then((result) => {
        setBalance(result);
      });
      getFriend();
    }
  }, [isAuthenticated, chainId])

  useEffect(() => {
    setAmount("");
    setTo("");
    setConfirm(false);
    setErrorSend("");
  }, [isFetching, error]);

  useEffect(() => {
    if (tag !== undefined) {
      setTo("@" + tag);
    }
  }, [tag])

  if (isInitialized === false)
    return (
      <div>
        <div className={style.loadingContainer}>
          <div className={style.loader}></div>
        </div>
      </div>
    )
  else if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false || user.get("passwordConfig") === undefined ||
    user.get("passwordConfig") === false
  ) {
    return <ConfigAccount />;
  }
  if (user.get("reCheck") === 1) return <CheckPassword />

  const userETHaddress = user.get("ethAddress");

  const CopyFunction = () => {
    navigator.clipboard.writeText(userETHaddress);
  };

  const validTransaction = () => {
    if (to[0] !== "@") {
      if (amount > 0 && Web3.utils.isAddress(to) && amount <= balance) {
        setConfirm(true);
        setErrorSend("");
        setToTag("");
      } else if (amount <= 0 || amount > balance) {
        setErrorSend("Invalid amount");
      } else if (Web3.utils.isAddress(to) === false) {
        setErrorSend("Invalid address");
      }
    } else {
      if (amount > 0 && amount <= balance) {
        const getTag = async () => {
          const addressToTag = Moralis.Object.extend("Tags");
          const query = new Moralis.Query(addressToTag);
          query.equalTo("userTag", to.replace("@", ""));
          const results = await query.first();
          if (results !== undefined) {
            setTo(results.attributes.ethAddress);
            setToTag(to);
            setConfirm(true);
            setErrorSend("");
          } else {
            setErrorSend("Invalid tag");
          }
        };
        getTag();
      } else {
        setErrorSend("Invalid amount");
      }
    }
  };

  const backTag = () => {
    setConfirm(false)
    if (toTag) {
      setTo(toTag)
    }
  }

  const getFriend = async () => {
    const UserFriends = Moralis.Object.extend("Friends");
    const query = new Moralis.Query(UserFriends);
    query.equalTo("ethAddress", user.get("ethAddress"));
    const result = await query.first();
    if (result.attributes.friendsArray.length > 0) {
      let array = []
      for (let i = 0; i < result.attributes.friendsArray.length; i++) {
        const addressToTag = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(addressToTag);
        query.equalTo("ethAddress", result.attributes.friendsArray[i]);
        const results = await query.first();
        if (results !== undefined) {
          array.push(results.attributes);
        }
      }
      setTagList(array);
    }
  }

  return (
    <div>
      <Head>
        <title>Transfer</title>
      </Head>
      <Nav
        getBalance={getBalance}
        userETHaddress={userETHaddress}
        setBalance={setBalance}
        balance={true}
      />
      <div className="marginDiv" onClick={() => setOpenTagList(false)}></div>
      <div className={style.transferMode} onClick={userStatus}>
        <div onClick={() => setTransferMode("Token")}><p>Transfer Coins</p></div>
        <div onClick={() => { setTransferMode("NFT"), setOpenTagList(false) }}><p>Transfer NFTs</p></div>
      </div>
      {transferMode === "NFT" && <TransferNFT userETH={userETHaddress} selectedChain={chainId} style={style} />}
      {transferMode === "Token" && <div className={style.transfer}>
        <div className={style.align} onClick={() => setOpenTagList(false)}>
          <p className={style.label}>
            Your{" "}
            {chainId === "0x4"
              ? "ETH"
              : chainId === "0x61"
                ? "BNB"
                : "MATIC"}{" "}
            address
          </p>
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
          <p className={style.address}>
            Balance: {balance}{" "}
            {chainId === "0x4"
              ? "ETH"
              : chainId === "0x61"
                ? "BNB"
                : "MATIC"}
          </p>
        </div>
        <br />
        <div className={style.align} onClick={() => setOpenTagList(false)}>
          <label className={style.label}>Amount</label>
          <br />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            id={style.input}
            placeholder={
              chainId === "0x4"
                ? "0.0 ETH"
                : chainId === "0x61"
                  ? "0.0 BNB"
                  : "0.0 MATIC"
            }
            min="0"
            autoComplete="off"
            onClick={userStatus}
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
              placeholder="Address or tag"
              id={style.input}
              autoComplete="off"
              onClick={userStatus}
              onFocus={() => setOpenTagList(true)}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  setOpenTagList(false);
                }
              }}
            />
            <button className={style.deleteBut} onClick={() => { setTo(""), setOpenTagList(false) }}>
              <FontAwesomeIcon
                icon={faTimes}
                color="#800040"
                className={style.deleteButHover}
              />
            </button>
          </div>
          {openTagList === true && tagList.length > 0 &&
            <div className={style.listContainer}>
              {tagList.map((friend) => (
                <div key={friend.userTag} className={style.listElement} onClick={() => { setTo(`@${friend.userTag}`), setOpenTagList(false) }}>
                  <p>@{friend.userTag}</p>
                </div>
              ))}
              <div className={style.closeListContainer}><button onClick={()=> setOpenTagList(false)}><FontAwesomeIcon
                icon={faTimes}
              /></button></div>
            </div>}
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
                onClick={backTag}
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
              {toTag && <p className={style.text}>Tag: {toTag}</p>}
              <p className={style.text}>
                Amount: {amount}{" "}
                {chainId === "0x4"
                  ? "ETH"
                  : chainId === "0x61"
                    ? "BNB"
                    : "MATIC"}
              </p>
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
      </div>}
      <GetTransactions chain={chainId} userETHaddress={userETHaddress} setOpenTagList={setOpenTagList} />
      <Notifications />
      {internetStatus === false && <OfflineNotification />}
      {(chainId !== null && chainId !== "0x4" && chainId !== "0x61" && chainId !== "0x13881") && <UnsupportedChain />}
    </div>
  );
}
