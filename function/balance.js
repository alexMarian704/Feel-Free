import { Moralis } from "moralis";

let userBalance;

export const getBalance = async (userETHaddress,selectedChain) => {
    //const selectedChain = Moralis.chainId;
    const balances = await Moralis.Web3API.account.getNativeBalance({
        chain:selectedChain,
        address: userETHaddress,
    });
    userBalance = (balances.balance / 1000000000000000000).toFixed(5);
    return userBalance;
};