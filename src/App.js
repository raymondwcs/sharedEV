import React from 'react';
// import ReactDOM from 'react-dom';
import { Button, ButtonGroup, ButtonToolbar, Container, Table, Col, Card, Form, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import getWeb3 from "./getWeb3";
import SharedEVContract from "./build/contracts/SharedEV.json";

const App = () => {
  const [web3, setWeb3] = React.useState(null)
  const [eventHistory, setEventHistory] = React.useState(null)
  const [accounts, setAccounts] = React.useState(null)
  const [myAccount, setMyAccount] = React.useState(null)
  const [network, setNetwork] = React.useState(null)
  const [sharedEVInstance, setSharedEVInstance] = React.useState(null)
  const [evInfo, setEvInfo] = React.useState(null)
  const [evInfoUpdated, setEVInfoUpdated] = React.useState(true)
  const [eventHistoryUpdated, setEventHistoryUpdated] = React.useState(true)

  React.useEffect(() => {
    getWeb3().then(results => {
      setWeb3(results.web3)
      setAccounts(results.accounts)
      setNetwork(results.network)
      // are we using ganache-cli?
      if (results.accounts.length > 1) {
        setMyAccount(results.accounts[9]) // exclude the last account
        setAccounts(results.accounts.slice(1, 10))
      } else {
        setMyAccount(results.accounts[0])
      }
      return results
    }).then(results => {
      const contract = require('@truffle/contract')
      const sharedEV = contract(SharedEVContract)
      sharedEV.setProvider(results.web3.currentProvider)
      return sharedEV.deployed()
    }).then(instance => {
      setSharedEVInstance(instance)
    }).catch(error => {
      console.error(error)
    })
  }, [])  // run once - as in ComponentDidMount()

  React.useEffect(() => {
    if (sharedEVInstance) {
      const getEVInfo = async () => {
        let x = await sharedEVInstance.getEVInfo()
        let evInfo = x.map(ev => {
          return ({
            tokenId: ev.tokenId,
            tokenURI: ev.tokenURI,
            description: ev.description,
            checkOutDate: parseInt(ev.checkOutDate),
            currentOwner: ev.customer,
          })
        })

        for (let ev of evInfo) {
          let response = await fetch(ev.tokenURI)
          let jsonResponse = await response.json()
          ev.image = jsonResponse.image
          ev.registration = jsonResponse.registration
        }
        setEvInfo(evInfo)
      }
      getEVInfo()
    }
  }, [myAccount, evInfoUpdated, sharedEVInstance])

  React.useEffect(() => {
    if (sharedEVInstance) {
      // checkOut events
      const updateEventHistory = async () => {
        let events = await sharedEVInstance.getPastEvents('checkOutEvent', { fromBlock: 0, toBlock: 'latest' })
        // let filteredEvents = events.filter(e => e.returnValues.customer === this.state.myAccount)
        let checkOutEvents = events.map(e => {
          return ({
            event: 'checkOutEvent',
            tokenId: e.returnValues.tokenId,
            blockTimeStamp: e.returnValues.blockTimeStamp,
            transactionHash: e.transactionHash,
            customer: e.returnValues.customer
          })
        })
        // checkIn events
        events = await sharedEVInstance.getPastEvents('checkInEvent', { fromBlock: 0, toBlock: 'latest' })
        // let filteredEvents = events.filter(e => e.returnValues.customer === this.state.myAccount)
        let checkInEvents = events.map(e => {
          return ({
            event: 'checkInEvent',
            tokenId: e.returnValues.tokenId,
            blockTimeStamp: e.returnValues.blockTimeStamp,
            transactionHash: e.transactionHash,
            customer: e.returnValues.customer
          })
        })
        let history = [...checkOutEvents, ...checkInEvents]
        setEventHistory(history.sort(compareTimeStamp))
      }
      updateEventHistory()
    }
  }, [eventHistoryUpdated, sharedEVInstance])

  const compareTimeStamp = (a, b) => {
    let eventA = a.blockTimeStamp
    let eventB = b.blockTimeStamp

    let comparison = 0
    if (eventA > eventB) {
      comparison = 1
    } else {
      comparison = -1
    }
    return comparison
  }

  const switchAccount = (account) => {
    setMyAccount(account)
  }
  // switchAccount = (account) => {
  //   this.setState({ myAccount: account }, () => {
  //     this.getEVInfo().then(evInfo => this.setState({ evInfo: evInfo }))
  //     this.updateEventHistory().then(history => this.setState({ eventHistory: history }))
  //     console.log(`switchAccount(${account}) myAccount: ${this.state.myAccount}`)
  //   })
  // }

  const checkOut = async (tokenId) => {
    let owner = await sharedEVInstance.owner()
    console.log(`checkOut(${tokenId}), owner: ${owner}, myAccount: ${myAccount},
    account[0]: ${accounts[0]}`)

    try {
      await sharedEVInstance.checkOut(
        myAccount,
        tokenId,
        { from: owner }
      )
    } catch (error) {
      console.log(JSON.stringify(error))
      alert(error.message)
    }

    setEVInfoUpdated(evInfoUpdated ? false : true)
    setEventHistoryUpdated(eventHistoryUpdated ? false : true)
    // this.getEVInfo().then(evInfo => this.setState({ evInfo: evInfo }))
    // this.updateEventHistory().then(history => this.setState({ eventHistory: history }))
  }

  const checkIn = async (tokenId) => {
    try {
      await sharedEVInstance.checkIn(tokenId, { from: myAccount })
    } catch (error) {
      console.log(JSON.stringify(error))
      alert(error.message)
    }

    setEVInfoUpdated(evInfoUpdated ? false : true)
    setEventHistoryUpdated(eventHistoryUpdated ? false : true)
    // this.getEVInfo().then(evInfo => this.setState({ evInfo: evInfo }))
    // this.updateEventHistory().then(history => this.setState({ eventHistory: history }))
  }

  if (!web3) {
    return <div>Loading Web3, accounts, and contract...</div>;
  } else {
    return (
      <Container>
        <div className="d-flex flex-row justify-content-center">
          <h1>Shared Cars</h1>
        </div>

        <div className="d-flex flex-row justify-content-center">
          {
            network ?
              <Provider networkType={network.networkType} Id={network.id} />
              :
              <div></div>
          }
        </div>

        <div className="d-flex flex-row justify-content-center">
          <ContractAddress contractInstance={sharedEVInstance} />
        </div>

        <div className="d-flex flex-row justify-content-center mt-2 mb-2">
          <AccountSelector
            accounts={accounts}
            switchAccount={switchAccount}
            currentAccount={myAccount}
          />
        </div>

        <div className="d-flex flex-row justify-content-center align-items-stretch" >
          <EVSelector evInfo={evInfo} me={myAccount} checkIn={checkIn} checkOut={checkOut} />
        </div>

        <div className="d-flex flex-row justify-content-center align-items-stretch mt-2" >
          <EventHistory events={eventHistory} />
        </div>

      </Container >
    );
  }
}

const EventHistory = (props) => {
  if (props.events === null || props.events === undefined || props.events.length === 0) {
    return < div ></div >
  }
  // let listItems = this.props.events.map((e) => <li key={e.transactionHash}>Value: {e.newValue} (was {e.oldValue})</li>)
  // return <ol>{listItems}</ol>
  let listItems = props.events.map((e) =>
    <tr key={e.transactionHash}>
      <td>{e.event}</td>
      <td>{e.tokenId}</td>
      <td>{e.customer}</td>
      <td>{new Date(e.blockTimeStamp * 1000).toLocaleString()}</td>
    </tr>
  )
  return (
    <div >
      <div className="d-flex justify-content-center">Transaction History</div>
      <div className="d-flex justify-content-center">
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th className="col-auto">Event</th>
              <th className="col-auto">Car</th>
              <th className="col-auto">Customer</th>
              <th className="col-auto">Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {listItems}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

const Provider = (props) => {
  return (
    <div className="d-flex justify-content-center">
      <small>Connected to network: <code className="text-info">{props.networkType} (Id: {props.Id})</code></small>
    </div >
  )
}

const ContractAddress = (props) => {
  return (
    (props.contractInstance !== undefined && props.contractInstance !== null) ?
      <div className="d-flex justify-content-center">
        <small>Contract address: <code className="text-info">{props.contractInstance.address}</code></small>
      </div>
      :
      <div className="d-flex justify-content-center">
        <small className="text-danger">Contract not deployed??</small>
      </div>
  )
}

const whoAmI = (me, addr) => {
  if (me === addr) {
    return "You "
  } else {
    return "0" + addr.substring(1, 6) + "..."
  }
}
const EVSelector = (props) => {
  if (!props.evInfo) return <div>Nothing!</div>
  let evInfo = props.evInfo.map(c =>
    <Card key={c.tokenId} className="mt-2 mb-2 mr-2" style={{ width: '24rem' }} bg={c.checkOutDate === 0 ? "light" : "black"}>
      <Card.Header as="h6">Car No. {c.tokenId}</Card.Header>
      <Card.Img variant="top" src={c.image} />
      <Card.Body>
        <Card.Title>{c.description}</Card.Title>
        <Card.Subtitle>
          {
            (c.checkOutDate === 0) ?
              <span className="text-success">Available</span>
              :
              <span className="text-danger font-weight-bold">Not Available</span>
          }
        </Card.Subtitle>
        {/* <Card.Text className="d-flex mt-1"> */}
        <ButtonToolbar className="mt-2">
          <ButtonGroup className="mr-2">
            <Button className variant="primary" disabled={c.checkOutDate > 0} onClick={
              (event) => {
                props.checkOut(c.tokenId)
              }}>Use</Button>
          </ButtonGroup>
          <ButtonGroup className="mr-2">
            <Button variant="primary" disabled={c.checkOutDate === 0} onClick={
              (event) => {
                props.checkIn(c.tokenId)
              }}>Return</Button>
          </ButtonGroup>
        </ButtonToolbar>
        {/* </Card.Text> */}
      </Card.Body>
      <Card.Footer className="bg-transparent">
        <Row className="justify-content-between p-1">
          <div>
            {
              (c.checkOutDate > 0) ?
                <div>
                  <small>In use by {whoAmI(props.me, c.currentOwner)}
                    since {new Date(c.checkOutDate * 1000).toLocaleString()}</small>
                </div>
                :
                <div><small></small></div>
            }
          </div>
          {/* <div class="d-flex flex-row-reverse align-self-end mb-2 mr-2"> */}
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16"
              onClick={(e) => { alert("TokenURI: \r\n" + c.tokenURI) }}
              style={{ cursor: "pointer" }}>
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
          </div>
        </Row>
      </Card.Footer>
    </Card>
  )
  return (
    <Row className="justify-content-center">
      {evInfo}
    </Row>
  )
}

const AccountSelector = (props) => {
  if (props.currentAccount === undefined || props.currentAccount === null) {
    return <div></div>
  }

  const currentAccount = (props.currentAccount) ? props.currentAccount : "0x"

  let accounts = props.accounts.map(a => {
    return <option key={a} value={a}>{a}</option>
  })
  return (
    <Form>
      <Form.Group as={Row}>
        <Form.Label column sm="2">Account</Form.Label>
        <Col sm="10">
          <Form.Control
            as="select"
            className="mr-sm-1"
            id="account"
            custom
            value={currentAccount}
            onChange={(e) => e.target.value !== "0" && props.switchAccount(e.target.value)}
          >
            <option key="0" value="0">Choose...</option>
            {accounts}
          </Form.Control>
        </Col>
      </Form.Group>
    </Form>
  )
}

export default App;
