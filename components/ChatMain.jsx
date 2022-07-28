import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage , faFile , faCircle } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import style from "../styles/Chat.module.css"
import ProfilePicture from "../public/profile.jpg";
import Image from "next/image";
import { Moralis } from "moralis";

export default function ChatMain({ name, name2, address, lastMessage, time, last, file, notification , tag }) {
    const [friendData, setFriendData] = useState("");
    const [newMaessage , setNewMessage] = useState(false);
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
        const addressToTag = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(addressToTag);
        query.equalTo("ethAddress", address);
        const results = await query.first();
        if (results !== undefined) {
            setFriendData(results.attributes);
        }
    }

    useEffect(()=>{
        getData();
    },[])

    useEffect(()=>{
        let nr=0;
        for(let i=0;i<notification.length;i++){
            if(notification[i].attributes.tag === tag){
                nr=1;
            }
        }
        if(nr === 1)
            setNewMessage(true);
        else
            setNewMessage(false);
    },[notification])

    return (
        <div className={style.container}>
            <div className={style.imgContainer}>
                {friendData.profilePhoto !== undefined && <Image
                    width="100%"
                    height="100%"
                    layout="fill"
                    objectFit="cover"
                    src={friendData.profilePhoto}
                    alt="Profile Photo" />}
                {friendData.profilePhoto === undefined && <Image
                    width="100%"
                    height="100%"
                    layout="fill"
                    objectFit="cover"
                    src={ProfilePicture}
                    alt="Profile Photo" />}
            </div>
            <div className={style.infoContainer} onClick={() => router.push(`/messages/${address}`)}>
                {(file==="message") && <div className={style.mainData}>
                    {newMaessage === false && <p>{friendData.username}</p>}
                    {newMaessage === true && <p>{friendData.username} <FontAwesomeIcon icon={faCircle} color="#800040" style={{
                        "fontSize":"14px"
                    }} /></p>}
                    {newMaessage === false && last === "you" && <p><span>You:</span> {lastMessage}</p>}
                    {newMaessage === false && last === "friend" && <p><span>{friendData.username}:</span> {lastMessage}</p>}
                    {newMaessage === true && last === "friend" && <p><span>New message from </span>{friendData.name}</p>}
                </div>}
                {(file === "application/pdf" || file === "image/jpg" || file === "image/png" || file === "text/plain" || file=== "image/jpeg") && <div className={style.mainData}>
                    <p>{friendData.name} {friendData.name2}</p>
                    {newMaessage === false && last === "you" && <p><span>You:</span> <FontAwesomeIcon icon={faFile} /> </p>}
                    {newMaessage === false && last === "friend" && <p><span>{friendData.username}: </span><FontAwesomeIcon icon={faFile} /></p>}
                    {newMaessage === true && last === "friend" && <p><span>New message from </span>{friendData.name}</p>}
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