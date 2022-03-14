import React from 'react'
import logo from './xrpllogo.png'
import festival from './festival.jpeg'
import buyerButton from './buyerbutton.png'
import Button from 'react-bootstrap/button'
import Form from 'react-bootstrap/Form'
import Loader from './Loader'
import QRCode from 'qrcode.react'
import Modal from 'react-bootstrap/Modal'

function ModalQR({ticket, show, onModalClose}) {


	const handleSubmit = () => {
		onModalClose()
	}

	return (

		<Modal show={show}>

	      <Modal.Header closeButton>
	        <Modal.Title>{ticket.ticketName}</Modal.Title>
	      </Modal.Header>
	      <Modal.Body>
	      	<Form.Label>Show this ticket at the event!</Form.Label>
	      	<br />
	      	<br />
	        <QRCode value={ticket.tokenID} />
	      </Modal.Body>
	      <Modal.Footer>
          <Button variant="primary" type="submit" onClick={() => handleSubmit()}>
              Done
          </Button>	      
	          
	      </Modal.Footer>

		</Modal>
	)

}

function TicketSection ({eventName, tickets, onOpenQR}) {
  const numMinted = tickets[1].totalMinted || 4
  const textForTicket = tickets[1].ticketName + " - (1 of " + numMinted + " minted)"
  const newTickets = [tickets[1]]

  const openQR = (ticket) => {
  	onOpenQR(ticket)
  }

  if (tickets) {
      return (
      <React.Fragment>
        <div className="ticketheader">
          <div className="ticketheadertext">{eventName || "Test Event"}</div>
        </div>
        {
          newTickets.map((ticket) => (
            <div onClick={() => openQR(ticket)}key={ticket.tokenID} className="ticketviewer">
              <div className="ticketviewercontainer">
                <div className="ticket buyer">
                  <div 
                    style={{backgroundColor: ticket.tokenColor}}
                    className="ticketcolorsidebar" />
                  <div className="tickettokeniddiv">
                    <div className="maintickettextdiv">{textForTicket}</div>
                    <div className="tickettokenidtext">Token ID: {ticket.tokenID}</div>

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

function TicketsDiv({buyerTokens, onOpenQR}) {

  var ticketsObj = {}


  buyerTokens.forEach((ticket) => {
  	if (ticket.eventName in ticketsObj) {
  		ticketsObj[ticket.eventName].push(ticket)	
  	}
    else {
      ticketsObj[ticket.eventName] = [ticket]
    }
  })
  

  return (
    <div className="ticketsdiv">

      {
        Object.keys(ticketsObj).map((eventName) => (
          <TicketSection 
          	onOpenQR={onOpenQR}
          	key={eventName} 
          	eventName={eventName}
          	tickets={ticketsObj[eventName]} />
        ))
      }
    </div>
  )  
}

export default function BuyerCollectionView() {
  const [buyerTokens, setBuyerTokens] = React.useState([])
    const [loading, setIsLoading] = React.useState(false)
  const [loadingText, setLoadingText] = React.useState(null)
  const [modalTicket, setModalTicket] = React.useState({})
  const [showModal, setShowModal] = React.useState(false)

  	const onOpenQR = (ticket) => {
  		setModalTicket(ticket)
  		setShowModal(true)
  	}

	const getTokens = () => {
  	setLoadingText("Loading your NFT Tickets from XRPL ...")
  	setIsLoading(true)	  	
	    fetch("/getTokens")
	      .then((res) => res.json())
	      .then((data) => {
	          setBuyerTokens(data.buyerTokens)
	          setIsLoading(false)
	        });    
	  }
	  React.useEffect(() => {
	    getTokens()
	  }, [])	
	return (
	  <div className="megadiv">
	    <div className="header">
	      <div className="headercontainerdiv"><img src={logo} loading="lazy" width="245" alt="" /></div>
	    </div>
	    <div className="bottomsection">
	      <div className="mainbottomsecton">
	        <div className="existingnft">
	          <div className="existingnfttext">Your NFT Tickets</div>
	        </div>
	        <ModalQR onModalClose={() => setShowModal(false)} ticket={modalTicket} show={showModal} />
	        {
	        	loading || buyerTokens === 0
	        	? <Loader text={loadingText} />
	        	: <TicketsDiv onOpenQR={onOpenQR} buyerTokens={buyerTokens}/>
	        }
	      </div>
	    </div>
	  </div>
	)

}
