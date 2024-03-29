import React from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";

export default function Info({ setInfo }) {
  const { setUserData,logout } = useMoralis();

  const accept = () => {
    setUserData({
      info: true,
    });
    setInfo(true);
  };

  return (
    <div className="setUp">
      {/* <button className="exclamation">
        <FontAwesomeIcon icon={faExclamation} color="rgb(243, 92, 4)" />
      </button> */}
      <button onClick={()=> logout()} className="checkLogOut">Log out</button>
      <h3 className="setUpTitle">Important</h3>
      <div className="infoClass">
        <h2 className="setUpInfoText">
          We don't have access to your private keys !
        </h2>
        <h2 className="setUpInfoText">
          We don't have access to your secret phrase !
        </h2>
        <h2 className="setUpInfoText">
          We can't access your funds , every transaction need to be confirmed by
          you on your wallet !
        </h2>
        <h2 className="setUpInfoText">
          We recommend logging out when you are not using the platform !
        </h2>
      </div>
      <button className="setUpBut" onClick={accept} style={{width:"calc(140px + 1vw)" , fontSize:"calc(18px + 0.2vw)" , height:"calc(28px + 1vh)"}}>
       I understand
      </button>
    </div>
  );
}