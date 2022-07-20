import React, { useState } from 'react'
import style from "../styles/Messages.module.css"
import ProfilePicture from "../public/profile.jpg";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser, faAt } from "@fortawesome/free-solid-svg-icons";

const Media = ({ setOpenMedia, messages, friendData, setFocusImage }) => {
    const [includes, setIncludes] = useState(messages.filter(x => x.image === true).length > 0)
    return (
        <div className={style.mediaContainer}>
            <button className={style.mediaBackBut} onClick={() => setOpenMedia(false)}><FontAwesomeIcon icon={faArrowLeft} /> </button>
            <div className={style.friendData}>
                <div className={style.mediaImageProfile}>
                    {friendData.profilePhoto !== undefined && <Image src={friendData.profilePhoto} alt="Profile Photo"
                        layout="fill"
                        objectFit="cover" />}
                    {friendData.profilePhoto == undefined && <Image src={ProfilePicture} alt="Profile Photo" />}
                </div>
                <div className={style.mediaInfo}>
                    <div>
                        <h4>
                            <FontAwesomeIcon icon={faUser} className={style.icons} />
                        </h4>
                        <h4>{friendData.name} {friendData.name2}</h4>
                    </div>
                    <div>
                        <h4>
                            <FontAwesomeIcon icon={faAt} className={style.icons} />
                        </h4>
                        <h4>@{friendData.userTag}</h4>
                    </div>
                </div>
            </div>
            
            <div className={style.mediaContent}>
                {includes === false && <div>
                    <h4>No media content</h4>
                </div>}
                {includes === true && messages.map((image , i) => {
                    if (image.image === true) {
                        return (
                            <div className={style.mediaRenderImage} key={i}>
                                <Image src={image.message} alt="Profile Photo"
                                    layout="fill"
                                    objectFit="cover" 
                                    onClick={()=> setFocusImage(image.message)}
                                    />
                            </div>
                        )
                    }
                })}
            </div>
        </div>
    )
}

export default Media