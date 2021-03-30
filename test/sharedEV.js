const SharedEV = artifacts.require("SharedEV");

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');

// const TOKEN_URI_01 = "https://gateway.pinata.cloud/ipfs/QmTWLi3k8iDnwPDnbEqGVDpy5hYi3gytbX48K5UUibcHJ4"
// const TOKEN_URI_02 = "https://gateway.pinata.cloud/ipfs/QmRoJCXRpiu8ci2tavj2Uex6pfMpUBq1UKfuwvPBT56RuZ"
const TOKEN_URI_01 = "https://gateway.pinata.cloud/ipfs/QmbTCNfiAZk9jPZLYgyEWNXTwrDM1R1eTfB73XVZk12k43"
const TOKEN_URI_02 = "https://gateway.pinata.cloud/ipfs/Qma2MwjWSX3KPYrMWhs34bYwMgcjiyF3hSgjwQikaDSi7Z"

contract("createSharedEV() test", async accounts => {
    it("create 2 shared EV", async () => {
        const instance = await SharedEV.deployed()
        const owner = await instance.owner()
        console.log(`owner(): ${owner}`)
        console.log(`accounts[0]: ${accounts[0]}`)

        let receipt = await instance.createSharedEV(TOKEN_URI_01)
        expectEvent(receipt, 'createSharedEVEvent', {
            customer: owner,
            tokenURI: TOKEN_URI_01,
        })

        receipt = await instance.createSharedEV(TOKEN_URI_02)
        expectEvent(receipt, 'createSharedEVEvent', {
            customer: owner,
            tokenURI: TOKEN_URI_02,
        })

        let totalSupply = await instance.totalSupply()
        assert.equal(totalSupply, 2)

        let balance = await instance.balanceOf(owner)
        assert.equal(balance, 2)

        let evs = await instance.getEVInfo()
        assert.equal(evs.length, 2)
    })

    it("Normal checkout - accounts[1] checkout 1st sharedEV", async () => {
        const instance = await SharedEV.deployed()
        const owner = await instance.owner()

        receipt = await instance.checkOut(accounts[1], 1, { from: owner })
        expectEvent(receipt, 'checkOutEvent', {
            customer: accounts[1],
            tokenId: new web3.utils.BN(1)
        })

        let balance = await instance.balanceOf(accounts[1])
        assert.equal(balance, 1)

        let who = await instance.ownerOf(1)
        assert.equal(who, accounts[1])
    })

    it("Abnomral checkout accounts[2] checkout 1st sharedEV", async () => {
        const instance = await SharedEV.deployed()
        const owner = await instance.owner()
        await expectRevert(instance.checkOut(accounts[2], 1, { from: owner }), "Not Available")
    })

    it("Abnormal checkout accounts[1] checkout 2nd sharedEV", async () => {
        const instance = await SharedEV.deployed()
        const owner = await instance.owner()
        await expectRevert(instance.checkOut(accounts[1], 2, { from: owner }), "Exceed Max Checkout Limit")
    })

    it("Abnormal checkin - accounts[2] checkin someone else's sharedEV", async () => {
        const instance = await SharedEV.deployed()

        await expectRevert(instance.checkIn(1, { from: accounts[2] }), "Not Owner")
    })

    it("Normal checkin - accounts[1] checkin her sharedEV", async () => {
        const instance = await SharedEV.deployed()
        const owner = await instance.owner()

        let who = await instance.ownerOf(1)
        assert.equal(accounts[1], who)

        receipt = await instance.checkIn(1, { from: accounts[1] })
        expectEvent(receipt, 'checkInEvent', {
            customer: accounts[1],
            tokenId: new web3.utils.BN(1)
        })

        let balance = await instance.balanceOf(accounts[1])
        assert.equal(balance, 0)

        who = await instance.ownerOf(1)
        assert.equal(owner, who)
    })
});