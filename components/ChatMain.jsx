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
    const { user } = useMoralis();
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
                console.log(results.attributes.image)
            }
        }
    }

    useEffect(() => {
        getData();
    }, [])

    useEffect(() => {
        let nr = 0;
        for (let i = 0; i < notification.length; i++) {
            if (notification[i].attributes.tag === tag) {
                nr = 1;
            }
        }
        if (nr === 1)
            setNewMessage(true);
        else
            setNewMessage(false);
    }, [notification])

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
                {(friendData.profilePhoto === undefined && (friendData.image === "" || friendData.image === undefined) ) && <Image
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
            <div className={style.infoContainer} onClick={() => router.push(`/messages/${address}`)}>
                {(file === "message") && <div className={style.mainData}>
                    {newMaessage === false && <p>{friendData.username}</p>}
                    {newMaessage === true && <p>{friendData.username} <FontAwesomeIcon icon={faCircle} color="#800040" style={{
                        "fontSize": "14px"
                    }} /></p>}
                    {type === "group" && <p>{friendData.name}</p>}
                    {newMaessage === false && last === "you" && <p className={style.lastMessage}><span>You:</span> {lastMessage}</p>}
                    {newMaessage === false && last === "friend" && <p className={style.lastMessage}><span>{friendData.username}:</span> {lastMessage}</p>}
                    {newMaessage === true && <p><span>New messages</span></p>}
                </div>}
                {(file === "application/pdf" || file === "text/plain") && <div className={style.mainData}>
                    <p>{friendData.name} {friendData.name2}</p>
                    {newMaessage === false && last === "you" && <p><span>You:</span> <FontAwesomeIcon icon={faFile} /> </p>}
                    {newMaessage === false && last === "friend" && <p><span>{friendData.username}: </span><FontAwesomeIcon icon={faFile} /></p>}
                    {newMaessage === true && last === "friend" && <p><span>New messages</span></p>}
                </div>}
                {(file === "image/jpg" || file === "image/png" || file === "image/jpeg") && <div className={style.mainData}>
                    <p>{friendData.name} {friendData.name2}</p>
                    {newMaessage === false && last === "you" && <p><span>You:</span> <FontAwesomeIcon icon={faImage} /> </p>}
                    {newMaessage === false && last === "friend" && <p><span>{friendData.username}: </span><FontAwesomeIcon icon={faImage} /></p>}
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