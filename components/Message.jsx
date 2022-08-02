import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../styles/Messages.module.css"
import { faCheckDouble, faCaretDown } from "@fortawesome/free-solid-svg-icons";

export default function RenderMessage({ message, number, total, refMes, unread, focusImage, setFocusImage, setReply, openReply, setOpenReply }) {
  const d = new Date(message.time);
  let time = d.getHours();
  let minutes = d.getMinutes();
  let hours = d.getHours();

  if (message.type === 1) {
    if (message.file === "image/jpg" || message.file === "image/png" || message.file === "image/jpeg")
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
              onClick={() => setFocusImage(message.message)}
            />
            <p className={style.tailM}></p>
            {minutes >= 10 && <p className={style.myMessageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.myMessageTime}>{`${hours}:0${minutes}`}</p>}
            {number > total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} /></p>}
            {number <= total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} color="#00e600" /></p>}
          </div>
        </div>
      );
    else if (message.file === "text/plain")
      return (
        <div className={style.myMessage} ref={number === total - 1 ? refMes : undefined}>
          <a className={style.painTextFile} href={message.message} download><span>{message.fileName}</span></a>
        </div>
      )
    else if (message.file === "application/pdf")
      return (
        <div className={style.myMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.myPDFContainer}>
            <iframe src={message.message} frameBorder="0" className={style.filePDF}></iframe>
          </div>
        </div>
      )
    else
      return (
        <div className={style.myMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.myMessageContainer}>
            {message.reply && <div className={style.replyMessage}>
              <p>{message.reply.message}</p>
            </div>}
            <p className={style.myText}>{message.message}</p>
            <p className={style.tailM}></p>
            {minutes >= 10 && <p className={style.myMessageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.myMessageTime}>{`${hours}:0${minutes}`}</p>}
            {number > total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} /></p>}
            {number <= total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} color="#00e600" /></p>}
            <button className={style.messageOptions} onClick={() => {
              if (openReply !== number)
                setOpenReply(number)
              else
                setOpenReply(-1)
            }}><FontAwesomeIcon icon={faCaretDown} /></button>
            {openReply === number && <div className={style.messageOptionsContainer}>
              <button onClick={() => { setReply({ message: message.message, time: message.time }), setOpenReply(-1) }}>Reply</button>
            </div>}
          </div>
        </div>
      );
  } else if (message.type === 2) {
    if (message.file === "image/jpg" || message.file === "image/png" || message.file === "image/jpeg")
      return (
        <div className={style.friendMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.myImgContainer} style={{
            background: "rgb(48, 48, 48)",
            borderRadius: "8px 8px 8px 0px",
            marginLeft: "12px",
            marginRight: "0px"
          }}>
            <img
              src={message.message}
              alt="Image"
              width="100%"
              height="100%"
              layout="responsive"
              objectfit="contain"
              className={style.img}
              onClick={() => setFocusImage(message.message)}
            />
            <p className={style.tailF}></p>
            {minutes >= 10 && <p className={style.messageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.messageTime}>{`${hours}:0${minutes}`}</p>}
          </div>
        </div>
      );
    else if (message.file === "text/plain")
      return (
        <div className={style.friendMessage} ref={number === total - 1 ? refMes : undefined}>
          <a className={style.painTextFileFriend} href={message.message} download><span>{message.fileName}</span></a>
        </div>
      )
    else if (message.file === "application/pdf")
      return (
        <div className={style.friendMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.friendPDFContainer}>
            <iframe src={message.message} frameBorder="0" className={style.filePDF}></iframe>
          </div>
        </div>
      )
    else
      return (
        <div className={style.friendMessage} ref={number === total - 1 ? refMes : undefined}>
          <div className={style.friendContainer}>
            <p className={style.friendText}>{message.message}</p>
            <p className={style.tailF}></p>
            {minutes >= 10 && <p className={style.messageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.messageTime}>{`${hours}:0${minutes}`}</p>}
            <button className={style.messageOptions} onClick={() => {
              if (openReply !== number)
                setOpenReply(number)
              else
                setOpenReply(-1)
            }}><FontAwesomeIcon icon={faCaretDown} /></button>
            {openReply === number && <div className={style.messageOptionsContainerFriend}>
              <button onClick={() => { setReply({ message: message.message, time: message.time }), setOpenReply(-1) }}>Reply</button>
            </div>}
          </div>
        </div>
      )
  }
}