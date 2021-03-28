const TOKEN_URI_01 = "https://gateway.pinata.cloud/ipfs/QmbTCNfiAZk9jPZLYgyEWNXTwrDM1R1eTfB73XVZk12k43"
const TOKEN_URI_02 = "https://gateway.pinata.cloud/ipfs/Qma2MwjWSX3KPYrMWhs34bYwMgcjiyF3hSgjwQikaDSi7Z"
const TOKEN_URI_03 = "https://gateway.pinata.cloud/ipfs/Qmf2CbdjBS955SxDHrE2BxsaEoZvK9AfJnRuYdWL9jDSEr"
const TOKEN_URI_04 = "https://gateway.pinata.cloud/ipfs/QmbjZdTZHrw5tyGLpGx2q61Yxm3fXo9o4EDqfDZq2EKeDr"

module.exports = async function main(callback) {
    try {
        const accounts = await web3.eth.getAccounts()
        const sharedEV = artifacts.require("SharedEV")
        const instance = await sharedEV.deployed()

        console.log(`Contract owner: ${await instance.owner()}`)

        await instance.createSharedEV(TOKEN_URI_01)
        await instance.createSharedEV(TOKEN_URI_02)
        await instance.createSharedEV(TOKEN_URI_03)
        await instance.createSharedEV(TOKEN_URI_04)

        console.log(`totalSupply(): ${await instance.totalSupply()}`)

        // for (let i = 0; i < await coupon.totalSupply(); i++) {
        //     let tokenId = await coupon.tokenByIndex(i)
        //     let c = await coupon.coupons(tokenId)
        //     console.log(`${tokenId}.redeemed = ${c.redeemed}`)
        // }

        // try {
        //     await coupon.redeem(1)
        // } catch (error) {
        //     console.log(error.message)
        // }

        callback(0);
    } catch (error) {
        console.error(error);
        callback(1);
    }
}