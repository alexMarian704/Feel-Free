import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function ConfigUser({ setInfo }) {
  const { setUserData, user } = useMoralis();
  const [error, setError] = useState("");
  const [use, setUse] = useState(false);

  return (
    <div className="setUp">
      
    </div>
  );
}