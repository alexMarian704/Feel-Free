import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis, useTokenPrice } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import Image from "next/image";
import style from "../styles/Swap.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import data from "../data/swapdata";

export default function swap() {
  const { isAuthenticated, user } = useMoralis();
  const [coins, setCoins] = useState([]);
  const [to, setTo] = useState({
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    decimals: 6,
    logo: "https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
    name: "USD Coin",
    symbol: "USDC",
  });
  const [from, setFrom] = useState({
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    decimals: 18,
    logo: "https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png",
    name: "MATIC",
    symbol: "MATIC",
  });
  const [vSelect, setVSelect] = useState(false);
  const [amount, setAmount] = useState("");
  const [amount2, setAmount2] = useState("");
  const [k, setK] = useState(0);
  const [gas, setGas] = useState(0);
  const [search, setSearch] = useState("");
  const [searchArray, setSearchArray] = useState([]);

  let selectedChain;
  if (user) {
    selectedChain = user.get("chain");
  }

  async function getTokens() {
    // await Moralis.enableWeb3();
    await Moralis.initPlugins();
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({
      chain:
        selectedChain === "eth"
          ? "eth"
          : selectedChain === "bsc"
          ? "bsc"
          : "polygon",
    });
    let array = [];
    const tokens = result.tokens;
    for (const address in tokens) {
      array.push({
        address: tokens[address].address,
        decimals: tokens[address].decimals,
        logo: tokens[address].logoURI,
        name: tokens[address].name,
        symbol: tokens[address].symbol,
      });
    }
    setCoins([...array]);
  }

  // const getTokenPrice = async ()=>{
  //   let price = await Moralis.Web3API.token.getTokenPrice({address : from.address , chain:"eth" , exchange:"uniswap-v3"})
  //   console.log(price);
  // }

  useEffect(() => {
    if (user) {
      if (selectedChain === "eth") {
        setFrom(data[2][0]);
        setTo(data[2][1]);
        setVSelect(false);
        setAmount("");
        setAmount2("");
        setGas(0);
        setSearchArray([]);
        setSearch("");
      } else if (selectedChain === "bsc") {
        setFrom(data[1][0]);
        setTo(data[1][1]);
        setVSelect(false);
        setAmount("");
        setAmount2("");
        setGas(0);
        setSearchArray([]);
        setSearch("");
      } else {
        setFrom(data[0][1]);
        setTo(data[0][0]);
        setVSelect(false);
        setAmount("");
        setAmount2("");
        setGas(0);
        setSearchArray([]);
        setSearch("");
      }
      getTokens();
    }
  }, [user, selectedChain]);

  const changeAmount = async (e) => {
    if (Number(e) !== 0) {
      const quote = await Moralis.Plugins.oneInch.quote({
        chain:
          selectedChain === "eth"
            ? "eth"
            : selectedChain === "bsc"
            ? "bsc"
            : "polygon",
        fromTokenAddress: `${from.address}`,
        toTokenAddress: `${to.address}`,
        amount: Moralis.Units.Token(Number(e), from.decimals).toString(),
      });
      setAmount2(
        (quote.toTokenAmount / 10 ** quote.toToken.decimals).toFixed(7)
      );
      setGas(quote.estimatedGas);
    } else {
      setAmount2("");
      setGas(0);
    }
  };

  const changeAmount2 = async (e) => {
    if (Number(e) !== 0) {
      const quote = await Moralis.Plugins.oneInch.quote({
        chain:
          selectedChain === "eth"
            ? "eth"
            : selectedChain === "bsc"
            ? "bsc"
            : "polygon",
        fromTokenAddress: `${from.address}`,
        toTokenAddress: `${to.address}`,
        amount: Moralis.Units.Token(1, from.decimals).toString(),
      });
      let fromToken = (
        quote.toTokenAmount /
        10 ** quote.toToken.decimals
      ).toFixed(7);
      setAmount(e / fromToken);
      setGas(quote.estimatedGas);
    } else {
      setAmount("");
      setGas(0);
    }
  };

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
    chain:
      selectedChain === "eth"
        ? "eth"
        : selectedChain === "bsc"
        ? "bsc"
        : "polygon",
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
    if (k === 1) {
      setFrom(token);
      setVSelect(false);
      setAmount("");
      setAmount2("");
      setGas(0);
      setSearchArray([]);
      setSearch("");
    } else {
      setTo(token);
      setVSelect(false);
      setAmount("");
      setAmount2("");
      setGas(0);
      setSearchArray([]);
      setSearch("");
    }
  };

  const changeToken = (k) => {
    setVSelect(true);
    if (k == 1) {
      setK(1);
    } else {
      setK(2);
    }
  };

  const wordSearch = (str, word) => {
    let count = 0;
    for (let i = 0; i < str.length; i++) {
      for (let j = 0; j < word.length; j++) {
        if (word[j] !== str[i + j]) break;
        if (j === word.length - 1) count++;
      }
    }
    return count;
  };

  const coinSearch = (text) => {
    setSearch(text);
    if (text !== "") {
      let array = [];
      coins.map((w) => {
        if (
          wordSearch(w.name.toLowerCase(), text.toLowerCase()) !== 0 ||
          wordSearch(w.symbol.toLowerCase(), text.toLowerCase()) !== 0
        ) {
          array.push(w);
        }
      });
      setSearchArray(array);
    } else {
      setSearchArray([]);
    }
  };

  return (
    <div>
      <Head>
        <title>Swap</title>
      </Head>
      <Nav balance={false} />
      <div className="marginDiv"></div>
      {vSelect === false && (
        <div className={style.swap}>
          <h2>Swap</h2>
          <div className={style.inputContainer}>
            <input
              type="number"
              className={style.input}
              placeholder="0.0"
              min="0"
              value={amount}
              onBlur={(e) => changeAmount(e.target.value)}
              onChange={(e) => setAmount(e.target.value)}
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
              value={amount2}
              onBlur={(e) => changeAmount2(e.target.value)}
              onChange={(e) => setAmount2(e.target.value)}
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
        </div>
      )}
      {vSelect === false && (
        <div className={style.swapDetails}>
          <div className={style.oneinchContainer}>
            <p className={style.details}>Powered by 1inch </p>
            <Image
              src="https://tokens.1inch.io/0x111111111117dc0aa78b770fa6a738034120c302.png"
              alt="1inch"
              width="30%"
              height="30%"
              className={style.tokenImage}
            />
          </div>
          {gas > 0 && <p className={style.details}>Estimated Gas: {gas}</p>}
        </div>
      )}
      {vSelect === true && (
        <div className={style.tokensContainer}>
          <button className={style.closeBut} onClick={() => setVSelect(false)}>
            <FontAwesomeIcon
              icon={faTimes}
              color="#800040"
              className={style.closeTime}
            />
          </button>
          <h3>Select a token</h3>
          <input
            type="text"
            placeholder="Name"
            className={style.searchInput}
            value={search}
            onChange={(e) => coinSearch(e.target.value)}
          />
          <div className={style.alignContainer}>
            {coins.length > 0 &&
              searchArray.length === 0 &&
              search === "" &&
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
            {searchArray.length > 0 &&
              searchArray.map((token, i) => {
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
            {search !== "" && searchArray.length === 0 && (
              <p className={style.noResult}>No result found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
