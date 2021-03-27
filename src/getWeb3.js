import Web3 from 'web3'
// This function detects most providers injected at window.ethereum
import detectEthereumProvider from '@metamask/detect-provider'
// import HDWalletProvider from '@truffle/hdwallet-provider'
// const HDWalletProvider = require("@truffle/hdwallet-provider")

let web3 = null
let getWeb3 = new Promise(async (resolve, reject) => {
    const provider = await detectEthereumProvider()
    // From now on, this should always be true:
    // provider === window.ethereum
    if (provider) {
        console.log('Injected web3 detected.');
        web3 = new Web3(provider)
    } else {
        var Web3HttpProvider = require('web3-providers-http');
        var customProvider = new Web3HttpProvider('http://localhost:8545');
        web3 = new Web3(customProvider)
        // console.log(`No web3 instance injected, using ${process.env.REACT_APP_API_URL} defined in .env`)
        // require('dotenv').config({ path: "../.env" })
        // if (process.env.REACT_APP_MNEMONIC && process.env.REACT_APP_API_URL) {
        //     let customProvider = new HDWalletProvider({
        //         mnemonic: {
        //             phrase: process.env.REACT_APP_MNEMONIC
        //         },
        //         providerOrUrl: process.env.REACT_APP_API_URL,
        //         numberOfAddresses: 10,
        //     })
        // } else {
        //     return reject(new Error('getWeb3(): .env does not exist or contain the required parameters!'))
        // }
    }

    let accounts = await web3.eth.getAccounts()
    let network = await getNetwork(web3)

    let results = {
        web3: web3,
        accounts: accounts,
        network: network,
    }

    return resolve(results)
})

const getNetwork = (web3) => {
    return new Promise(async (resolve, reject) => {
        let network = {}
        network['id'] = await web3.eth.net.getId()
        network['networkType'] = await web3.eth.net.getNetworkType()
        // console.log(`network: ${JSON.stringify(network)}`)

        return resolve(network)
    })
}
export default getWeb3
