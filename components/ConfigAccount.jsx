import React from "react";
import Link from "next/link";
import Head from "next/head";

export default function ConfigAccount() {
  return (
    <div className="containerBlack">
      <Head>
        <title>Config User</title>
      </Head>
      <div className="setUp">
        <h2 className="setUpTitle">Please config your account</h2>
        <Link href="/">Config Page</Link>
      </div>
    </div>
  );
}
