import React, { useState, useEffect } from 'react'
import style from "../../styles/GroupChat.module.css"
import { Moralis } from "moralis";
import { useMoralis } from "react-moralis";
import Image from "next/image";
import ProfilePicture from "../../public/profile.jpg";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight } from "@fortawesome/free-solid-svg-icons";

const MembersAndMedia = ({ members }) => {
    const [nav, setNav] = useState("members")
    const [membersData, setMembersData] = useState([])
    const { isAuthenticated } = useMoralis();
    const router = useRouter()

    useEffect(async () => {
        const addressToTag = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(addressToTag);
        query.containedIn("ethAddress", members)
        const results = await query.find();
        if (results.length > 0) {
            setMembersData(results);
        }
    }, [members])

    return (
        <div>
            <div className={style.groupInfoNav}>
                <div onClick={() => setNav("members")} style={{
                    color: nav === "members" ? "#800040" : "white",
                    borderBottom: nav === "members" ? "5px solid #800040" : "none"
                }}>
                    <h4>Members</h4>
                </div>
                <div onClick={() => setNav("media")} style={{
                    color: nav === "media" ? "#800040" : "white",
                    borderBottom: nav === "media" ? "5px solid #800040" : "none"
                }}>
                    <h4>Media</h4>
                </div>
            </div>
            {nav === "members" && <div>
                {membersData.length > 0 &&
                    <div>
                        {membersData.map((member, i) => {
                            const data = member.attributes;
                            return (
                                <div key={i} className={style.membersContainer}>
                                    <div className={style.leftInfo}>
                                        <div className={style.imgProfile}>
                                            {data.profilePhoto !== undefined && (
                                                <Image
                                                    src={data.profilePhoto}
                                                    alt="profilePhoto"
                                                    width="50%"
                                                    height="50%"
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className={style.img}
                                                />
                                            )}
                                            {data.profilePhoto === undefined && (
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
                                        <div className={style.membersInfo} onClick={() => router.push(`/users/${data.ethAddress}`)}>
                                            <p>{data.username}</p>
                                            <p>@{data.userTag}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <button onClick={() => router.push(`/transfer/${data.userTag}`)} className={style.sendButton}><FontAwesomeIcon icon={faArrowAltCircleRight} /></button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>}
            </div>}
        </div>
    )
}

export default MembersAndMedia