import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import style from "../styles/Swap.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export default function swap() {
  const { isAuthenticated, user } = useMoralis();
  const [coins, setCoins] = useState([]);
  const [to, setTo] = useState({
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    name: "USD Coin",
    symbol: "USDC",
  });
  const [from, setFrom] = useState({
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    decimals: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    logo: "https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png",
    name: "Ethereum",
    symbol: "ETH",
  });
  const [vSelect, setVSelect] = useState(false);
  const [amount, setAmount] = useState(0);
  const [k , setK] = useState(0);

  useEffect(() => {
    async function getTokens() {
      await Moralis.enableWeb3();
      await Moralis.initPlugins();
      const result = await Moralis.Plugins.oneInch.getSupportedTokens({
        chain: "eth",
      });
      let array = [];
      const tokens = result.tokens;
      for (const address in tokens) {
        array.push({
          address: tokens[address].address,
          decimals: tokens[address].address,
          logo: tokens[address].logoURI,
          name: tokens[address].name,
          symbol: tokens[address].symbol,
        });
      }
      setCoins([...array]);
    }
    getTokens();
  }, []);

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }

  const userETHaddress = user.get("ethAddress");

  const options = {
    chain: "eth",
    fromTokenAddress: `${from.address}`,
    toTokenAddress: `${to.address}`,
    amount: Moralis.Units.ETH(Number(amount)),
    fromAddress: `${userETHaddress}`,
    slippage: 1,
  };

  const swapToken = async () => {
    await Moralis.initPlugins();
    const dex = Moralis.Plugins.oneInch;
    const log = await dex.swap(options);
    console.log(log);
  };

  const selectToken = (token) => {
    if(k === 1){
      setFrom(token)
      setVSelect(false);
    }else{
      setTo(token)
      setVSelect(false);
    }
  };

  const changeToken = (k) => {
    setVSelect(true);
    if (k == 1) {
      setK(1);
    } else {
      setK(2)
    }
  };

  return (
    <div>
      <Head>
        <title>Swap</title>
      </Head>
      <Nav />
      <div className="marginDiv"></div>
      {vSelect === false && <div className={style.swap}>
        <h2>Swap</h2>
        <div className={style.inputContainer}>
          <input
            type="number"
            className={style.input}
            placeholder="0.0"
            min="0"
          />
          <button
            className={style.selectedToken}
            onClick={() => changeToken(1)}
          >
            <Image
              src={from.logo}
              alt={from.name}
              width="35%"
              height="35%"
              className={style.tokenImage}
            />
            <p className={style.text}>{from.symbol}</p>
          </button>
        </div>
        <div className={style.inputContainer}>
          <input
            type="number"
            className={style.input}
            placeholder="0.0"
            min="0"
          />
          <button
            className={style.selectedToken}
            onClick={() => changeToken(2)}
          >
            <Image
              src={to.logo}
              alt={to.name}
              width="35%"
              height="35%"
              className={style.tokenImage}
            />
            <p className={style.text}>{to.symbol}</p>
          </button>
        </div>
        <div className={style.alignBut}>
          <button className={style.buttonSwap} onClick={swapToken}>
            Swap
          </button>
        </div>
      </div>}
      {vSelect === true && (
        <div className={style.tokensContainer}>
          <button className={style.closeBut} onClick={() => setVSelect(false)}>
            <FontAwesomeIcon icon={faTimes} color="#800040" className={style.closeTime}/>
          </button>
          <div className={style.alignContainer}>
            {coins.length > 0 &&
              coins.map((token, i) => {
                return (
                  <div
                    key={i}
                    className={style.token}
                    onClick={() => selectToken(token)}
                  >
                    <Image
                      src={token.logo}
                      alt={token.name}
                      width="50%"
                      height="50%"
                      className={style.tokenImage}
                    />
                    <div className={style.nameToken}>
                      <p className={style.text}>{token.name}</p>
                      <p className={style.textSymbol}>{token.symbol}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
