import React, { useState, useEffect } from "react";
import { useNFTBalances } from "react-moralis";
import { Moralis } from "moralis";

export default function TransferNFT({ userETH, selectedChain, style }) {
  const [nfts, setNFTS] = useState([]);
  const [to, setTo] = useState("");
  const [select, setSelect] = useState("");
  const [noNFT, setNoNFT] = useState("");
  const [loading , setLoading] = useState(false);

  const userNFTBalance = async () => {
    setLoading(true);
    const userNFTs = await Moralis.Web3API.account.getNFTs({
      chain:
        selectedChain === "eth"
          ? "0x4"
          : selectedChain === "bsc"
          ? "0x61"
          : "mumbai",
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

  const transferNFT = async (nft) => {
    const options = {
      type: nft.contract_type,
      receiver: to,
      contractAddress: nft.token_address,
      tokenId: nft.token_id,
    };
    let transaction = await Moralis.transfer(options);
  };

  const selectNFT = (x)=>{
    setSelect(x);
    
  }

  return (
    <div>
      {loading === false && nfts.length > 0 && <h2 className={style.textError}>
        Some NFTs can't be displayed due to metadata format.
      </h2>}
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
      {loading === true && 
      <div className={style.nftLoading}>
        <div className={style.loader}></div>
      </div> }
      {nfts.length > 0 && loading === false && (
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
