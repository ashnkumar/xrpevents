import React from 'react'
import logo from './logo.svg';
import SellerView from './SellerView';
import BuyerView from './BuyerView';
import BuyerCollectionView from './BuyerCollectionView';

function App() {
  const [mode, setMode] = React.useState("seller")

  const onToggleSwitch = (newMode) => {
    console.log(newMode)
    setMode(newMode)
  }

  if (mode === "seller") {
    return (
      <SellerView onToggleSwitch={onToggleSwitch} />
    )
  }

  else if (mode === "buyer") {
    return (
      <BuyerView onToggleSwitch={onToggleSwitch} />
    ) 
  }

  else if (mode === "collection") {
    return (
      <BuyerCollectionView onToggleSwitch={onToggleSwitch}/>
    ) 
  }

  else {

    setMode("seller")
  }
  
}

export default App;
