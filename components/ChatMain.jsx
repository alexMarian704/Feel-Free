import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faFile, faCircle } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import style from "../styles/Chat.module.css"
import ProfilePicture from "../public/profile.jpg";
import Image from "next/image";
import { Moralis } from "moralis";

export default function ChatMain({ name, name2, address, lastMessage, time, last, file, notification, tag, type, groupRef }) {
    const [friendData, setFriendData] = useState("");
    const [newMaessage, setNewMessage] = useState(false);
    const { user, isAuthenticated } = useMoralis();
    const router = useRouter();
    const d = new Date(time);
    const today = new Date();
    //present day
    let dataToday = today.getDate();
    let monthToday = today.getMonth()
    let yearToday = today.getFullYear()
    //time day
    let data = d.getDate();
    let month = d.getMonth()
    let year = d.getFullYear()
    let minutes = d.getMinutes();
    let hours = d.getHours();

    const getData = async () => {
        if (type !== "group") {
            const addressToTag = Moralis.Object.extend("Tags");
            const query = new Moralis.Query(addressToTag);
            query.equalTo("ethAddress", address);
            const results = await query.first();
            if (results !== undefined) {
                setFriendData(results.attributes);
            }
        } else {
            const addressToTag = Moralis.Object.extend(`Group${groupRef}`);
            const query = new Moralis.Query(addressToTag);
            query.equalTo("type", "data");
            const results = await query.first();
            if (results !== undefined) {
                setFriendData(results.attributes);
            }
        }
    }

    useEffect(() => {
        getData();
    }, [])

    useEffect(() => {
        if (notification.length > 0) {
            for (let i = 0; i < notification.length; i++) {
                if (type !== "group") {
                    if (notification[i].attributes.tag === tag && notification[i].attributes.name === undefined && groupRef === undefined) {
                        setNewMessage(true);
                    }
                } else {
                    if (notification[i].attributes.groupRef === groupRef && friendData.name === notification[i].attributes.name && notification[i].attributes.name !== undefined && notification[i].attributes.name === address) {
                        setNewMessage(true);
                    }
                }
            }
        }
    }, [notification.length])

    return (
        <div className={style.container}>
            <div className={style.imgContainer}>
                {friendData.profilePhoto !== undefined && type !== "group" && <Image
                    width="100%"
                    height="100%"
                    layout="fill"
                    objectFit="cover"
                    src={friendData.profilePhoto}
                    alt="Profile Photo" />}
                {(friendData.profilePhoto === undefined && (friendData.image === "" || friendData.image === undefined)) && <Image
                    width="100%"
                    height="100%"
                    layout="fill"
                    objectFit="cover"
                    src={ProfilePicture}
                    alt="Profile Photo" />}
                {friendData.image !== "" && friendData.image !== undefined && <Image
                    width="100%"
                    height="100%"
                    layout="fill"
                    objectFit="cover"
                    src={friendData.image}
                    alt="Profile Photo" />}
            </div>
            <div className={style.infoContainer} onClick={() => type === "group" ? router.push(`/group/${groupRef}`) : router.push(`/messages/${address}`)}>
                {(file === "message") && <div className={style.mainData}>
                    {newMaessage === false && type !== "group" && <p>{friendData.username}</p>}
                    {newMaessage === true && type !== "group" && <p>{friendData.username} <FontAwesomeIcon icon={faCircle} color="#800040" style={{
                        "fontSize": "14px"
                    }} /></p>}
                    {newMaessage === true && friendData.owner !== undefined  && <p>{friendData.name} <FontAwesomeIcon icon={faCircle} color="#800040" style={{
                        "fontSize": "14px"
                    }} /></p>}
                    {newMaessage === false && type === "group" && <p>{friendData.name}</p>}

                    {newMaessage === false && last === "you" && <p className={style.lastMessage}><span>You:</span> {lastMessage}</p>}

                    {newMaessage === false && last === "friend" && <p className={style.lastMessage}><span>{type !== "group" ? friendData.username : `@${tag}`}:</span> {lastMessage}</p>}
                    {newMaessage === true && <p><span>New messages</span></p>}
                    {newMaessage === false && last === user.get("userTag") && <p className={style.lastMessage}><span>You:</span> {lastMessage}</p>}
                </div>}
                {(file === "application/pdf" || file === "text/plain") && <div className={style.mainData}>
                    <p>{friendData.name} {friendData.name2}</p>
                    {newMaessage === false && last === "you" && <p><span>You:</span> <FontAwesomeIcon icon={faFile} /> </p>}
                    {newMaessage === false && last === "friend" && <p><span>{type !== "group" ? friendData.username : `@${tag}`}: </span><FontAwesomeIcon icon={faFile} /></p>}
                    {newMaessage === true && last === "friend" && <p><span>New messages</span></p>}
                </div>}
                {(file === "image/jpg" || file === "image/png" || file === "image/jpeg") && <div className={style.mainData}>
                    <p>{friendData.name} {friendData.name2}</p>
                    {newMaessage === false && last === "you" && <p><span>You:</span> <FontAwesomeIcon icon={faImage} /> </p>}
                    {newMaessage === false && last === "friend" && <p><span>{type !== "group" ? friendData.username : `@${tag}`}</span> <FontAwesomeIcon icon={faImage} /></p>}
                    {newMaessage === true && last === "friend" && <p><span>New messages</span></p>}
                </div>}
                <div>
                    {dataToday === data && month === monthToday && year === yearToday && minutes > 9 && <p>{hours}:{minutes}</p>}
                    {dataToday === data && month === monthToday && year === yearToday && minutes <= 9 && <p>{hours}:0{minutes}</p>}
                    {(dataToday !== data || month !== monthToday || year !== yearToday) && <p>{data}.{month}.{year}</p>}
                </div>
            </div>
        </div>
    );
}