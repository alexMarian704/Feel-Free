export const messageOrder = (address, chat, lastMessage, name, name2, time , last, file , tag) => {
    if (localStorage.getItem(`${address}Order`) !== null) {
        let array = JSON.parse(localStorage.getItem(`${address}Order`));
        let filterArray = array.filter(x => x.chat !== chat)
        for (let i = filterArray.length; i > 0; i--) {
            filterArray[i] = filterArray[i - 1];
        }
        filterArray[0] = {
            chat,
            lastMessage,
            name,
            name2,
            time,
            last,
            file,
            tag
        };
        console.log(filterArray)
        localStorage.setItem(`${address}Order`, JSON.stringify(filterArray));
    } else {
        localStorage.setItem(`${address}Order`, JSON.stringify([
            {
                chat,
                lastMessage,
                name,
                name2, 
                time,
                last,
                file,
                tag
            }
        ]))
    }
}