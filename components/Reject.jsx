import React from "react";
import Link from "next/link";
import Head from "next/head";

export default function Reject() {
  return (
    <div className="containerBlack">
      <Head>
        <title>Reject</title>
      </Head>
      <div className="setUpReject">
        <h2 className="setUpTitle">You are not signed in</h2>
        <Link href="/"><p className="configLink">Sign In</p></Link>
      </div>
    </div>
  );
}
