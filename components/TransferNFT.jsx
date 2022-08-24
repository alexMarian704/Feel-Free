import React, { useState, useEffect } from "react";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Web3 from "web3";

export default function TransferNFT({ userETH, selectedChain, style }) {
  const [nfts, setNFTS] = useState([]);
  const [to, setTo] = useState("");
  const [select, setSelect] = useState("");
  const [noNFT, setNoNFT] = useState("");
  const [loading, setLoading] = useState(false);
  const [pedding, setPedding] = useState(false);
  const [errorSend, setErrorSend] = useState("");
  const [confirm, setConfirm] = useState(false);

  const userNFTBalance = async () => {
    setLoading(true);
    const userNFTs = await Moralis.Web3API.account.getNFTs({
      chain:selectedChain,
      address: userETH,
    });
    if (userNFTs && userNFTs.result.length > 0) {
      setNFTS(userNFTs.result);
      setLoading(false);
      setNoNFT("");
    } else {
      setNFTS([]);
      setLoading(false);
      setNoNFT("You have 0 NFTs.");
    }
  };

  useEffect(() => {
    userNFTBalance();
  }, [selectedChain]);

  const transferNFT = async () => {
    if (to[0] !== "@" && Web3.utils.isAddress(to)) {
      setErrorSend("");
      setConfirm(true);
    } else if (to[0] === "@") {
      const addressToTag = Moralis.Object.extend("Tags");
      const query = new Moralis.Query(addressToTag);
      query.equalTo("userTag", to.replace("@", ""));
      const results = await query.first();
      if (results !== undefined) {
        setTo(results.attributes.ethAddress);
        setConfirm(true);
        setErrorSend("");
      } else {
        setErrorSend("Invalid tag");
      }
    } else {
      setErrorSend("Invalid address");
    }
  };

  const confirmNFT = async (nft) => {
    let options;

    if (nft.contract_type.toLowerCase() === "erc721") {
      options = {
        type: nft.contract_type.toLowerCase(),
        receiver: to.toLowerCase(),
        contractAddress: nft.token_address,
        tokenId: nft.token_id,
      };
    } else {
      options = {
        type: nft.contract_type.toLowerCase(),
        receiver: to.toLowerCase(),
        contractAddress: nft.token_address,
        tokenId: nft.token_id,
        amount: 1,
      };
    }

    const transaction = await Moralis.transfer(options);
    setPedding(true);
    const result = await transaction.wait();
    setPedding(false);
    console.log(result);
  };

  const selectNFT = (x) => {
    setSelect(x);
  };

  const backAll = () => {
    setSelect("");
    setConfirm(false);
    setTo("");
  };

  return (
    <div>
      {loading === false && nfts.length > 0 && select == "" && (
        <h2 className={style.textError}>
          Some NFTs can't be displayed due to metadata format.
        </h2>
      )}
      {noNFT !== "" && loading === false && (
        <p
          className={style.textError}
          style={{
            fontSize: "24px",
          }}
        >
          {noNFT}
        </p>
      )}
      {loading === true && (
        <div className={style.nftLoading}>
          <div className={style.loader}></div>
        </div>
      )}
      {select !== "" && (
        <div className={style.alignNFT}>
          <div className={style.selectContainer}>
            <button onClick={backAll} className={style.backButNFT}>
              <FontAwesomeIcon
                icon={faArrowLeft}
                color="#800040"
                className={style.copyButton}
              />
            </button>
            <div className={style.nftContainer}>
              <img
                src={JSON.parse(select.metadata).image.replace(
                  "ipfs://",
                  "https://gateway.ipfs.io/ipfs/"
                )}
                alt={select.token_address}
                className={style.img}
              />
              <div>
                <h3>{select.name}</h3>
                <p>{select.contract_type}</p>
              </div>
            </div>
          </div>
          {confirm === false && (
            <div className={style.inputNFTContainer}>
              <label
                style={{
                  fontSize: "20px",
                }}
              >
                To
              </label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Address or tag"
                id={style.input}
                autoComplete="off"
              />
              <div className={style.alignButton}>
                <button
                  className="setUpBut"
                  id={style.button}
                  onClick={transferNFT}
                >
                  Confirm
                </button>
              </div>
              {pedding === true && (
                <div className={style.nftLoading}>
                  <div className={style.loader}></div>
                </div>
              )}
              {errorSend && <p>{errorSend}</p>}
            </div>
          )}
          {confirm === true && (
            <div className={style.inputNFTContainer} id={style.confirmDiv}>
              <label
                style={{
                  fontSize: "20px",
                }}
              >
                To
              </label>
              <hr />
              <p className={style.address}>{to}</p>
              <div className={style.alignButton}>
                <button
                  className="setUpBut"
                  id={style.button}
                  onClick={() => confirmNFT(select)}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {nfts.length > 0 && select === "" && loading === false && (
        <div className={style.mainNFT}>
          {nfts.map((x, i) => {
            let obj = JSON.parse(x.metadata);
            if (x.metadata !== null && obj.image !== null) {
              let gatewayIPFS = "https://gateway.ipfs.io/ipfs/";
              return (
                <div
                  key={i}
                  onClick={() => selectNFT(x)}
                  className={style.nftContainer}
                >
                  <img
                    src={obj.image.replace("ipfs://", gatewayIPFS)}
                    alt={x.token_address}
                    className={style.img}
                  />
                  <div>
                    <h3>{x.name}</h3>
                    <p>{x.contract_type}</p>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
