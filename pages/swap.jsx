import React, { useEffect } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import style from "../styles/Swap.module.css";

export default function swap() {
  const { isAuthenticated, user } = useMoralis();

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }

  useEffect(() => {
    async function getTokens() {
      await Moralis.initPlugins();
      await Moralis.enable();
      const tokens = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: "eth",
      });
      console.log(tokens.tokens);
    }
    getTokens();
  }, []);

  return (
    <div>
      <Head>
        <title>Swap</title>
      </Head>
      <Nav />
      <div className="marginDiv"></div>
      <div className={style.swap}>
        <h2>Swap</h2>
        <div className={style.inputContainer}>
          <input type="number" className={style.input} placeholder="0.0"  min="0"/>
          <input type="number" className={style.input} />
        </div>
        <div className={style.inputContainer}>
          <input type="number" className={style.input}  placeholder="0.0" min="0"/>
          <input type="number" className={style.input} />
        </div>
        <div className={style.alignBut}>
          <button className={style.buttonSwap}>Swap</button>
        </div>
      </div>
    </div>
  );
}
