import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { Moralis } from "moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../styles/Messages.module.css"
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

export default function Options({open , setOpen}) {
    const { setUserData, user } = useMoralis();
    const [error, setError] = useState("");

    return (
        <div className={style.containers}>
            <button className={style.options}><FontAwesomeIcon icon={faEllipsisV} onClick={()=> setOpen(!open)}/></button>
            <div className={style.optionsContainer} id={open === false ? style.close : style.open}>
                <button>Block</button>
                <button>Media</button>
                <button>Mute notifications</button>
                <button>Delete chat</button>
            </div>
        </div>
    );
}