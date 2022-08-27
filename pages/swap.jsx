import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import Head from "next/head";
import { useMoralis, useTokenPrice } from "react-moralis";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import { Moralis } from "moralis";
import style from "../styles/Swap.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPercent, faSync } from "@fortawesome/free-solid-svg-icons";
import data from "../data/swapdata";
import CheckPassword from "../components/CheckPassword";
import Notifications from "../components/Notifications";
import { userStatus } from "../function/userStatus";
import { useInternetConnection } from "../function/hooks/useInternetConnection";
import OfflineNotification from "../components/OfflineNotification";
import UnsupportedChain from "../components/UnsupportedChain";


export default function swap() {
  const { isAuthenticated, user, isInitialized, chainId } = useMoralis();
  const internetStatus = useInternetConnection()
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
  const [slippage, setSlippage] = useState(1);
  const [aux, setAux] = useState("");
  const [auxAmount, setAuxAmount] = useState(0);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  async function getTokens() {
    await Moralis.initPlugins();
    const result = await Moralis.Plugins.oneInch.getSupportedTokens({
      chain:
        chainId === "0x4"
          ? "eth"
          : chainId === "0x61"
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

  //0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270 matic
  //0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 eth
  //0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c bnb

  const getToPrice = async () => {
    if (isInitialized && isAuthenticated) {
      if (to.symbol === "MATIC" || to.symbol === "ETH" || to.symbol === "BNB") {
        let price = await Moralis.Web3API.token.getTokenPrice({
          address: to.symbol === "MATIC" ? "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" : to.symbol === "ETH" ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" : "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", chain: chainId === "0x4"
            ? "eth"
            : chainId === "0x61"
              ? "bsc"
              : "polygon",
        }).then((x) => {
          setPriceTo(x.usdPrice.toFixed(2))
        }).catch((err) => {
          console.log(err)
        })
      } else {
        let price = await Moralis.Web3API.token.getTokenPrice({
          address: to.address, chain: chainId === "0x4"
            ? "eth"
            : chainId === "0x61"
              ? "bsc"
              : "polygon",
        }).then((x) => {
          setPriceTo(x.usdPrice.toFixed(2))
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }

  const getFromPrice = async () => {
    if (isInitialized && isAuthenticated) {
      if (from.symbol === "MATIC" || from.symbol === "ETH" || from.symbol === "BNB") {
        let price2 = await Moralis.Web3API.token.getTokenPrice({
          address: from.symbol === "MATIC" ? "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" : from.symbol === "ETH" ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" : "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", chain: chainId === "0x4"
            ? "eth"
            : chainId === "0x61"
              ? "bsc"
              : "polygon",
        }).then((x) => {
          setPriceFrom(x.usdPrice.toFixed(2));
        }).catch((err) => {
          console.log(err)
        })
      } else {
        let price2 = await Moralis.Web3API.token.getTokenPrice({
          address: from.address, chain: chainId === "0x4"
            ? "eth"
            : chainId === "0x61"
              ? "bsc"
              : "polygon",
        }).then((x) => {
          setPriceFrom(x.usdPrice.toFixed(2));
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }

  useEffect(() => {
    getFromPrice();
  }, [from])

  useEffect(() => {
    getToPrice();
  }, [to])

  useEffect(() => {
    if (user) {
      if (chainId === "0x4") {
        setFrom(data[2][0]);
        setTo(data[2][1]);
        setVSelect(false);
        setAmount("");
        setAmount2("");
        setGas(0);
        setSearchArray([]);
        setSearch("");
      } else if (chainId === "0x61") {
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
  }, [user, chainId]);

  useEffect(() => {
    setAux(from);
  }, [from]);

  useEffect(() => {
    setAuxAmount(amount2);
  }, [amount2])

  useEffect(() => {
    setAmount2(amount)
    changeAmount2(amount)
  }, [to])

  const changeAmount = async (e) => {
    if (Number(e) !== 0) {
      // console.log(e);
      // console.log(to);
      // console.log(from);
      const quote = await Moralis.Plugins.oneInch.quote({
        chain:
          chainId === "0x4"
            ? "eth"
            : chainId === "0x61"
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
          chainId === "0x4"
            ? "eth"
            : chainId === "0x61"
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
    user.get("userNameChange") === false || user.get("passwordConfig") === undefined ||
    user.get("passwordConfig") === false
  ) {
    return <ConfigAccount />;
  }
  if (user.get("reCheck") === 1) return <CheckPassword />

  const userETHaddress = user.get("ethAddress");

  const options = {
    chain:
    chainId === "0x4"
        ? "eth"
        : chainId === "0x61"
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
      console.log(token);
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

  const changeFromToTo = () => {
    setFrom(to)
    setTo(aux);
  }

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
              onClick={userStatus}
            />
            <button
              className={style.selectedToken}
              onClick={() => changeToken(1)}
            >
              <img
                src={from.logo}
                alt={from.name}
                className={style.tokenImage}
              />
              <p className={style.text}>{from.symbol}</p>
            </button>
            <div>
              <button onClick={changeFromToTo}><FontAwesomeIcon icon={faSync} color="#800040" /></button>
            </div>
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
              onClick={userStatus}
            />
            <button
              className={style.selectedToken}
              onClick={() => changeToken(2)}
            >
              <img
                src={to.logo}
                alt={to.name}
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
            <img src="https://tokens.1inch.io/0x111111111117dc0aa78b770fa6a738034120c302.png" alt="1inch" className={style.tokenImage} />
          </div>
          <div className={style.priceContainer}>
            {priceFrom !== "" && <p>{from.symbol}: ~${priceFrom}</p>}
            {priceTo !== "" && <p>{to.symbol}: ~${priceTo}</p>}
          </div>
          <p className={style.details}>Slippage: {slippage}
            <FontAwesomeIcon icon={faPercent} color="white" style={{
              fontSize: "11px"
            }} />
          </p>
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
            onClick={userStatus}
          />
          <div className={style.alignContainer}>
            {coins.length > 0 &&
              searchArray.length === 0 &&
              search === "" &&
              coins.map((token, i) => {
                if (token.symbol !== to.symbol && token.symbol !== from.symbol) {
                  return (
                    <div
                      key={i}
                      className={style.token}
                      onClick={() => selectToken(token)}
                    >
                      <img
                        src={token.logo}
                        alt={token.name}
                        width="90%"
                        height="90%"
                        className={style.tokenImage}
                      />
                      <div className={style.nameToken}>
                        <p className={style.text}>{token.name}</p>
                        <p className={style.textSymbol}>{token.symbol}</p>
                      </div>
                    </div>
                  );
                }
              })}
            {searchArray.length > 0 &&
              searchArray.map((token, i) => {
                if (token.symbol !== to.symbol && token.symbol !== from.symbol)
                  return (
                    <div
                      key={i}
                      className={style.token}
                      onClick={() => selectToken(token)}
                    >
                      <img
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
      <Notifications />
      {internetStatus === false && <OfflineNotification />}
      {(chainId !== null && chainId !== "0x4" &&  chainId !== "0x61" && chainId !== "0x13881") && <UnsupportedChain />}
    </div>
  );
}
