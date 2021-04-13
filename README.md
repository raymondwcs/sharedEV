# An Example of Using Non-Fungible Token (NFT)
This is a proof-of-concept example of using NFT to implement a simple shared vechicle app.  

Each shared vechicle, and more specifically its right-to-use, are modelled as a [RC721](https://docs.openzeppelin.com/contracts/3.x/erc721) token.  The two key end user operations `check-out` and `check-in` are defined in the [Solidity contact](contacts/SharedEv.sol).

## Running the app
The app and a personal Ethereum blockchain are [dockerized](docker-compose.yml).

1. To start the app and [`ganache-cli`](https://github.com/trufflesuite/ganache-cli)
```
docker-compose up
```
2. Open `localhost:3000` in your web browser to run the app

## Screenshoot
![](SharedEV.png)

