import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import style from "../styles/Chat.module.css"
import ProfilePicture from "../public/profile.jpg";
import Image from "next/image";
import { Moralis } from "moralis";

export default function ChatMain({ name, name2, address, lastMessage, time, last, image }) {
    const [friendData, setFriendData] = useState("");
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
                {(image === false || image===undefined) && <div className={style.mainData}>
                    <p>{name} {name2}</p>
                    {last === "you" && <p><span>You:</span> {lastMessage}</p>}
                    {last === "friend" && <p><span>{name}:</span> {lastMessage}</p>}
                </div>}
                {image === true && <div className={style.mainData}>
                    <p>{name} {name2}</p>
                    {last === "you" && <p><span>You:</span> <FontAwesomeIcon icon={faImage} /> </p>}
                    {last === "friend" && <p><span>{name}: </span><FontAwesomeIcon icon={faImage} /></p>}
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