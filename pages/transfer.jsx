import React, { useState } from "react";
import { useMoralis, useWeb3Transfer } from "react-moralis";
import { Moralis } from "moralis";
import Link from "next/link";
import Reject from "../components/Reject";
import ConfigAccount from "../components/ConfigAccount";
import Head from "next/head";
import { useRouter } from "next/router"

export default function Transfer() {
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const { user, isAuthenticated, logout } = useMoralis();
  const web3 = Moralis.enableWeb3();
  const router = useRouter()

  const { fetch, error, isFetching } = useWeb3Transfer({
    amount: Moralis.Units.ETH(Number(amount)),
    receiver: to,
    type: "native",
  });

  const logOutUser = () => {
    logout();
    router.push("/")
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

  return (
    <div>
      <Head>
        <title>Transfer</title>
      </Head>
      <label>Your ETH address</label>
      <p>{userETHaddress}</p>
      <br />
      <label>Amount</label>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <br />
      <label>To</label>
      <input type="text" value={to} onChange={(e) => setTo(e.target.value)} />
      <button onClick={fetch} disabled={isFetching}>
        Send
      </button>
      {error && <h3>{error.message}</h3>}
      <br />
      <button onClick={logOutUser}>Log out</button>
      <Link href="/">Home</Link>
    </div>
  );
}
