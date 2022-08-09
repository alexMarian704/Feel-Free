import React from 'react'
import Image from "next/image";
import ProfilePicture from "../../public/profile.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const FriendData = ({ friend, style, selectFriend, select }) => {
    return (
        <div className={style.friendContainer} onClick={() => select(friend.ethAddress)}>
            <div className={style.imgProfile}>
                {friend.profilePhoto !== undefined && (
                    <Image
                        src={friend.profilePhoto}
                        alt="profilePhoto"
                        width="50%"
                        height="50%"
                        layout="fill"
                        objectFit="cover"
                        className={style.img}
                    />
                )}
                {friend.profilePhoto === undefined && (
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
                <div style={{
                    "opacity": selectFriend.includes(friend.ethAddress) ? 1 : 0,
                    "width": selectFriend.includes(friend.ethAddress) ? "23px" : "17px",
                    "right": selectFriend.includes(friend.ethAddress) ? "-4px" : "10px"
                }} className={style.includes}>
                    <FontAwesomeIcon icon={faCheck} />
                </div>
            </div>
            <div className={style.data}>
                <p>{friend.username}</p>
                <p>@{friend.userTag}</p>
            </div>
        </div>
    )
}

export default FriendData