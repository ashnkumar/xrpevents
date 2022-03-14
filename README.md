## XRPL events
With XRPL Events, any event creator can easily mint limited edition NFT tickets for their event - in the quantity and tiering that they choose - and distribute those tickets for buyers!

## Live events are a great use case for NFTs
NFT’s have seen an incredible boom and tokenization represents an amazing, decentralized future.

So far, we’ve seen the biggest use cases for NFTs in digital art, but another key area where they can come in is in **LIVE EVENTS** like concerts, conferences, and get togethers. For decades, people have been holding onto tickets from concerts or other memorabilia as evidence that they were at that event. 

NFTs represent a way to **TOKENIZE** their attendance onto a public, decentralized blockchain, to keep a record of their attendance and memorialize their fandom forever.

## The problem: it's not easy to create NFTs for live events!
Event creators need a simple way to make _MULTIPLE_ tiers of tickets to sell, and in vast quantities; they also need to keep track of how many tickets are sold, since they can’t over-book for an event.

The current solutions don't make it easy for an event creator -- much less someone not familiar with the ins and outs of software -- to easily create NFTs for their events.

## Our solution: help event creators easily mint NFT tickets for live events
![How it works](https://i.imgur.com/53BoOAO.png)
Here’s how it works:
1. An event creator can log into our web app with their XRPL wallet.
2. They can click "Create NFT Tickets" and be guided through a simple GUI to set up their tickets
3. They can also select the **quantity** of their tickets, which is essential for live event creators.
4. Once they submit, the app transacts on the XRPL chain to mint those NFT tickets and offer them up for sale
5. Buyers can browse those live event NFT tickets on the web app and buy them directly
6. For the buyer of the ticket, the NFT is transformed into a QR Code that they can use to redeem the special tier at the event itself


## Under the hood
![How it works1](https://i.imgur.com/monyTDo.png)
1. When the seller mints tickets:
    1. our app takes in the information about the ticket and encodes that into the URI as a hex
    2. the app submits those transactions to the XRPL chain, and repeats for the quantity the selleer provided
    3. For each ticket, the app also creates a NFTokenSell Offer for the sale price provided by the merchant

2. When the buyer buys a ticket
    1. The app puts in an NFTokenAcceptOffer transaction into the XRPL chain for that tokenID,
    2. And the token is transferred to them



## What's next?
We have a LOT to build on this in the near future to make it practical for production use cases:

1. First, we want to deploy the entire app into a smart contract so it can be interacted with in a completely open, decentralized way.
2. Then, we want to offer an auction process so buyers of NFT tickets can issue “bids” that the sellers can choose from.
3. Also, we want to allow different media into the NFT and store it on IPFS, like video from the artists of a concert.

**We think XRPL events can be used for a _lot_ of use cases, like creating NFT memories from conferences, weddings, or get togethers.**

We're excited to see where the XRPL community takes this!


### To test out the app:
1. Go to the github repository in the "try it out" section on this posting.
2. Run "npm install" on both the root-level repository (the NodeJS server) and the client folder (the web app in React).
3. **Swap out the buyer / seller test wallet credentials in the server's index.js with your own!**
