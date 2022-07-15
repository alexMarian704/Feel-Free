export const messageOrder = (address, chat) => {
    if (localStorage.getItem(`${address}Order`) !== null) {
        let array = JSON.parse(localStorage.getItem(`${address}Order`));
        let filterArray = array.filter(x => x !== chat)
        console.log(filterArray);
        for(let i=filterArray.length;i>0;i--){
            filterArray[i]=filterArray[i-1];
        }
        filterArray[0]=chat;
        console.log(filterArray);
        localStorage.setItem(`${address}Order` , JSON.stringify(filterArray));
    } else {
        localStorage.setItem(`${address}Order`, JSON.stringify([chat]))
    }
}