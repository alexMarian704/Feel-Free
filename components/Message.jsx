import React from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../styles/Messages.module.css"
import { faCheckDouble } from "@fortawesome/free-solid-svg-icons";

export default function RenderMessage({ message, number, total, refMes, unread , focusImage , setFocusImage }) {
  const d = new Date(message.time);
  let time = d.getHours();
  let minutes = d.getMinutes();
  let hours = d.getHours();

  if (message.type === 1) {
    if (message.image === true)
      return (
        <div className={style.myMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.myImgContainer}>
            <img
              src={message.message}
              alt="Image"
              width="100%"
              height="100%"
              layout="responsive"
              objectfit="contain"
              className={style.img}
              onClick={()=> setFocusImage(message.message)}
            />
            <p className={style.tailM}></p>
            {minutes >= 10 && <p className={style.myMessageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.myMessageTime}>{`${hours}:0${minutes}`}</p>}
            {number > total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} /></p>}
            {number <= total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} color="#00e600" /></p>}
          </div>
        </div>
      );
    else
      return (
        <div className={style.myMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.myMessageContainer}>
            <p className={style.myText}>{message.message}</p>
            <p className={style.tailM}></p>
            {minutes >= 10 && <p className={style.myMessageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.myMessageTime}>{`${hours}:0${minutes}`}</p>}
            {number > total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} /></p>}
            {number <= total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} color="#00e600" /></p>}
          </div>
        </div>
      );
  } else if (message.type === 2) {
    if (message.image === true)
      return (
        <div className={style.friendMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.myImgContainer} style={{
            background:"rgb(48, 48, 48)",
            borderRadius:"8px 8px 8px 0px",
            marginLeft:"12px",
            marginRight:"0px"
          }}>
            <img
              src={message.message}
              alt="Image"
              width="100%"
              height="100%"
              layout="responsive"
              objectfit="contain"
              className={style.img}
              onClick={()=> setFocusImage(message.message)}
            />
            <p className={style.tailF}></p>
            {minutes >= 10 && <p className={style.messageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.messageTime}>{`${hours}:0${minutes}`}</p>}
          </div>
        </div>
      );
    else
      return (
        <div className={style.friendMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.friendContainer}>
            <p className={style.friendText}>{message.message}</p>
            <p className={style.tailF}></p>
            {minutes >= 10 && <p className={style.messageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.messageTime}>{`${hours}:0${minutes}`}</p>}
          </div>
        </div>
      )
  }
}