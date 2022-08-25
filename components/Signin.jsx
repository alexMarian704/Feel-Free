import React, { useState, useEffect } from "react";
import { useMoralis } from "react-moralis";
import metamask from "../public/metamask.png";
import walletconnect from "../public/walletconnect.png";
import WC from "../public/WC.png";
import Image from "next/image";
import Head from "next/head";
import { Moralis } from "moralis";

export default function SignIn() {
  const { authenticate, authError, isWeb3EnableLoading, isWeb3Enabled, enableWeb3, chainId } = useMoralis();
  const [navSignIn, setNavSignIn] = useState("metamask");
  const [error , setError] = useState("")

  useEffect(() => {
    if (!isWeb3Enabled && !isWeb3EnableLoading) {
      enableWeb3()
    }
  }, [])

  const signInFunction = () => {
    if (chainId === "0x4" || chainId === "0x61" || chainId === "0x13881") {
      authenticate({
        signingMessage: "Welcome !",
      });
    }else{
      setError("Unsupported chain, please switch to ETH, BNB or POLYGON")
    }
  };

  const walletConnectSignIn = () => {
    const user = authenticate({
      provider: "walletconnect",
      signingMessage: "Welcome !",
    });
  };

  const changeSignIn = () => {
    if (navSignIn === "metamask")
      setNavSignIn("walletconnect")
    else
      setNavSignIn("metamask")
  }

  return (
    <div className="container">
      <Head>
        <title>Sign In</title>
      </Head>
      {navSignIn === "metamask" && (
        <div className="signIn">
          <div className="signInNav">
            <button className="navButSelect">Meta Mask</button>
            <button className="navBut" onClick={changeSignIn}>Wallet Connect</button>
          </div>
          <h2 className="signText">Sign In with MetaMask</h2>
          <Image src={metamask} alt="metamask" className="imgMeta" />
          <button onClick={signInFunction} className="signinBut">
            Sign In
          </button>
          {authError && <h2 className="signInError">{authError.message}</h2>}
          {error && <h2 className="signInError">{error}</h2>}
        </div>
      )}
      {navSignIn === "walletconnect" && (
        <div className="signIn">
          <div className="signInNav">
            <button className="navBut" onClick={changeSignIn}>Meta Mask</button>
            <button className="navButSelect">Wallet Connect
            </button>
          </div>
          <h2 className="signText">Sign In with Wallet Connect</h2>
          <Image src={WC} alt="walletconnect" className="imgMeta" />
          <button onClick={walletConnectSignIn} className="signinBut">
            Wallet Connect
          </button>
        </div>
      )}
    </div>
  );
}
