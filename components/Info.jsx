import React from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamation } from "@fortawesome/free-solid-svg-icons";

export default function Info({ setInfo }) {
  const { setUserData } = useMoralis();

  const accept = () => {
    setUserData({
      info: true,
    });
    setInfo(true);
  };

  return (
    <div className="setUp">
      <button className="exclamation">
        <FontAwesomeIcon icon={faExclamation} color="rgb(243, 92, 4)" />
      </button>
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
      </div>
      <button className="setUpBut" onClick={accept}>
        I understand
      </button>
    </div>
  );
}