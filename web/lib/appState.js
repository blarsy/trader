import { createContext, useContext, useState } from 'react'
import { ethers } from 'ethers'
import { Button, Snackbar, Alert } from '@mui/material'
import axios from 'axios'

const AppContext = createContext();

let ethereum
let provider

export function AppWrapper({ children }) {
  const tryConnect = async () => {
    try {
        ensureWalletInitialized()
        provider = new ethers.providers.Web3Provider(ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const walletAddress = await signer.getAddress()
        const timestamp = Date.now().toString()
        const signature = await signer.signMessage(timestamp)
        await axios.put('/api/session', { signature, nonce: timestamp })
        localStorage.setItem('walletAddress', walletAddress)
        mergeWithState(state, { 
          walletAddress,
          provider,
          signer, 
          autoConnecting: false, 
          errorMsg: null, buttonAction: null, buttonCaption: null
        })
    } catch (ex) {
        console.log(ex)
        mergeWithState(state, { 
          autoConnecting: false, 
          errorMsg: 'There was a failure connecting to our backend.',
          buttonCaption: 'Try again', buttonAction: tryConnect,
          triedConnecting: true // Prevents endlessly retrying to connect
        })
    }
  }
  const mergeWithState = (oldState, newState) => {
    setState({...oldState, ...newState})
  }
  const setError = (oldState, msg, buttonCaption, buttonAction) => {
    const errorData = {
      errorMsg: msg
    }
    if(buttonCaption && buttonAction) {
      errorData.buttonCaption = buttonCaption
      errorData.buttonAction = buttonAction
    }
    mergeWithState(oldState, errorData)
  }

  const [state, setState] = useState({
    walletAddress: null,
    tryConnect,
    mergeWithState,
    autoConnecting:false,
    setError
  })

  const ensureWalletInitialized = () => {
    if(!ethereum){
      ethereum = window.ethereum
      ethereum.on('accountsChanged', tryConnect)
      ethereum.on('chainChanged', tryConnect)
    }
  }

  const dismissErrorMsg = () => setError(state)

  return (
    <AppContext.Provider value={[state, setState]}>
      <Snackbar
        open={!!state.errorMsg}
        autoHideDuration={60000}
        onClose={dismissErrorMsg}
        message={state.errorMsg}
      >
        <Alert onClose={dismissErrorMsg} severity="error">
            {state.errorMsg}
            {state.buttonCaption && <Button color="secondary" size="small" onClick={state.buttonAction}>
              {state.buttonCaption}
            </Button>}
        </Alert>
      </Snackbar>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}