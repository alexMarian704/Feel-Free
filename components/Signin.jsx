import React from "react";
import { useMoralis } from "react-moralis";
import metamask from "../public/metamask.png"
import Image from "next/image"

export default function SignIn() {
  const { authenticate, authError } = useMoralis();

  const signInFunction = () => {
    authenticate();
  };

  return (
    <div className="containerBlack">
      <div className="signIn">
        <h2 className="signText">Sign In with MetaMask</h2>
        <Image src={metamask} alt="metamask" className="imgMeta" />
        <button onClick={signInFunction} className="signinBut">Sign In</button>
        {authError && <h2 className="signInError">{authError.message}</h2>}
      </div>
    </div>
  );
}