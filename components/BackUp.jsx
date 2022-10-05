import React, { useState } from 'react'
import { useMoralis } from "react-moralis";
import AES from 'crypto-js/aes';
import ENC from 'crypto-js/enc-utf8'

const BackUp = ({style}) => {
    const { user } = useMoralis();
    const [data , setData] = useState([])

    const getLocalStorageKey = ()=>{
        const eth = user.get("ethAddress")
        let arr= []
        for(let key in localStorage){
            if(key.includes(eth)){
                arr.push([key,localStorage.getItem(key)])
            }
        }
        const messageOrder = JSON.parse(localStorage.getItem(`${eth}Order`))
        console.log(messageOrder)
        for(let i=0;i<messageOrder.length;i++){
            if(messageOrder[i].type === "group"){
                arr.push([`Group${messageOrder[i].groupRef}Key`,localStorage.getItem(`Group${messageOrder[i].groupRef}Key`)])
                arr.push([`Group${messageOrder[i].groupRef}Messages`,localStorage.getItem(`Group${messageOrder[i].groupRef}Messages`)])
            }else{
                arr.push([`${messageOrder[i].chat}${eth}`, localStorage.getItem(`${messageOrder[i].chat}${eth}`)])
            }
        }
        console.log(arr)
        setData(arr)
    }  

  return (
    <div className={style.dataUser}>
        <button onClick={getLocalStorageKey}>Back up</button>
    </div>
  )
}

export default BackUp