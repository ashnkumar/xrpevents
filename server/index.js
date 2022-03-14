const express = require("express");
const xrpl = require("xrpl")
const sellerAddress = "rPhLm8u662PgyMvZ1SyAwn5G2PtqTRJiuV"
const sellerSecret = "ssKKb8j8qh58RH4xEgTwMJLSGHFKv"
const buyerAddress = "rJV8zdvuods5a7pdLF1RFGYrh95ky8YW8J"
const buyerSecret = "snmmoysht5KRQijdtc6B62rCBBLWG"
const path = require('path');

const PORT = process.env.PORT || 3001;

async function mintBatchTokens(tokensInfo) {
  const wallet = xrpl.Wallet.fromSeed(sellerSecret)
  var sellerClient = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233")
  await sellerClient.connect()

  // Create all tokens
  const json = {
    color: tokensInfo.tokenColor,
    ticketName: tokensInfo.ticketName,
    totalMinted: tokensInfo.tokenQuantity,
    ticketDescription: tokensInfo.ticketDescription,
    eventName: tokensInfo.eventName || ''
  }
  const myJSON = JSON.stringify(json)
  const jsonHEX = xrpl.convertStringToHex(myJSON)
  const transactionBlob = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: jsonHEX,
    Flags: 1, 
    TokenTaxon: 0
  }
  for (var i = 0; i < tokensInfo.tokenQuantity; i++) {
    const tx = await sellerClient.submitAndWait(transactionBlob,{wallet})  
    console.log("Minted token ", i+1)
  }  
  console.log("Finished minting tokens\n")


  // Fetch all tokens just created
  const nfts = await sellerClient.request({
    method: "account_nfts",
    account: wallet.classicAddress
  })


  // Create sell offers for all tokens
  var sellOffers = []
  nfts.result.account_nfts.forEach((token) => {
    const transactionBlob = {
      "TransactionType": "NFTokenCreateOffer",
      "Account": wallet.classicAddress,
      "TokenID": token.TokenID,
      "Amount": tokensInfo.tokenAmount,
      "Flags": 1
    }
    sellOffers.push(transactionBlob)
  })
  for (const sellOffer of sellOffers) {
    const tx = await sellerClient.submitAndWait(sellOffer,{wallet})
    console.log("Created sale offer for token: ", sellOffer.TokenID)
  }
  console.log("Finished creating sales offers\n")

  sellerClient.disconnect()
  return nfts.result.account_nfts

}

function convertTokens(rawTokens) {
  var newTokens = []

  rawTokens.forEach((token) => {
    const jsonObj = JSON.parse(xrpl.convertHexToString(token.URI))
    newTokens.push({
      tokenID: token.TokenID,
      tokenColor: jsonObj.color,
      ticketName: jsonObj.ticketName,
      ticketDescription: jsonObj.ticketDescription,
      totalMinted: jsonObj.totalMinted,
      eventName: jsonObj.eventName
    })
  })
  return newTokens
}

async function getAllSellOffers() {

  const allTokens = await getSellerTokens()

  
  const wallet = xrpl.Wallet.fromSeed(sellerSecret)
  var sellerClient = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233")
  await sellerClient.connect()

  var allSellOrders = {}
  for (token of allTokens) {
    let nftSellOffers
    try {
      nftSellOffers = await sellerClient.request({
        method: "nft_sell_offers",
        tokenid: token.TokenID
      })  
      allSellOrders[token.TokenID] = nftSellOffers.result.offers
    } catch (err) {
        console.log("No sell offers.")
      }
  }
  return allSellOrders
}

async function getSellerTokens() {

  const sellerWallet = xrpl.Wallet.fromSeed(sellerSecret)
  var sellerClient = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233")
  await sellerClient.connect()

  const nfts = await sellerClient.request({
    method: "account_nfts",
    account: sellerWallet.classicAddress
  })
  sellerClient.disconnect()
  return nfts.result.account_nfts
}

async function getBuyerTokens() {
  const buyerWallet = xrpl.Wallet.fromSeed(buyerSecret)
  var buyerClient = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233")
  await buyerClient.connect()
  const nfts = await buyerClient.request({
    method: "account_nfts",
    account: buyerWallet.classicAddress
  })
  var newNFTs = []
  buyerClient.disconnect()
  return nfts.result.account_nfts
}

async function createSellOffer() {
  const wallet = xrpl.Wallet.fromSeed(sellerSecret)
  var sellerClient = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233")
  await sellerClient.connect()

  const nfts = await sellerClient.request({
    method: "account_nfts",
    account: wallet.classicAddress
  })

  const tokens = nfts.result.account_nfts
  const AMOUNT = "10000000"
  var sellOffers = []
  tokens.forEach((token) => {
    const transactionBlob = {
          "TransactionType": "NFTokenCreateOffer",
          "Account": wallet.classicAddress,
          "TokenID": token.TokenID,
          "Amount": AMOUNT,
          "Flags": 1
    }
    sellOffers.push(transactionBlob)
  })
  
  for (const sellOffer of sellOffers) {
    const tx = await sellerClient.submitAndWait(sellOffer,{wallet})//AndWait
  }
  sellerClient.disconnect()

}

async function buyToken(tokenIndex) {

  const wallet = xrpl.Wallet.fromSeed(buyerSecret)
  const buyerClient = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233")
  await buyerClient.connect()

 // Prepare transaction -------------------------------------------------------
  const transactionBlob = {
        "TransactionType": "NFTokenAcceptOffer",
        "Account": wallet.classicAddress,
        "SellOffer": tokenIndex,
  }
  // Submit signed blob --------------------------------------------------------
  const tx = await buyerClient.submitAndWait(transactionBlob,{wallet})
  return null
}

const app = express();
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, '../client/build')));

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/getTokens", async (req, res) => {
  const sellerTokens = await getSellerTokens()
  const convertedSellerTokens = convertTokens(sellerTokens)
  const sellOffers = await getAllSellOffers()
  var finalSellerTokens = []
  convertedSellerTokens.forEach((sellerToken) => {
    const tokenID = sellerToken.tokenID
    finalSellerTokens.push({
      tokenID: tokenID,
      tokenColor: sellerToken.tokenColor,
      ticketName: sellerToken.ticketName,
      ticketDescription: sellerToken.ticketDescription,
      tokenIndex: sellOffers[tokenID] ? sellOffers[tokenID][0].index : null,
      salePrice: sellOffers[tokenID] ? sellOffers[tokenID][0].amount : null
    })
  })
  
  const buyerTokens = await getBuyerTokens()
  return res.json({ 
    sellerTokens: finalSellerTokens,
    buyerTokens: convertTokens(buyerTokens)
   });
});

app.post("/mintBatchTokens", async (req, res) => {
  const sellerTokens = await mintBatchTokens(req.body)
  const convertedSellerTokens = convertTokens(sellerTokens)
  const sellOffers = await getAllSellOffers()
  var finalSellerTokens = []
  convertedSellerTokens.forEach((sellerToken) => {
    const tokenID = sellerToken.tokenID
    finalSellerTokens.push({
      tokenID: tokenID,
      tokenColor: sellerToken.tokenColor,
      tokenIndex: sellOffers[tokenID][0].index,
      salePrice: sellOffers[tokenID][0].amount
    })
  })
  
  const buyerTokens = await getBuyerTokens()
  return res.json({ 
    sellerTokens: finalSellerTokens,
    buyerTokens: convertTokens(buyerTokens)
   });
});

app.post("/buyToken", async (req, res) => {
  const tokenIndex = req.body.tokenIndex
  await buyToken(tokenIndex)
  return res.sendStatus(200)
});

app.listen(PORT, async () => {
  console.log(`Server listening on ${PORT}`);
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
