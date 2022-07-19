import { Moralis } from "moralis";

export const blockUser = async (getMuteNotifications_blockUsers , friendAddress , userAddress , getBlock)=>{
    const userBlocks= Moralis.Object.extend("Tags");
    const query = new Moralis.Query(userBlocks);
    query.equalTo("ethAddress", userAddress);
    const results = await query.first();
    if (results.attributes.blockUsers !== undefined) {
        results.set({
            blockUsers: [...results.attributes.blockUsers, friendAddress]
        })
        results.save()
    } else {
        results.set({
            blockUsers: [friendAddress]
        })
        results.save();
    }
    getMuteNotifications_blockUsers();
    getBlock(userAddress, "my")
}