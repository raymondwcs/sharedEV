require('dotenv').config();
const API_URL = process.env.API_URL;
const MNEMONIC = process.env.MNEMONIC;
const TOKEN_URI_01 = "https://gateway.pinata.cloud/ipfs/QmTWLi3k8iDnwPDnbEqGVDpy5hYi3gytbX48K5UUibcHJ4"
const TOKEN_URI_02 = "https://gateway.pinata.cloud/ipfs/QmRoJCXRpiu8ci2tavj2Uex6pfMpUBq1UKfuwvPBT56RuZ"
const { exit } = require('process');
const path = require('path');
const SharedEVABI = require(path.join(__dirname, './src/build/contracts/SharedEV.json'))
const Web3 = require('web3');
const contract = require("@truffle/contract");
const HDWalletProvider = require("@truffle/hdwallet-provider");
// const provider = new HDWalletProvider({
//     mnemonic: {
//         phrase: MNEMONIC
//     },
//     providerOrUrl: API_URL
// })
// const web3 = new Web3(provider)

var Web3HttpProvider = require('web3-providers-http');
var provider = new Web3HttpProvider('http://ganache-cli:8545');
var web3 = new Web3(provider);

const SharedEV = contract(SharedEVABI);
SharedEV.setProvider(provider);

// const getRandomInt = (max) => {
//     return Math.floor(Math.random() * Math.floor(max));
// }

const main = async () => {
    try {
        let instance = await SharedEV.deployed()
        let accounts = await web3.eth.getAccounts()

        let owner = await instance.owner()
        console.log(`owner(): ${owner}`)
        //console.log(`accounts: ${accounts}`)

        let receipt = await instance.createSharedEV(TOKEN_URI_01, { from: accounts[0] })
        console.log(receipt)
        receipt = await instance.createSharedEV(TOKEN_URI_02, { from: accounts[0] })
        console.log(receipt)

        receipt = await instance.checkOut(accounts[9], 1, { from: accounts[0] })
        console.log(receipt)

        exit(0)

    } catch (error) {
        console.error(error.message)
        exit(-1)
    }
}

main()