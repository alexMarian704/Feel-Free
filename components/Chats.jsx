import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import ChatMain from "./ChatMain";
import style from "../styles/Chat.module.css"

export default function Chats() {
    const { user } = useMoralis();
    const [chatsArray, setChatsArray] = useState([]);
    const address = user.get("ethAddress");
    useEffect(() => {
        if (localStorage.getItem(`${address}Order`) !== null)
            setChatsArray(JSON.parse(localStorage.getItem(`${address}Order`)))
    }, [])

    return (
        <div>
            {chatsArray.length > 0 &&
                <div className={style.chatsContainer}>
                    {chatsArray.map((chat , i) => (
                        <ChatMain key={i} lastMessage={chat.lastMessage} name={chat.name} name2={chat.name2} profilePhoto={chat.profilePhoto} address={chat.chat} time={chat.time} last={chat.last} file={chat.file}/>
                    ))}
                </div>
            }
        </div>
    );
}