import React, { useState, useEffect } from 'react'
import style from "../../styles/GroupChat.module.css"
import styleChat from "../../styles/Messages.module.css"
import { Moralis } from "moralis";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import ProfilePicture from "../../public/profile.jpg";
import Image from 'next/image';

const MessageInfo = ({ messageInfo, setMessageInfo, groupRef, members }) => {
    const [data, setData] = useState([]);
    const [membersData, setMembersData] = useState([]);
    const [seen, setSeen] = useState(false);
    const [unread, setUnread] = useState(false);
    const { user } = useMoralis();

    useEffect(async () => {
        const query = new Moralis.Query(`Group${groupRef}`)
        query.equalTo("type", "Message");
        query.equalTo("time", messageInfo);
        const results = await query.find();
        let res = []
        if (results !== undefined) {
            for (let i = 0; i < results.length; i++) {
                res.push(results[i].attributes.to)
            }
            setData([...res])
        }

        const addressToTag = Moralis.Object.extend("Tags");
        const query_ = new Moralis.Query(addressToTag);
        query_.containedIn("ethAddress", members)
        const results_ = await query_.find();
        if (results_.length > 0) {
            setMembersData(results_);
        }

    }, [])

    useEffect(() => {
        if (data.length > 0 && membersData.length > 0) {
            for (let i in membersData) {
                if (membersData[i].attributes.ethAddress !== user.get("ethAddress")) {
                    if (data.includes(membersData[i].attributes.ethAddress))
                        setUnread(true);
                    else
                        setSeen(true);
                }
            }
        }
    }, [data, membersData])

    return (
        <div className={style.infoMessages}>
            <div className={style.infoNav}>
                <div>
                    <button onClick={() => setMessageInfo("")} className={style.closeInfo} ><FontAwesomeIcon icon={faArrowLeft} /></button>
                    <p>Message info</p>
                </div>
            </div>
            {seen === true &&  <div className={style.infoMain}>
                <p className={style.infoTitleSection}>Seen:</p>
                <hr />
                {data.length > 0 && membersData.length > 0 && membersData.map((member) => {
                    let attributes = member.attributes;
                    if (data.includes(attributes.ethAddress) === false && attributes.ethAddress !== user.get("ethAddress")) {
                        return (
                            <div key={attributes.userTag} className={style.infoContainer}>
                                <div className={style.imgProfile}>
                                    {attributes.profilePhoto !== undefined && (
                                        <Image
                                            src={attributes.profilePhoto}
                                            alt="profilePhoto"
                                            width="50%"
                                            height="50%"
                                            layout="fill"
                                            objectFit="cover"
                                            className={style.img}
                                        />
                                    )}
                                    {attributes.profilePhoto === undefined && (
                                        <Image
                                            src={ProfilePicture}
                                            alt="profilePhoto"
                                            width="50%"
                                            height="50%"
                                            layout="responsive"
                                            objectFit="contain"
                                            className={style.img}
                                        />
                                    )}
                                </div>
                                <div className={style.infoMemberData}>
                                    <p>{attributes.username}</p>
                                    <p>@{attributes.userTag}</p>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>}
            {unread === true && <div className={style.infoMain}>
                <p className={style.infoTitleSection}>Unread:</p>
                <hr />
                {data.length > 0 && membersData.length > 0 && membersData.map((member) => {
                    let attributes = member.attributes;
                    if (data.includes(attributes.ethAddress)) {
                        return (
                            <div key={attributes.userTag} className={style.infoContainer}>
                                <div className={style.imgProfile}>
                                    {attributes.profilePhoto !== undefined && (
                                        <Image
                                            src={attributes.profilePhoto}
                                            alt="profilePhoto"
                                            width="50%"
                                            height="50%"
                                            layout="fill"
                                            objectFit="cover"
                                            className={style.img}
                                        />
                                    )}
                                    {attributes.profilePhoto === undefined && (
                                        <Image
                                            src={ProfilePicture}
                                            alt="profilePhoto"
                                            width="50%"
                                            height="50%"
                                            layout="responsive"
                                            objectFit="contain"
                                            className={style.img}
                                        />
                                    )}
                                </div>
                                <div className={style.infoMemberData}>
                                    <p>{attributes.username}</p>
                                    <p>@{attributes.userTag}</p>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>}
        </div>
    )
}

export default MessageInfo