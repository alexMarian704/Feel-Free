import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import ChatMain from "./ChatMain";
import style from "../styles/Chat.module.css"
import { userStatus } from "../function/userStatus";
import { Moralis } from "moralis";

export default function Chats() {
    const { user } = useMoralis();
    const [chatsArray, setChatsArray] = useState([]);
    const [notArray, setNotArray] = useState([]);
    const [idArray, setIdArray] = useState([])
    const address = user.get("ethAddress");
    useEffect(() => {
        if (localStorage.getItem(`${address}Order`) !== null)
            setChatsArray(JSON.parse(localStorage.getItem(`${address}Order`)))
    }, [])

    const queryNotifications = async () => {
        const userNotification = Moralis.Object.extend("Notification");
        const query = new Moralis.Query(userNotification);
        query.equalTo("to", user.get("ethAddress"));
        query.equalTo("type", "New message");
        const results = await query.find();
        if (results !== undefined){
            setNotArray(results)
        }

        const subscription = await query.subscribe()
        subscription.on("create", (object) => {
            if (idArray.includes(object.id) === false) {
                setIdArray([...idArray, object.id])
                setNotArray([...results, object])
            }
        })
    }

    useEffect(async () => {
        queryNotifications();
    }, [])

    // console.log(notArray);

    return (
        <div>
            {chatsArray.length > 0 &&
                <div className={style.chatsContainer} onClick={userStatus}>
                    {chatsArray.map((chat , i) => (
                        <ChatMain key={i} lastMessage={chat.lastMessage} name={chat.name} name2={chat.name2} profilePhoto={chat.profilePhoto} address={chat.chat} time={chat.time} last={chat.last} file={chat.file} notification={notArray} tag={chat.tag} type={chat.type} groupRef={chat.groupRef}/>
                    ))}
                </div>
            }
        </div>
    );
}