import React from 'react';
import { useRouter } from 'next/router';
import Head from "next/head";
import { useMoralis } from "react-moralis";
import Reject from "../../components/Reject";
import ConfigAccount from "../../components/ConfigAccount";
import { Moralis } from "moralis";
import Nav from '../../components/Nav';

export default function UserID() {
  const { isAuthenticated , user } = useMoralis();
  const router = useRouter()

  if (!isAuthenticated) {
    return <Reject />;
  } else if (
    user.get("userNameChange") === undefined ||
    user.get("userNameChange") === false
  ) {
    return <ConfigAccount />;
  }

  return (
  <div>
      <Head>
        <title>User profile</title>
      </Head>
      <Nav balance={false} />
      <div className="marginDiv"></div>
      <h1>salut {router.query.userID}</h1>
  </div>
  )
}
