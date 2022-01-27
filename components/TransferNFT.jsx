import React, { useState, useEffect } from "react";
import { useNFTBalances } from "react-moralis";
import { Moralis } from "moralis";

export default function TransferNFT({ userETH, selectedChain, style }) {
  const { getNFTBalances, data, error, isLoading, isFetching } =
    useNFTBalances();
  const [nfts, setNFTS] = useState([]);
  const [to, setTo] = useState("");
  const [select, setSelect] = useState("");
  const [noNFT, setNoNFT] = useState("");

  const userNFTBalance = async () => {
      getNFTBalances({
        params: {
          chain:
            selectedChain === "eth"
              ? "eth"
              : selectedChain === "bsc"
              ? "bsc"
              : "polygon",
          address: userETH,
        },
      });
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
      setNoNFT("");
    } else {
      setNFTS([]);
      setNoNFT("You have 0 NFTs.");
    }
  };

  console.log(nfts);

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

  return (
    <div>
      <h2 className={style.textError}>
        Some NFTs can't be displayed due to metadata format.
      </h2>
      {noNFT !== "" && <p>{noNFT}</p>}
      {nfts.length > 0 && (
        <div className={style.mainNFT}>
          {nfts.map((x, i) => {
            let obj = JSON.parse(x.metadata)
            if (x.metadata !== null && obj.image !== null){
              let gatewayIPFS = "https://gateway.ipfs.io/ipfs/"
              return (
                <div
                  key={i}
                  onClick={() => setSelect(x)}
                  className={style.nftContainer}
                >
                  <h3>{x.name}</h3>
                  <p>{x.contract_type}</p>
                  <p className={style.token_address}>{x.token_address}</p>
                  <img
                    src={obj.image.replace("ipfs://" , gatewayIPFS)}
                    alt={x.token_address}
                    className={style.img}
                  />
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
