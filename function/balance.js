import { Moralis } from "moralis";

let userBalance;

export const getBalance = async (userETHaddress) => {
    const selectedChain = Moralis.User.current().get("chain")
    const balances = await Moralis.Web3API.account.getNativeBalance({
        chain:selectedChain === "eth"
        ? "0x4"
        : selectedChain === "bsc"
        ? "0x61"
        : "mumbai",
        address: userETHaddress,
    });
    userBalance = (balances.balance / 1000000000000000000).toFixed(5);
    
    return userBalance;
};