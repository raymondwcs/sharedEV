const TOKEN_URI_01 = "https://gateway.pinata.cloud/ipfs/QmTWLi3k8iDnwPDnbEqGVDpy5hYi3gytbX48K5UUibcHJ4"
const TOKEN_URI_02 = "https://gateway.pinata.cloud/ipfs/QmRoJCXRpiu8ci2tavj2Uex6pfMpUBq1UKfuwvPBT56RuZ"
const TOKEN_URI_03 = "https://gateway.pinata.cloud/ipfs/QmbiiNo8Siog7qEJe2t428vbvkiXA9gfycMRnw2erXjbmP"
const TOKEN_URI_04 = "https://gateway.pinata.cloud/ipfs/QmcPdE7UDXi5krxfB2eLkM3yp5uswMDVrRaAjPZNE5QCTE"
const TOKEN_URI_05 = "https://gateway.pinata.cloud/ipfs/QmPaDfL8qmVxePKxu41AqPQCW9PHyGTeER6hNM1LfXYxLQ"
const TOKEN_URI_06 = "https://gateway.pinata.cloud/ipfs/QmZBA3btnGjpfjvSgQejqTWuajEtM3R6m91VBD6W21CBo9"

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
        await instance.createSharedEV(TOKEN_URI_05)
        await instance.createSharedEV(TOKEN_URI_06)

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