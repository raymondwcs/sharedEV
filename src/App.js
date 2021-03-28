import React from 'react';
// import ReactDOM from 'react-dom';
//import { Button, ButtonGroup, ButtonToolbar, Modal, Table, Card, Container, Col, Form } from 'react-bootstrap';
import { Button, ButtonGroup, ButtonToolbar, Container, Table, Col, Card, Form, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import getWeb3 from "./getWeb3";
import SharedEVContract from "./build/contracts/SharedEV.json";

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      evInfo: [],
      eventHistory: [],
      myAccount: null
    }
  }

  componentDidMount() {
    getWeb3.then(results => {
      this.setState({
        web3: results.web3,
        accounts: results.accounts,
        network: results.network,
      })
    }).then(() => {
      return this.instantiateContract()
    }).then(instance => {
      return this.getEVInfo()
    }).then(evInfo => {
      this.setState({ evInfo: evInfo })
      return this.updateEventHistory()
    }).then(history => {
      this.setState({ eventHistory: history })
    }).catch(error => {
      console.log(error)
      alert(error.message)
    })
  }

  instantiateContract = async () => {
    const contract = require('@truffle/contract')
    const sharedEV = contract(SharedEVContract)
    sharedEV.setProvider(this.state.web3.currentProvider)

    // var Web3HttpProvider = require('web3-providers-http')
    // var customProvider = new Web3HttpProvider('http://localhost:8545')
    // sharedEV.setProvider(customProvider)

    let myAccount = this.state.accounts[1]
    this.setState({ myAccount: myAccount })
    console.log(`myAccount: ${this.state.myAccount}`)

    let instance = await sharedEV.deployed()
    this.setState({ sharedEVInstance: instance })
    return instance
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <Container>
        <div className="d-flex flex-row justify-content-center">
          <h1>Shared Cars</h1>
        </div>

        <div className="d-flex flex-row justify-content-center">
          <Provider networkType={this.state.network.networkType} Id={this.state.network.id} />
        </div>

        <div className="d-flex flex-row justify-content-center">
          <ContractAddress contractInstance={this.state.sharedEVInstance} />
        </div>

        <div className="d-flex flex-row justify-content-center mt-2 mb-2">
          <AccountSelector
            accounts={this.state.accounts}
            switchAccount={this.switchAccount}
            currentAccount={this.state.myAccount}
          />
        </div>

        {/* <div className="d-flex flex-row justify-content-center" >
          <p>You have: <span className="h3 text-success font-weight-bolder">{this.state.nCoupons}</span> unused coupon(s)</p>
        </div>

        <div className="d-flex flex-row justify-content-center" >
          <Modal show={this.state.showRedeemModal} onHide={this.dismissRedeemModal}>
            <Modal.Header closeButton>
              <Modal.Title>Redeem this Coupon?</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p className="h6">No. <span className="font-weight-bolder">
                {(typeof this.state.coupon2RedeemMessage === "undefined") ? "" : this.state.coupon2RedeemMessage.tokenId}</span>
              </p>
              <ul>
                <li>{(typeof this.state.coupon2RedeemMessage === "undefined") ? "" : this.state.coupon2RedeemMessage.description}</li>
                <li>Value: {(typeof this.state.coupon2RedeemMessage === "undefined") ? "" : this.state.coupon2RedeemMessage.value}</li>
                <li>Expiry Date: {(typeof this.state.coupon2RedeemMessage === "undefined") ? "" : this.state.coupon2RedeemMessage.expiryDate}</li>
              </ul>
            </Modal.Body >

            <Modal.Footer>
              <Button variant="secondary" onClick={this.dismissRedeemModal}>Cancel</Button>
              <Button variant="primary" onClick={this.redeem}>Redeem</Button>
            </Modal.Footer>
          </Modal >
        </div>

        <div className="d-flex flex-row justify-content-center" >
          <Modal show={this.state.showTransferModal} onHide={this.dismissTransferModal}>
            <Modal.Header closeButton>
              <Modal.Title>Transfer this Coupon?</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Form.Control
                as="select"
                className="mr-sm-2"
                id="account"
                custom
                onChange={(e) => e.target.value !== "0" && this.setTransferAccount(e.target.value)}
              >
                <option key="0" value="0">Choose...</option>
                {this.state.transferAccounts}
              </Form.Control>
            </Modal.Body >

            <Modal.Footer>
              <Button variant="secondary" onClick={this.dismissTransferModal}>Cancel</Button>
              <Button variant="primary" onClick={this.transfer}>Transfer</Button>
            </Modal.Footer>
          </Modal >
        </div> */}

        <div className="d-flex flex-row justify-content-center align-items-stretch" >
          <EVSelector evInfo={this.state.evInfo} me={this.state.myAccount} checkIn={this.checkIn} checkOut={this.checkOut} />
        </div>

        <br></br>

        <div className="d-flex flex-row justify-content-center align-items-stretch" >
          <EventHistory events={this.state.eventHistory} />
        </div>

      </Container >
    );
  }

  getEVInfo = async () => {
    let x = await this.state.sharedEVInstance.getEVInfo()
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

    return evInfo   // this.setState({evInfo: evInfo})
  }

  switchAccount = (account) => {
    this.setState({ myAccount: account }, () => {
      this.getEVInfo().then(evInfo => this.setState({ evInfo: evInfo }))
      this.updateEventHistory().then(history => this.setState({ eventHistory: history }))
      console.log(`switchAccount(${account}) myAccount: ${this.state.myAccount}`)
    })
  }

  checkOut = async (tokenId) => {
    let owner = await this.state.sharedEVInstance.owner()
    console.log(`checkOut(${tokenId}), owner: ${owner}, myAccount: ${this.state.myAccount},
    account[0]: ${this.state.accounts[0]}`)

    try {
      await this.state.sharedEVInstance.checkOut(
        this.state.myAccount,
        tokenId,
        { from: owner }
      )
    } catch (error) {
      alert(error)
    }

    this.getEVInfo().then(evInfo => this.setState({ evInfo: evInfo }))
    this.updateEventHistory().then(history => this.setState({ eventHistory: history }))
  }

  checkIn = async (tokenId) => {
    try {
      await this.state.sharedEVInstance.checkIn(tokenId, { from: this.state.myAccount })
    } catch (error) {
      alert(error)
    }

    this.getEVInfo().then(evInfo => this.setState({ evInfo: evInfo }))
    this.updateEventHistory().then(history => this.setState({ eventHistory: history }))
  }

  compareTimeStamp = (a, b) => {
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

  updateEventHistory = async () => {
    // checkOut events
    let events = await this.state.sharedEVInstance.getPastEvents('checkOutEvent', { fromBlock: 0, toBlock: 'latest' })
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
    events = await this.state.sharedEVInstance.getPastEvents('checkInEvent', { fromBlock: 0, toBlock: 'latest' })
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
    this.setState({ eventHistory: history.sort(this.compareTimeStamp) })
    return history
  }
}

const EventHistory = (props) => {
  if (props.events.length === 0) {
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
    (props.contractInstance !== undefined) ?
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
  const [, ...rest] = props.accounts // exclude accounts[0]
  const currentAccount = (props.currentAccount) ? props.currentAccount : "0x"
  let accounts = rest.map(a => {
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
