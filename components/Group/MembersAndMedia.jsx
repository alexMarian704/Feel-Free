import React, { useState, useEffect } from 'react'
import style from "../../styles/GroupChat.module.css"
import { Moralis } from "moralis";
import { useMoralis } from "react-moralis";
import Image from "next/image";
import ProfilePicture from "../../public/profile.jpg";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowAltCircleRight, faUserPlus, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'

const MembersAndMedia = ({ members, setAddMember, groupData, mediaRoute }) => {
    const [nav, setNav] = useState(mediaRoute === undefined ? "members" : "media")
    const [membersData, setMembersData] = useState([])
    const { user, isAuthenticated } = useMoralis();
    const [media, setMedia] = useState([])
    const router = useRouter()

    const decrypt = (crypted, password) => JSON.parse(AES.decrypt(crypted, password).toString(ENC)).content

    useEffect(async () => {
        const addressToTag = Moralis.Object.extend("Tags");
        const query = new Moralis.Query(addressToTag);
        query.containedIn("ethAddress", members)
        const results = await query.find();
        if (results.length > 0) {
            setMembersData(results);
        }
    }, [members])

    useEffect(() => {
        if (JSON.parse(localStorage.getItem(`Group${router.query.id}Messages`) !== null)) {
            const encryptedMessages = localStorage.getItem(`Group${router.query.id}Messages`)
            const decryptedMessages = decrypt(encryptedMessages, user.id);
            setMedia(decryptedMessages.messages.filter(x => x.file === "image/jpg" || x.file === "image/jpeg" || x.file === "image/png"))
        }
    }, [router.query.id, isAuthenticated])

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
                        {user.get("ethAddress") === groupData.owner && <button className={style.addMembersPageButton} onClick={() => setAddMember(true)}><FontAwesomeIcon icon={faUserPlus} /> Add members</button>}
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
                                        <div className={style.membersInfo} onClick={() => router.push(user.get("ethAddress") !== data.ethAddress ? `/users/${data.ethAddress}` : "/profile")}>
                                            <p>{data.username}</p>
                                            <p>@{data.userTag}</p>
                                        </div>
                                    </div>
                                    <div className={style.leftSection}>
                                        {groupData.owner === data.ethAddress && <div className={style.ownerTag}>
                                            <p>Owner</p>
                                        </div>}
                                        {groupData.owner === user.get("ethAddress") && user.get("ethAddress") !== data.ethAddress && <div className={style.memberOptions}>
                                            <button className={style.memberOptionsDots}><FontAwesomeIcon icon={faEllipsisV} /></button>
                                        </div>
                                        }
                                        {user.get("ethAddress") !== data.ethAddress && <button onClick={() => router.push(`/transfer/${data.userTag}`)} className={style.sendButton}><FontAwesomeIcon icon={faArrowAltCircleRight} /></button>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>}
            </div>}
            {nav === "media" && <div>
                {media.length === 0 && <div>
                    <h3 style={{
                        "width": "100%",
                        "textAlign": "center",
                        "marginTop": "30px"
                    }}>No media content</h3>
                </div>}
                {media.length > 0 && <div className={style.mediaContent}>
                    {media.map((image, i) => (
                        <div key={i} className={style.mediaImage}>
                            <Image src={image.message} alt="Group image"
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    ))}
                </div>}
            </div>}
        </div>
    )
}

export default MembersAndMedia