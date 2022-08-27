import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../../styles/GroupChat.module.css"
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

const GroupOptions = () => {
    const [open, setOpen] = useState(false)

    return (
        <div className={style.containers}>
            <button className={style.options} onClick={() => setOpen(!open)} ><FontAwesomeIcon icon={faEllipsisV} /></button>
            <div className={style.optionsContainer} id={open === false ? style.close : style.open}>
                <button onClick={()=> console.log("salut") }>Media</button>
                <button>Delete chat</button>
            </div>
        </div>
    )
}

export default GroupOptions