import React, { useRef, useState } from 'react'
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { Moralis } from "moralis";
import style from "../../styles/Group.module.css"

const GroupData = () => {
    const fileRef = useRef();
    const [imageGroup, setImageGroup] = useState("")

    const changePhoto = async (e) => {
        const file = e.target.files[0];
        const type = e.target.files[0].type.replace("image/", "");
        const name = `profile.${type}`;
        const groupImage = new Moralis.File(name, file);
        await groupImage.saveIPFS();
        setImageGroup(groupImage.ipfs())
        console.log(profileFile.ipfs());
    };

    return (
        <div>
            <div>
                <div className={style.imageContainer}>
                    {imageGroup !== "" && (
                        <Image
                            src={imageGroup}
                            alt="group image"
                            width="90%"
                            height="90%"
                            layout="fill"
                            objectFit="cover"
                            className={style.img}
                        />
                    )}
                    {imageGroup === "" &&
                        <div>
                            <p>Select group image</p>
                        </div>}
                    <button
                        onClick={() => {
                            fileRef.current.click();
                        }}
                        className={style.change}
                    >
                        <FontAwesomeIcon icon={faCamera} color="white" />
                    </button>
                    <input
                        type="file"
                        onChange={changePhoto}
                        ref={fileRef}
                        style={{
                            display: "none",
                        }}
                    />
                </div>
                <div className={style.info}>
                    <div>
                        <label>Name</label>
                        <input type="text" />
                    </div>
                </div>
                <div className={style.info}>
                    <div>
                        <label>Description</label>
                        <textarea name="description" cols="30" rows="10"></textarea>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GroupData