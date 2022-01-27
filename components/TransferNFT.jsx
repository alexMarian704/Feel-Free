import React, { useState, useEffect } from "react";
import { useNFTBalances } from "react-moralis";
import { Moralis } from "moralis";
import Image from "next/image";

export default function TransferNFT({ userETH, selectedChain , style }) {
  const { getNFTBalances, data, error, isLoading, isFetching } =
    useNFTBalances();
  const [nfts, setNFTS] = useState([]);
  const [to, setTo] = useState("");
  const [select, setSelect] = useState("");

  const userNFTBalance = () => {
    if (nfts.length === 0) {
      getNFTBalances({
        params: { chain: "0x4", address: userETH },
      });
    }
    if (data && nfts.length === 0) setNFTS(data.result);
  };

  useEffect(() => {
    userNFTBalance();
  }, [isLoading, selectedChain]);

  if (nfts.length > 0) console.log(nfts);

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
      <h1>NFT</h1>
      {nfts.length > 0 && (
        <div>
          {nfts.map((x, i) => (
            <div key={i} onClick={() => setSelect(x)}>
              <h3>{x.name}</h3>
              <p>{x.contract_type}</p>
              <p>{x.token_address}</p>
              {x.image !== undefined &&  <Image
                src={x.image}
                alt={x.token_address}
                width="90%"
                height="90%"
                layout="responsive"
                objectFit="contain"
                className={style.img}
              />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
