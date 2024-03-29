import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';

export default function ConfigUser({ setInfo }) {
  const { setUserData, user,logout } = useMoralis();
  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("");
  const [validTag, setValidTag] = useState(null);
  const [error, setError] = useState("");
  const [use, setUse] = useState(false);

  const setName = async () => {
    if (username !== "" && validTag === true) {

      const keyPair = window.crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      },
        true,
        ["encrypt", "decrypt"]
      );
      const { privateKey, publicKey } = await keyPair;

      const publicKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        publicKey
      );
      const privateKeyJwk = await window.crypto.subtle.exportKey(
        "jwk",
        privateKey
      );
      const encrypt = (content, password) => AES.encrypt(JSON.stringify({ content }), password).toString()
      const encryptedPrivateKey = encrypt(privateKeyJwk, user.id);
      localStorage.setItem(`privateKeyUser${user.get("ethAddress")}` , encryptedPrivateKey)
      const formatPublicKey = JSON.stringify(publicKeyJwk)
      localStorage.setItem(`publicKeyUser${user.get("ethAddress")}` , formatPublicKey)

      let char = username.split(" ");
      if (char[1]) {
        setUserData({
          username: username,
          userTag: tag.toLowerCase().replace(/ /g, ""),
          userNameChange: true,
          theme: "dark",
          info: false,
          searchName: username.toLowerCase(),
          name: char[0].toLowerCase(),
          name2: char[1].toLowerCase() ? char[1].toLowerCase() : "",
          chain: "eth",
          passwordConfig: false,
          reCheck: 2,
          formatPublicKey:formatPublicKey
        });
      } else {
        setUserData({
          username: username,
          userTag: tag.toLowerCase().replace(/ /g, ""),
          userNameChange: true,
          theme: "dark",
          info: false,
          searchName: username.toLowerCase(),
          name: char[0].toLowerCase(),
          name2: undefined,
          chain: "eth",
          passwordConfig: false,
          reCheck: 2,
          formatPublicKey:formatPublicKey
        });
      }
      setInfo(false);
      const Tags = Moralis.Object.extend("Tags");
      const tagU = new Tags();

      const Friends = Moralis.Object.extend("Friends");
      const friend = new Friends();
      friend.save({
        friendsArray: [],
        ethAddress: user.get("ethAddress"),
        aclArray: [user.id]
      })

      const FriendsACL = new Moralis.ACL();
      FriendsACL.setReadAccess(user.id, true);
      FriendsACL.setWriteAccess(user.id, true)
      friend.setACL(FriendsACL)
      friend.save();

      if (char[1]) {
        tagU.save({
          userTag: tag.toLowerCase().replace(/ /g, ""),
          ethAddress: user.get("ethAddress"),
          searchName: username.toLowerCase(),
          name: char[0].toLowerCase(),
          name2: char[1].toLowerCase() ? char[1].toLowerCase() : "",
          idUser: user.id,
          formatPublicKey:formatPublicKey,
          username: username,
        });

        const tagACL = new Moralis.ACL();
        tagACL.setPublicReadAccess(true);
        tagACL.setWriteAccess(user.id, true)
        tagU.setACL(tagACL)
        tagU.save();
      } else {
        tagU.save({
          userTag: tag.toLowerCase().replace(/ /g, ""),
          ethAddress: user.get("ethAddress"),
          searchName: username.toLowerCase(),
          name: char[0].toLowerCase(),
          name2: "",
          idUser: user.id,
          formatPublicKey:formatPublicKey,
          username: username,
        });

        const tagACL = new Moralis.ACL();
        tagACL.setPublicReadAccess(true);
        tagACL.setWriteAccess(user.id, true)
        tagU.setACL(tagACL)
        tagU.save();

      }

    } else if (username === "") {
      setError("Please enter an username");
    } else if (tag.length < 4 && tag !== "") {
      setError("Tag too short");
      setValidTag(false);
    } else if (validTag === false && tag === "") {
      setError("Please enter a tag");
    } else if (validTag === null && tag === "") {
      setError("Please enter a tag");
      setValidTag(false);
    }
  };

  const checkTag = async () => {
    if (use === false) setUse(true);

    if (tag !== "") {
      if (tag.length > 3) {
        let array = [];
        const Tags = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(Tags);
        query.equalTo("userTag", tag);
        const results = await query.find();
        for (let i = 0; i < results.length; i++) {
          const object = results[i];
          console.log(object.get("userTag"));
          array.push(object.get("userTag"));
        }
        if (array.includes(tag) === false) {
          setValidTag(true);
          setError("");
        } else {
          setValidTag(false);
          setError("Tag already in use");
        }
      } else {
        setValidTag(false);
        setError("Tag too short");
      }
    } else {
      setValidTag(false);
      setError("Please enter a tag");
    }
  };

  useEffect(() => {
    if (tag !== "") checkTag();
    else if (tag === "" && use === true) {
      setValidTag(false);
      setError("Please enter a tag");
    }
  }, [tag]);

  return (
    <div className="setUp">
      <button onClick={()=> logout()} className="checkLogOut">Log out</button>
      <h2 className="setUpTitle">Choose your username & tag</h2>
      <div className="setUpContainer">
        <label>Username</label>
        <br />
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="setUpInput"
        />
        <br />
        <label>Tag</label>
        <br />
        <div className="checkDiv">
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="setUpInput"
          />
          <button className="checkBut">
            {validTag === null ? (
              <FontAwesomeIcon icon={faCheck} />
              ) : validTag === true ? (
                <FontAwesomeIcon icon={faCheck} color="green" />
                ) : (
                  <FontAwesomeIcon icon={faTimes} color="red" />
                  )}
          </button>
        </div>
        {error && <p className="checkError">{error}</p>}
      </div>
      <br />
      <button onClick={setName} className="setUpBut">
        Next step
      </button>
    </div>
  );
}
