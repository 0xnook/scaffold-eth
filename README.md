# 🌊 Superfluid

## Tutorial info
**Author:** nook
**Source code:** TODO
**Intended audience:** Beginners
**Topics:** Token streaming, Superfluid

## Introduction
A component that uses [@superfluid-finance/js-sdk](https://github.com/superfluid-finance/superfluid-protocol-docs/blob/master/protocol-tutorials/frontend-+-nodejs.md) to upgrade/downgrade super tokens, create new flows, and start streaming money in real time 🏄. 

## Prerequesites
Make sure you have some kovan ETH.

## Quickstart
Clone the repo
```bash
git clone https://github.com/0xnook/scaffold-eth.git
```

Get dependencies
```bash
yarn install
```

Edit 'packages/react-app/src/App.jsx' with one of the [available networks](https://docs.superfluid.finance/superfluid/networks/networks) (Kovan by default)
```js
...
const targetnetwork = networks.kovan; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)
...
```


Start the frontend, and open [http://localhost:3000](http://localhost:3000)
```bash
yarn start
```

## Superfluid component
`<Superfluid />`: A dashboard to create and view Superfluid money streams. 

The superfluid component is already initialized for you in 'packages/react-app/src/App.jsx'


### Props
- address: the current user address or ENS  
- provider: web3 provider
- tokens: the list desired tokens


```
<Superfluid
      address={address}
      provider={injectedProvider}
      tokens={["fDAI", "fUSDC"]}
      />
```

The superfluid/js-sdk will take care of calling the resolver contract and retrieve the corresponding token contracts for the selected network, so no need to manually provide the contract addresses.

### Fake token faucet
TODO


### Adding a flow recipient and sending a stream
After adquiring fake tokens, they can be upgraded to super tokens, to do this
first make a token approval transaction by clicking the `Approve unlimited spending` button. 

After approving, enter the desired amount to upgrade and click the `Upgrade to super token` button.

<img src="https://siasky.net/bAAWH6fHp9zGtMutEUkc8Ngs89cdY9N-bn1VJw34SqlCTw" width="250">
  

The superfluid/js-sdk will take care of calling the resolver contract and retrieve the corresponding token contracts for the selected network, so no need to manually provide the contract addresses.

### Fake token faucet
TODO


### Adding a flow recipient and sending a stream
After adquiring fake tokens, they can be upgraded to super tokens, to do this
first make a token approval transaction by clicking the `Approve unlimited spending` button. 

After approving, enter the desired amount to upgrade and click the `Upgrade to super token` button.

<img src="https://siasky.net/bAAWH6fHp9zGtMutEUkc8Ngs89cdY9N-bn1VJw34SqlCTw" width="250">
>>>>>>> e9716ff0abf6160323a1fe593df93f6dd6f5ab16


### Add a new stream recipient
Lets create Bob as our first recipient. To do this enter Bob's name and a valid ethereum address in the form shown below.

After adding Bob as a recipient, a new panel with his flows will appear.

<img src="https://siasky.net/BAAzSLcGV69el6FV6a6JKPY4kGmGcO53dCqWLEW-sGnP8g" width="250">

### Send a new flow to Bob
Lets stream $1000 fDAI to Bob for a month.

To start the new flow, select fDAI from the dropdown shown below, and set the flow rate to 385802469135802, this corresponds to $1000 fDAI per month. Finally, click the `Create new flow` button and sign the transaction to start the stream.

After doing this, you can see the new flow in the fDAI outflows section of your flow panel, and as an fDAI inflow on Bob's pannel.

<img src="https://siasky.net/JADoxvdobuSovhgxE9hCIDFjpjWhCR19RjWVTszTG-n7gQ" width="250">
