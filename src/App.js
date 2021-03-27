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
      showRedeemModal: false,     // controls the display of redeem modal
      showTransferModal: false,   // controls the display of transfer modal
      coupon2RedeemMessage: {},   // message to be displayed in the redeem modal
      nCoupons: 0,                // number of unredeemed coupon
      web3: null,
      evs: [],
      eventHistory: [],           // awardCouponEvent events
      myCoupons: [],              // copy of coupons (obtainde from the network)
      myAccount: null             // accounts[]
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
    }).then((instance) => {
      return this.getEVInfo()
    }).then((evs) => {
      this.setState({ evs: evs })
      // return this.updateEventHistory()
    }).catch(error => {
      console.log(error)
      alert(error.message)
    })
    // Get network provider and web3 instance.
    // getWeb3
    //   .then(results => {
    //     this.setState({
    //       web3: results.web3,
    //       accounts: results.accounts,
    //       network: results.network,
    //       provider: results.provider
    //     })
    //     this.instantiateContract()
    //   })
    //   .then(instance => {
    //     return this.getEVInfo(instance)
    //   })
    //   .then(evs => {
    //     this.setState({ evs: evs })
    //     console.log(`evs[]: ${JSON.stringify(evs)}`)
    //     return this.updateEventHistory()    // returns evnet history
    //   })
    //   .then(eventHistory => {
    //     console.log(`eventHistory: ${JSON.stringify(eventHistory)}`)
    //   })
    //   .catch((error) => {
    //     console.log(error)
    //     alert(error.message)
    //   })
  }

  instantiateContract = async () => {
    const contract = require('@truffle/contract')
    const sharedEV = contract(SharedEVContract)
    var Web3HttpProvider = require('web3-providers-http');
    var customProvider = new Web3HttpProvider('http://localhost:8545');
    // sharedEV.setProvider(this.state.web3.currentProvider)
    sharedEV.setProvider(customProvider)

    let myAccount = this.state.accounts[9]
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

        <div className="d-flex flex-row justify-content-center mt-3">
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
          <EVSelector evs={this.state.evs} checkIn={this.checkIn} checkOut={this.checkOut} />
        </div>

        <br></br>

        <div className="d-flex flex-row justify-content-center align-items-stretch" >
          <EventHistory events={this.state.eventHistory} />
        </div>

      </Container >
    );
  }

  getEVInfo = async () => {
    let evs = []
    let totalSupply = await this.state.sharedEVInstance.totalSupply()

    for (let i = 1; i <= totalSupply; i++) {
      let ev = await this.state.sharedEVInstance.sharedEVs(i)

      let obj = {}
      obj.tokenId = ev.tokenId.toNumber()
      obj.tokenURI = ev.tokenURI
      obj.description = ev.description
      obj.checkOutDate = ev.checkOutDate.toNumber()
      let currentOwner = (obj.checkOutDate > 0) ? await this.state.sharedEVInstance.ownerOf(ev.tokenId) : "0x0"
      obj.currentOwner = currentOwner
      evs = [...evs, obj]
    }

    // this.setState({ evs: this.evs })

    return evs
  }

  nCoupons = () => {
    let nCoupons = 0
    for (let c of this.state.myCoupons) {
      if (!c.redeemed && c.tokenId !== 0) nCoupons++
    }
    return nCoupons
  }

  switchAccount = (account) => {
    this.setState({ myAccount: account }, () => {
      this.getEVInfo().then(evs => this.setState({ evs: evs }))
      //this.updateEventHistory()
      console.log(`switchAccount(${account}) myAccount: ${this.state.myAccount}`)
    })
  }

  checkOut = async (tokenId) => {
    let owner = await this.state.sharedEVInstance.owner()
    console.log(`checkOut(${tokenId}), owner: ${owner}, myAccount: ${this.state.myAccount},
    account[0]: ${this.state.accounts[0]}`)

    let results = await this.state.sharedEVInstance.checkOut(
      this.state.myAccount,
      tokenId,
      { from: owner }
    )
    console.log(`checkOut(), results: ${JSON.stringify(results)}`)
    console.log(`checkOut(${tokenId}): ${JSON.stringify(await this.state.sharedEVInstance.sharedEVs(tokenId))}`)

    this.getEVInfo().then(evs => this.setState({ evs: evs }))
  }

  checkIn = async (tokenId) => {
    console.log(`checkIn(${tokenId})`)
    console.log(`ownerOf(${tokenId}): ${await this.state.sharedEVInstance.ownerOf(tokenId)}`)
    console.log(`myAccount: ${this.state.myAccount}`)
    let results = await this.state.sharedEVInstance.checkIn(tokenId, { from: this.state.myAccount })
    console.log(`checkOut(), results: ${JSON.stringify(results)}`)
    this.getEVInfo().then(evs => this.setState({ evs: evs }))
  }

  dismissRedeemModal = () => {
    this.setState({ showRedeemModal: false })
  }

  displayRedeemModal = () => {
    this.setState({ showRedeemModal: true })
  }

  dismissTransferModal = () => {
    this.setState({ showTransferModal: false })
  }

  displayTransferModal = () => {
    this.setState({ showTransferModal: true })
  }

  setCoupon2Redeem = (tokenId) => {
    for (let c of this.state.myCoupons) {
      if (c.tokenId === tokenId) {
        // prepare the modal message...
        let coupon2RedeemMessage = {}
        coupon2RedeemMessage.tokenId = tokenId
        coupon2RedeemMessage.value = c.value
        coupon2RedeemMessage.expiryDate = c.expiryDate
        coupon2RedeemMessage.description = c.description
        this.setState({ coupon2RedeemMessage: coupon2RedeemMessage })
        this.displayRedeemModal()
      }
    }
  }

  setCoupon2Transfer = (tokenId) => {
    let accounts = this.state.accounts.filter(account => account !== this.state.myAccount)
    let transferAccounts = accounts.map(a => {
      return <option key={a} value={a}>{a}</option>
    })
    console.log(`transferAccount: ${transferAccounts} `)
    this.setState({
      transferAccounts: transferAccounts,
      tokenId2Transfer: tokenId
    }, () => {
      this.displayTransferModal()
    })
  }

  setTransferAccount = (account) => {
    this.setState({ transferAccount: account })
  }

  transfer = async () => {
    this.dismissTransferModal()
    if (this.state.tokenId2Transfer && this.state.transferAccount) {
      await this.state.couponInstance.safeTransferFrom(
        this.state.myAccount, this.state.transferAccount, this.state.tokenId2Transfer,
        { from: this.state.myAccount }
      )
      this.updateMyCoupons()
      this.updateEventHistory()
      alert(`Coupon[${this.state.tokenId2Transfer}]transferred to ${this.state.transferAccount} `)
      this.setState({ transferAccount: undefined, tokenId2Transfer: undefined })
    }
  }

  redeem = async () => {
    this.dismissRedeemModal()
    if (this.state.coupon2RedeemMessage) {
      let tokenId = this.state.coupon2RedeemMessage.tokenId
      let results = await this.state.couponInstance.redeem(tokenId, { from: this.state.myAccount })
      /*
      let updatedCoupons = [...this.state.myCoupons]    // make a copy of myCoupons
      let coupon2Update = updatedCoupons[tokenId - 1]   // make a copy of the coupon to be redeemed from myCoupons
      coupon2Update.redeemed = true
      coupon2Update.redeemedTimeStamp = new Date().getTime() / 1000
      updatedCoupons[tokenId - 1] = coupon2Update
      this.setState({ myCoupons: updatedCoupons })      // replace/update myCoupons in state

      this.setState({ nCoupons: this.nCoupons() })
      this.updateEventHistory()
      this.setState({ coupon2RedeemMessage: undefined })
      */
      this.updateMyCoupons()
      this.updateEventHistory()
      this.setState({ coupon2RedeemMessage: undefined })

      alert(`Succesfully Redeemed Coupon(${tokenId}) \rTransaction ref: \r${results.tx} `)
    }
  }

  updateEventHistory = async () => {
    // redeem events
    let events = await this.state.couponInstance.getPastEvents('redeemCouponEvent', { fromBlock: 0, toBlock: 'latest' })
    let filteredEvents = events.filter(e => e.returnValues.customer === this.state.myAccount)
    let filteredRedeemEvents = filteredEvents.map(e => {
      return ({
        event: 'redeem',
        tokenId: e.returnValues.tokenId,
        blockTimeStamp: e.returnValues.blockTimeStamp,
        transactionHash: e.transactionHash,
        remarks: ""
      })
    })

    // transfer events
    events = await this.state.couponInstance.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest' })
    filteredEvents = events.filter(e => {
      return (
        (e.returnValues.from !== "0x0000000000000000000000000000000000000000") &&
        ((e.returnValues.from === this.state.myAccount) ||
          (e.returnValues.to === this.state.myAccount)
        )
      )
    })
    let filteredTransferEvents = []
    for (let e of filteredEvents) {
      let results = await this.state.web3.eth.getTransaction(e.transactionHash)
      let blockNumber = results.blockNumber
      results = await this.state.web3.eth.getBlock(blockNumber)
      let timestamp = results.timestamp
      let eventObject = {}
      eventObject.event = 'transfer'
      eventObject.tokenId = e.returnValues.tokenId
      eventObject.remarks =
        (e.returnValues.from === this.state.myAccount)
          ?
          `To: ${e.returnValues.to} `
          :
          `From: ${e.returnValues.from} `
      eventObject.blockTimeStamp = timestamp
      eventObject.transactionHash = e.transactionHash
      filteredTransferEvents.push(eventObject)
    }

    console.log(`filteredTransferEvents: ${JSON.stringify(filteredTransferEvents)} `)

    let history = [...filteredRedeemEvents, ...filteredTransferEvents]
    this.setState({ eventHistory: history })
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
      <td>{new Date(e.blockTimeStamp * 1000).toLocaleString()}</td>
      <td>{e.remarks}</td>
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
              <th className="col-auto">Coupon</th>
              <th className="col-auto">Date/Time</th>
              <th className="col-auto">Remarks</th>
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

const EVSelector = (props) => {
  if (!props.evs) return <div>Nothing!</div>
  let evs = props.evs.map(c =>
    <Card style={{ width: '24rem' }} bg={c.checkOutDate === 0 ? "light" : "black"}>
      <Card.Header as="h6">Car No. {c.tokenId}</Card.Header>
      <Card.Img variant="top" src={c.tokenURI} />
      <Card.Body>
        <Card.Title>{c.description}</Card.Title>
        <Card.Subtitle>
          {
            (c.checkOutDate === 0) ?
              <span className="text-success">Available</span>
              :
              <span className="text-danger font-weight-bold">In use</span>
          }
        </Card.Subtitle>
        <div className="d-flex mt-1">
          <Card.Text>
            {
              (c.checkOutDate > 0) ?
                <div>
                  <small>{c.currentOwner}</small><br></br>
                  <small>{new Date(c.checkOutDate * 1000).toLocaleString()}</small>
                </div>
                :
                <div></div>
            }
            <ButtonToolbar>
              <ButtonGroup className="mr-2">
                <Button className variant="primary" disabled={c.checkOutDate > 0} onClick={
                  (event) => {
                    props.checkOut(c.tokenId)
                  }}>Use
                      </Button>
              </ButtonGroup>
              <ButtonGroup className="mr-2">
                <Button className variant="primary" disabled={c.checkOutDate === 0} onClick={
                  (event) => {
                    props.checkIn(c.tokenId)
                  }}>Return
                      </Button>
              </ButtonGroup>
            </ButtonToolbar>
          </Card.Text>
        </div>
      </Card.Body>
      <Card.Footer className="bg-transparent">
        <div class="d-flex flex-row-reverse align-self-end mb-2 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"
            onClick={(e) => { alert(c.tokenURI) }}
            style={{ cursor: "pointer" }}>
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          </svg>
        </div>
      </Card.Footer>
    </Card>
  )
  return (
    <Row className="justify-content-center">
      {evs}
    </Row>
  )
}

/*
const CouponSelector = (props) => {
  let couponItems = props.myCoupons.map(c =>
    <div key={c.tokenId} className="d-flex col justify-content-center align-items-stretch mt-3">
      <Card style={{ width: '18rem' }} bg={c.redeemed ? "light" : "black"}>
        <Card.Header as="h6">No. {c.tokenId}</Card.Header>
        <Card.Body>
          <Card.Title>${c.value}</Card.Title>
          <Card.Subtitle>
            {c.description}
          </Card.Subtitle>
          <div class="d-flex">
            {
              c.redeemed ?
                <Card.Text>
                  <span className="text-success font-weight-bold">Redemmed</span><br></br>
                  <small>{new Date(c.redeemedTimeStamp * 1000).toLocaleString()}</small>
                </Card.Text>
                :
                <div>
                  <Card.Text>
                    Expiry Date: {c.expiryDate}
                  </Card.Text>
                  <ButtonToolbar>
                    <ButtonGroup className="mr-2">
                      <Button className variant="primary" disabled={c.redeemed} onClick={
                        (event) => {
                          props.setCoupon2Redeem(c.tokenId)
                        }}>Redeem
                      </Button>
                    </ButtonGroup>
                    <ButtonGroup className="mr-2">
                      <Button className variant="primary" disabled={c.redeemed} onClick={
                        (event) => {
                          props.setCoupon2Transfer(c.tokenId)
                        }}>Transfer
                      </Button>
                    </ButtonGroup>
                  </ButtonToolbar>
                </div>
            }
          </div>
        </Card.Body>
        <Card.Footer class="bg-transparent">
          <div class="d-flex flex-row-reverse align-self-end mb-2 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"
              onClick={(e) => { alert(c.tokenURI) }}
              style={{ cursor: "pointer" }}>
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
          </div>
        </Card.Footer>
      </Card >
    </div >

  )
  return (
    <div class="d-flex row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row row-cols-sm-1">
      {couponItems}
    </div>
  )
}
*/
const AccountSelector = (props) => {
  let accounts = props.accounts.map(a => {
    return <option key={a} value={a}>{a}</option>
  })
  return (
    <Form>
      <Form.Row>
        <Col xs="auto">
          <Form.Label>Account</Form.Label>
        </Col>
        <Col xs="auto">
          <Form.Control
            as="select"
            className="mr-sm-2"
            id="account"
            custom
            value={props.currentAccount}
            onChange={(e) => e.target.value !== "0" && props.switchAccount(e.target.value)}
          >
            <option key="0" value="0">Choose...</option>
            {accounts}
            {/* <option value={this.props.accounts[0]}>{this.props.accounts[0]}</option>
              <option value={this.props.accounts[1]}>{this.props.accounts[1]}</option> */}
          </Form.Control>
        </Col>
      </Form.Row>
    </Form>
  )
}

export default App;
