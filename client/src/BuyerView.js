import React from 'react'
import logo from './xrpllogo.png'
import festival from './festival.jpeg'
import buyerButton from './buyerbutton.png'
import Button from 'react-bootstrap/button'
import Form from 'react-bootstrap/Form'
import Toggle from 'react-toggle'
import Loader from './Loader'


function TicketSection ({ticketName, tickets, goBuyNFT}) {
  const numMinted = tickets[0].totalMinted || 4
  const textForTicket = ticketName + " - (1 of " + numMinted + " minted)"

  const onBuyNFT = (ticket) => {
    const ticketToBuy = {
      tokenIndex: ticket.tokenIndex
    }
    goBuyNFT(ticketToBuy)
  }

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
                <div className="ticket buyer">
                  <div 
                    style={{backgroundColor: ticket.tokenColor}}
                    className="ticketcolorsidebar" />
                  <div className="tickettokeniddiv">
                    <div className="maintickettextdiv">{textForTicket}</div>
                    <div className="tickettokenidtext">Token ID: {ticket.tokenID}</div>
                    <Button className="buybutton" variant="success" type="submit" onClick={() => onBuyNFT(ticket)}>
              			Buy NFT Ticket
          			</Button>
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


function TicketsDiv({tickets, onBuyNFT}) {

  var ticketsObj = {}
  tickets.forEach((ticket) => {
    if (ticket.ticketName in ticketsObj) {
      ticketsObj[ticket.ticketName].push(ticket)
    } else {
      ticketsObj[ticket.ticketName] = [ticket]
    }
  })

  return (
    <div className="ticketsdiv">

      {
        Object.keys(ticketsObj).map((ticketName) => (
          <TicketSection key={ticketName} ticketName={ticketName} tickets={ticketsObj[ticketName]} goBuyNFT={(buyDetails) => onBuyNFT(buyDetails)} />
        ))
      }
    </div>
  )  
}


function BuyerView({onToggleSwitch}) {

  const [colorOfToken, setColorOfToken] = React.useState("blue")
  const [tokenAmount, setTokenAmount] = React.useState("1000000")
  const [tokenQuantity, setTokenQuantity] = React.useState(1)
  const [sellerTokens, setSellerTokens] = React.useState([])
  const [buyerTokens, setBuyerTokens] = React.useState([])
  const [loading, setIsLoading] = React.useState(false)
  const [loadingText, setLoadingText] = React.useState(null)

  const getTokens = () => {
  	setLoadingText("Loading NFTs from XRPL ...")
  	setIsLoading(true)
    fetch("/getTokens")
      .then((res) => res.json())
      .then((data) => {
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
    fetch('/mintBatchTokens', requestOptions)
      .then((res) => res.json())
      .then((data) => {
          setSellerTokens(data.sellerTokens)
          setBuyerTokens(data.buyerTokens)
        });
  }
  const onBuyNFT = async (buyDetails) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buyDetails)
    };    
    setLoadingText("Purchasing NFT Tickets on XRPL ...")
    setIsLoading(true)
    await fetch('/buyToken', requestOptions)
    getTokens()
  }

  return (
    <div className="megadiv">
      <div className="headerBuy">
        <div className="headercontainerdiv"><img src={logo} loading="lazy" width="245" alt=""/></div>
      </div>
      <div className="togglerHeader">
        <div className="togglerContainerDiv">
          <div className="toggler">
          <label>
          <span style={{color: "blue"}} className="modeLabel">Buyer Mode   </span>
          <Toggle
            defaultChecked={false}
            className='blue-toggle'
            onChange={() => onToggleSwitch("seller")} />
          <span  className="modeLabel">   Seller Mode</span>
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
        <div onClick={() => onToggleSwitch("collection")}  className="rightdescription">
          <div className="maintitle">
            <div className="maintitletext">Benefit Concert to Support Ukraine</div>
          </div>
          <div className="dates">
            <div className="datestext">Apr 29 - May 2, 2022</div>
          </div>
          <div className="location">
            <div className="locationtext">Central Park | Atlanta, GA</div>
          </div>
          <div className="createnftbutton">
          	<img  
          		 
          		src={buyerButton} 
          		loading="lazy" width="210" alt="" /></div>
        </div>
      </div>
      <div className="bottomsection">
        <div className="mainbottomsecton">
          <div className="existingnft">
            <div className="existingnfttext">Existing NFT Tickets for Event (on XRPL)</div>
          </div>
           {
            loading
            ? <Loader text={loadingText} />
            : <TicketsDiv tickets={sellerTokens} onBuyNFT={onBuyNFT}/>
          }

          


        </div>
      </div>
    </div>
  );
}

export default BuyerView;
