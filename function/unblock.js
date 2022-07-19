import { Moralis } from "moralis";

export const unblockUser = async (getMuteNotifications_blockUsers, friendAddress, userAddress , getBlock) => {
    const userBlocks = Moralis.Object.extend("Tags");
    const query = new Moralis.Query(userBlocks);
    query.equalTo("ethAddress", userAddress);
    const results = await query.first();
    const filter = results.attributes.blockUsers.filter(x => x !== friendAddress)
    console.log(filter);
    results.set({
        blockUsers: filter
    })
    results.save()
    getMuteNotifications_blockUsers();
    getBlock(userAddress, "my")
}