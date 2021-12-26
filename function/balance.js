import { Moralis } from "moralis";

let userBalance;

export const getBalance = async (userETHaddress) => {
    const balances = await Moralis.Web3API.account.getNativeBalance({
        chain:"mumbai",
        address: userETHaddress,
    });
    userBalance = (balances.balance / 1000000000000000000).toFixed(5);
    
    return userBalance;
};