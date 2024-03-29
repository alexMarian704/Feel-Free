import React, { useState } from "react";
import { useMoralis } from "react-moralis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import style from "../styles/Messages.module.css"
import { faCheckDouble, faCaretDown } from "@fortawesome/free-solid-svg-icons";

export default function RenderGroupMessage({ message, number, total, refMes, setReply, openReply, setOpenReply, scrollIntoViewIndicator, setScrollIntoViewIndicator, nameColors, unread, previousTag, setMessageInfo, setFocusImage, onComplete, deleteForYou, deleteRequest }) {
  const { user } = useMoralis()
  const d = new Date(message.time);
  let minutes = d.getMinutes();
  let hours = d.getHours();

  function detectLink(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '" className=linkMessage target=_blank>' + url + '</a>';
    });
  }

  if (message.type === user.get("userTag")) {
    if (message.file === "image/jpg" || message.file === "image/png" || message.file === "image/jpeg")
      return (
        <div className={style.myMessage} ref={number === total - 1 ? refMes : undefined} style={{
          background: scrollIntoViewIndicator === message.time ? "rgba(128, 0, 64, 0.5)" : "transparent"
        }}>
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
              onLoad={onComplete}
              onError={onComplete}
            />
            <p className={style.tailM}></p>
            {minutes >= 10 && <p className={style.myMessageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.myMessageTime}>{`${hours}:0${minutes}`}</p>}
            {number > total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} /></p>}
            {number <= total - 1 - unread && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} color="#00e600" /></p>}
            <button className={style.messageOptions} style={{
              right: "10px",
              top: "10px"
            }} onClick={() => {
              if (openReply !== number)
                setOpenReply(number)
              else
                setOpenReply(-1)
            }}><FontAwesomeIcon icon={faCaretDown} /></button>
            {openReply === number && <div className={style.messageOptionsContainer} style={{ top: "-158px" }}>
              <button onClick={() => { setReply({ message: message.message, time: message.time, image: true }), setOpenReply(-1) }}>Reply</button>
              <button onClick={() => { deleteRequest(message.time), setOpenReply(-1) }}>Delete</button>
              <button onClick={() => { setOpenReply(-1), setMessageInfo(message.time) }} >Info</button>
            </div>}
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
        <div className={style.myMessage} ref={number === total - 1 ? refMes : undefined} id={message.time}
          style={{
            background: scrollIntoViewIndicator === message.time ? "rgba(128, 0, 64, 0.5)" : "transparent"
          }}
        >
          <div className={style.myMessageContainer}>
            {message.delete !== true && message.reply && <div className={style.replyMessage} onClick={() => {
              if (document.getElementById(message.reply.time).innerHTML.includes("color: rgb(170, 170, 170)") === false) {
                document.getElementById(message.reply.time).scrollIntoView()
                setScrollIntoViewIndicator(message.reply.time)
                setTimeout(() => {
                  setScrollIntoViewIndicator("")
                }, 2000)
              }
            }}>
              <p>{message.reply.message}</p>
            </div>}
            <p className={style.myText} style={{
              "fontStyle": message.delete !== true ? "normal" : "italic",
              "color": message.delete !== true ? "white" : "rgb(170,170,170)"
            }} dangerouslySetInnerHTML={{ __html: detectLink(message.message) !== message.message ? detectLink(message.message) : message.message }} />
            <p className={style.tailM}></p>
            {minutes >= 10 && <p className={style.myMessageTime} style={{
              "right": message.delete !== true ? "27px" : "6px"
            }}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.myMessageTime} style={{
              "right": message.delete !== true ? "27px" : "6px"
            }}>{`${hours}:0${minutes}`}</p>}
            {number > total - 1 - unread && message.delete !== true && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} /></p>}
            {number <= total - 1 - unread && message.delete !== true && <p className={style.checkMessage}><FontAwesomeIcon icon={faCheckDouble} color="#00e600" /></p>}
            {message.delete !== true && <button className={style.messageOptions} onClick={() => {
              if (openReply !== number)
                setOpenReply(number)
              else
                setOpenReply(-1)
            }}><FontAwesomeIcon icon={faCaretDown} /></button>}
            {openReply === number && <div className={style.messageOptionsContainer} style={{ top: "-158px" }}>
              <button onClick={() => { setReply({ message: message.message, time: message.time }), setOpenReply(-1) }}>Reply</button>
              <button onClick={() => { deleteRequest(message.time), setOpenReply(-1) }}>Delete</button>
              <button onClick={() => { setOpenReply(-1), setMessageInfo(message.time) }} >Info</button>
            </div>}
          </div>
        </div>
      );
  } else if (message.type !== user.get("userTag")) {
    if (message.file === "image/jpg" || message.file === "image/png" || message.file === "image/jpeg")
      return (
        <div className={style.friendMessage} ref={number === total - 1 ? refMes : undefined} style={{
          background: scrollIntoViewIndicator === message.time ? "rgba(128, 0, 64, 0.5)" : "transparent"
        }}>
          <div className={style.myImgContainer} style={{
            background: "rgb(48, 48, 48)",
            borderRadius: "8px 8px 8px 0px",
            marginLeft: "12px",
            marginRight: "0px"
          }}>
            <img
              onLoad={onComplete}
              onError={onComplete}
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
            <button className={style.messageOptions} style={{
              right: "10px",
              top: "10px"
            }} onClick={() => {
              if (openReply !== number)
                setOpenReply(number)
              else
                setOpenReply(-1)
            }}><FontAwesomeIcon icon={faCaretDown} /></button>
            {openReply === number && <div className={style.messageOptionsContainerFriend}>
              <button onClick={() => { setReply({ message: message.message, time: message.time, image: true }), setOpenReply(-1) }}>Reply</button>
              <button onClick={() => { deleteForYou(message.time , "you" , user.get("userTag")), setOpenReply(-1) }}>Delete for you</button>
            </div>}
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
        <div className={style.friendMessage} ref={number === total - 1 ? refMes : undefined} id={message.time} style={{
          background: scrollIntoViewIndicator === message.time ? "rgba(128, 0, 64, 0.5)" : "transparent"
        }}>
          <div className={style.friendContainer}>
            {previousTag !== message.type && <p style={{
              "color": nameColors[nameColors.indexOf(message.type) + 1]
            }} className={style.friendTagMessage}>@{message.type}</p>}
            {message.delete !== true && message.reply && <div className={style.replyMessage} onClick={() => {
              document.getElementById(message.reply.time).scrollIntoView()
              setScrollIntoViewIndicator(message.reply.time)
              setTimeout(() => {
                setScrollIntoViewIndicator("")
              }, 2000)
            }}>
              <p>{message.reply.message}</p>
            </div>}
            <p className={style.friendText} style={{
              "fontStyle": message.delete !== true ? "normal" : "italic",
              "color": message.delete !== true ? "white" : "rgb(170,170,170)"
            }} dangerouslySetInnerHTML={{ __html: detectLink(message.message) !== message.message ? detectLink(message.message) : message.message }} />
            <p className={style.tailF}></p>
            {minutes >= 10 && <p className={style.messageTime}>{`${hours}:${minutes}`}</p>}
            {minutes < 10 && <p className={style.messageTime}>{`${hours}:0${minutes}`}</p>}
            {message.delete !== true && <button className={style.messageOptions} onClick={() => {
              if (openReply !== number)
                setOpenReply(number)
              else
                setOpenReply(-1)
            }}><FontAwesomeIcon icon={faCaretDown} /></button>}
            {openReply === number && <div className={style.messageOptionsContainerFriend}>
              <button onClick={() => { setReply({ message: message.message, time: message.time }), setOpenReply(-1) }}>Reply</button>
              <button onClick={() => { deleteForYou(message.time, "you" , user.get("userTag")), setOpenReply(-1) }}>Delete for you</button>
            </div>}
          </div>
        </div>
      )
  }
}