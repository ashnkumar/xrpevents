import React from 'react'
import logo from './xrpllogo.png'
import festival from './festival.jpeg'
import createButton from './createbutton.png'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/button'
import Form from 'react-bootstrap/Form'
import Toggle from 'react-toggle'
import Loader from './Loader'


function TicketSection ({ticketName, tickets}) {
  const numMinted = tickets[0].totalMinted || 4
  const textForTicket = ticketName + " - (1 of " + numMinted + " minted)"


  if (tickets) {
      return (
      <React.Fragment>
        <div className="ticketheader">
          <div className="ticketheadertext">{ticketName}</div>
        </div>
        {
          tickets.map((ticket) => (
            <div key={ticket.tokenID} className="ticketviewer">
              <div className="ticketviewercontainer">
                <div className="ticket">
                  <div 
                    style={{backgroundColor: ticket.tokenColor}}
                    className="ticketcolorsidebar" />
                  <div className="tickettokeniddiv">
                    <div className="maintickettextdiv">{textForTicket}</div>
                    <div className="tickettokenidtext">Token ID: {ticket.tokenID}</div>
                    <div className="saleprice">Sell Offer: {ticket.salePrice} XRP</div>
                  </div>
                  </div>
                </div>
            </div>

          ))
        }
      </React.Fragment> 
    )    
  }
  else {
    return null
  }

}


function TicketsDiv({tickets}) {

  var ticketsObj = {}
  tickets.forEach((ticket) => {
    if (ticket.ticketName in ticketsObj) {
      ticketsObj[ticket.ticketName].push(ticket)
    } else {
      ticketsObj[ticket.ticketName] = [ticket]
    }
  })
  console.log(ticketsObj)

  return (
    <div className="ticketsdiv">

      {
        Object.keys(ticketsObj).map((ticketName) => (
          <TicketSection key={ticketName} ticketName={ticketName} tickets={ticketsObj[ticketName]} />
        ))
      }
    </div>
  )  
}

function ModalForm ({onMintNFTs, showModal, onClose}) {

  const [ticketName, setTicketName] = React.useState("")
  const [ticketColor, setTicketColor] = React.useState("red")
  const [ticketDescription, setTicketDescription] = React.useState("")
  const [tokenAmount, setTokenAmount] = React.useState("1000000")
  const [tokenQuantity, setTokenQuantity] = React.useState(1)
  
  const handleClose = () => {
    onClose()
  }

  const handleSubmit = () => {
    const tokenDetails = {
      eventName: "Benefit Concert to Support Ukraine",
      tokenColor: ticketColor,
      tokenAmount: tokenAmount,
      tokenQuantity: parseInt(tokenQuantity),
      ticketName: ticketName,
      ticketDescription: ticketDescription
    }
    onMintNFTs(tokenDetails)
    onClose()
  }


  return(
      <Modal 
        show={showModal} 
      >
      <Modal.Header closeButton>
        <Modal.Title>Create an NFT Ticket</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" >
          <Form.Label>Name of NFT Tier</Form.Label>
          <Form.Control value={ticketName} onChange={(e) => setTicketName(e.target.value)} type="text" placeholder="Enter name" />
        </Form.Group>      
        <Form.Select onChange={(e) => setTicketColor(e.target.value)} aria-label="Default select example">
          <option>Special Ticket Color</option>
          <option value="red">Red</option>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
          <option value="purple">Purple</option>
        </Form.Select>
        <br />
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Description of NFT Benefits</Form.Label>
          <Form.Control value={ticketDescription} onChange={(e) => setTicketDescription(e.target.value)} as="textarea" rows={3} />
        </Form.Group>
        <Form.Group className="mb-3" >
          <Form.Label>Selling Offer Price (in XRP)</Form.Label>
          <Form.Control value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} type="number" placeholder="1000000" />
        </Form.Group>  
        <Form.Group className="mb-3" >
          <Form.Label># of Tickets to Mint</Form.Label>
          <Form.Control value={tokenQuantity} onChange={(e) => setTokenQuantity(e.target.value)} type="number" />
        </Form.Group>        
      </Modal.Body>
      <Modal.Footer>
          <Button variant="primary" type="submit" onClick={() => handleSubmit()}>
              Submit
          </Button>
      </Modal.Footer>
    </Modal>
  )
}


function SellerView({onToggleSwitch}) {

  const [colorOfToken, setColorOfToken] = React.useState("blue")
  const [tokenAmount, setTokenAmount] = React.useState("1000000")
  const [tokenQuantity, setTokenQuantity] = React.useState(1)
  const [sellerTokens, setSellerTokens] = React.useState([])
  const [buyerTokens, setBuyerTokens] = React.useState([])
  const [loading, setIsLoading] = React.useState(false)
  const [loadingText, setLoadingText] = React.useState(null)
  const [showModal, setShowModal] = React.useState(false)

  const getTokens = () => {
    setLoadingText("Loading NFTs from XRPL ...")
    setIsLoading(true)
    fetch("/getTokens")
      .then((res) => res.json())
      .then((data) => {
          console.log("Seller: ", data.sellerTokens)
          console.log("Buyer: ", data.buyerTokens)
          setSellerTokens(data.sellerTokens)
          setBuyerTokens(data.buyerTokens)
          setIsLoading(false)
        });    
  }
  React.useEffect(() => {
    getTokens()
  }, [])

  const handleColorChange = (event) => {
    setColorOfToken(event.target.value)
  }  

  const handleAmountChange = (event) => {
    setTokenAmount(event.target.value)
  }    

  const handleTokenQuantityChange = (event) => {
    setTokenQuantity(event.target.value)
  }    


  const mintNFTs = (tokenDetails) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenDetails)
    };
    setLoadingText("Minting NFT Tickets on XRPL ...")
    setIsLoading(true)
    fetch('/mintBatchTokens', requestOptions)
      .then((res) => res.json())
      .then((data) => {
          setSellerTokens(data.sellerTokens)
          setBuyerTokens(data.buyerTokens)
          setIsLoading(false)
        });
  }

  const handleModal = (state) => {
    setShowModal(state)
  }


  return (
    <div className="megadiv">
      <ModalForm onClose={() => handleModal(false)} showModal={showModal} onMintNFTs={(tokenDetails) => mintNFTs(tokenDetails)}/>
      <div className="header">
        <div className="headercontainerdiv"><img src={logo} loading="lazy" width="245" alt=""/></div>
      </div>
      <div className="togglerHeader">
        <div className="togglerContainerDiv">
          <div className="toggler">
          <label>
          <span className="modeLabel">Buyer Mode   </span>
          <Toggle
            defaultChecked={true}
            className='red-toggle'
            onChange={() => onToggleSwitch("buyer")} />
          <span style={{color: "red"}} className="modeLabel">   Seller Mode</span>
        </label>
        </div>
        </div>

      </div>

      <div className="band">
        <div className="leftimage">
          <div className="headertext">
            <div className="descriptionminitext">XRP Events / Support Ukraine Music Festival</div>
          </div>
          <div className="mainphoto"><img src={festival} loading="lazy" alt="" /></div>
        </div>
        <div className="rightdescription">
          <div className="maintitle">
            <div className="maintitletext">Benefit Concert to Support Ukraine</div>
          </div>
          <div className="dates">
            <div className="datestext">Apr 29 - May 2, 2022</div>
          </div>
          <div className="location">
            <div className="locationtext">Central Park | Atlanta, GA</div>
          </div>
          <div onClick={() => handleModal(true)} className="createnftbutton"><img src={createButton} loading="lazy" width="210" alt="" /></div>
        </div>
      </div>
      <div className="bottomsection">
        <div className="mainbottomsecton">
          <div className="existingnft">
            <div className="existingnfttext">Existing NFT Tickets for Event (on XRPL)</div>
          </div>
          {
            loading
            ? <Loader text={loadingText}/>
            : <TicketsDiv tickets={sellerTokens}/>
          }
          

          




        </div>
      </div>
    </div>
  );
}

export default SellerView;


