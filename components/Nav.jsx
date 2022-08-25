import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMoralis, useChain } from "react-moralis";
import useWindowDimensions from "../function/width";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBars, faLock } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import polygon from "../public/polygon.jpg";
import binance from "../public/binance.png";
import ethereum from "../public/ethereum.png";
import { Moralis } from "moralis";
import { userStatus } from "../function/userStatus";
import { detectMobile } from "../function/detectMobile";

export default function Nav({
  getBalance,
  userETHaddress,
  setBalance,
  balance,
}) {
  const {
    isAuthenticated,
    logout,
    setUserData,
    user,
    isWeb3EnableLoading,
    isWeb3Enabled,
    enableWeb3,
    chainId
  } = useMoralis();
  const chainUser = user.get("chain");
  const [navIn, setNavIn] = useState("in");
  const router = useRouter();
  const [chainOption, setChainOption] = useState(false);
  const { switchNetwork } = useChain();

  useEffect(() => {
    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      enableWeb3();
    }
  }, []);

  const logOutUser = () => {
    logout();
    router.push("/");
  };

  const { width } = useWindowDimensions();

  const changeNav = () => {
    document.getElementById("nav").className = "nav-in";
    setNavIn("in");
  };

  const changeNavOut = () => {
    document.getElementById("nav").className = "nav-out";
    setNavIn("out");
  };

  const changeChain = (x) => {
    if (x === "eth") {
      document.getElementsByClassName("dropdown-content")[0].id = "in-dropdown";
      setChainOption(false);
      setUserData({
        chain: "eth",
      });
      enableWeb3({ onComplete: () => switchNetwork("0x4") });
      if (balance === true)
        getBalance(userETHaddress).then((result) => {
          setBalance(result);
        });
    } else if (x === "bsc") {
      //setChain("bsc");
      document.getElementsByClassName("dropdown-content")[0].id = "in-dropdown";
      setChainOption(false);
      setUserData({
        chain: "bsc",
      });
      //0x38 bsc mainnet
      enableWeb3({ onComplete: () => switchNetwork("0x61") });
      if (balance === true)
        getBalance(userETHaddress).then((result) => {
          setBalance(result);
        });
    } else {
      //setChain("polygon");
      document.getElementsByClassName("dropdown-content")[0].id = "in-dropdown";
      setChainOption(false);
      setUserData({
        chain: "polygon",
      });
      //0x89 polygon mainnet
      enableWeb3({ onComplete: () => switchNetwork("0x13881") });
      if (balance === true)
        getBalance(userETHaddress).then((result) => {
          setBalance(result);
        });
    }
  };

  useEffect(() => {
    const d = new Date();
    let time = d.getTime();
    if ((time - user.get("time")) / 1000 / 60 / 60 >= 15 && (user.get("reCheck") === 2 || user.get("reCheck") === undefined)) {
      setUserData({
        reCheck: 1
      })
    }
    Moralis.LiveQuery.close()
  }, [])

  const lockAccount = () => {
    const d = new Date();
    let time = d.getTime();
    setUserData({
      reCheck: 1,
      time: time
    })
  }

  return (
    <nav className="nav-in" id="nav">
      {width < 791 && navIn === "out" && (
        <button className="close-nav" onClick={changeNav}>
          <FontAwesomeIcon icon={faTimes} color="#800040" />
        </button>
      )}

      {width < 791 && navIn === "in" && (
        <button className="open-nav" onClick={changeNavOut}>
          <FontAwesomeIcon icon={faBars} color="#800040" />
        </button>
      )}

      <div id="nav-container" onClick={userStatus}>
        <Link href="/">
          <h1>Feel Free</h1>
        </Link>
        <Link href="/transfer">
          <h2>Transfer</h2>
        </Link>
        <Link href="/search">
          <h2>Search</h2>
        </Link>
        <Link href="/swap">
          <h2>Swap</h2>
        </Link>
        <Link href="/profile">
          <h2>Profile</h2>
        </Link>
        <div className="dropdown">
          <div
            className="dropbtn"
            onClick={() => {
              if (detectMobile() === false) {
                if (chainOption === false) {
                  document.getElementsByClassName("dropdown-content")[0].id =
                    "out-dropdown";
                  setChainOption(true);
                } else {
                  document.getElementsByClassName("dropdown-content")[0].id =
                    "in-dropdown";
                  setChainOption(false);
                }
              }
            }}
          >
            {" "}
            <Image
              src={chainId === "0x4" ? ethereum : chainId === "0x61" ? binance : polygon}
              width="35"
              height="35"
              className="dropdown-image"
            />
            {chainId === "0x4"
              ? "Ethereum"
              : chainId === "0x61"
                ? "Binance"
                : "Polygon"}
          </div>
          <div className="dropdown-content" id="in-dropdown">
            <a onClick={() => changeChain("eth")}>
              <Image
                src={ethereum}
                width="35"
                height="35"
                className="dropdown-image"
              />{" "}
              Ethereum
            </a>
            <a onClick={() => changeChain("bsc")}>
              <Image
                src={binance}
                width="35"
                height="35"
                className="dropdown-image"
              />{" "}
              Binance
            </a>
            <a onClick={() => changeChain("polygon")}>
              <Image
                src={polygon}
                width="35"
                height="35"
                className="dropdown-image"
              />{" "}
              Polygon
            </a>
          </div>
        </div>
      </div>
      <div className="right-nav">
        <button className="lockAccount" onClick={lockAccount}><FontAwesomeIcon icon={faLock} /></button>
        <button onClick={logOutUser} className="logOutNav">
          Log out
        </button>
      </div>
    </nav>
  );
}
