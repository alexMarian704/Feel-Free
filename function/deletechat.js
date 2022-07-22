export const deleteChat = (userAddress , friendAddress , router)=>{
    let array = JSON.parse(localStorage.getItem(`${userAddress}Order`));
    let filterArray = array.filter(x => x.chat !== friendAddress)
    localStorage.setItem(`${userAddress}Order`, JSON.stringify(filterArray));
    localStorage.removeItem(friendAddress+userAddress);
    router.push("/");
}