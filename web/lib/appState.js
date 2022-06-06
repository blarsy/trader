import { createContext, useContext, useState, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client';
import { ethers } from 'ethers'
import { Button, Snackbar, Alert, Backdrop, CircularProgress } from '@mui/material'
import Dashboard from '../pages/components/dashboard'
import ApolloRoot, { client } from '../pages/components/apolloRoot'

const AppContext = createContext();

let ethereum

export function AppWrapper({ children }) {
  const tryConnect = async () => {
    try {
        const { provider, signer, walletAddress } = await ensureWalletInitialized()
        const timestamp = Date.now().toString()
        const signature = await signer.signMessage(timestamp)
        await createSession({ 
          variables: {signature, message: timestamp}, 
          onCompleted: res => {
            localStorage.setItem('sessionId',res.createSession)
            mergeWithState(state, { 
              walletAddress,
              provider,
              signer,
              sessionId: res.createSession,
              autoConnecting: false, 
              errorMsg: null, buttonAction: null, buttonCaption: null
            })
          },
          onError: err =>  mergeWithState(state, { 
            autoConnecting: false, 
            errorMsg: `There was a failure connecting to our backend.\n${err}`,
            buttonCaption: 'Try again', buttonAction: tryConnect,
            triedConnecting: true // Prevents endlessly retrying to connect
          })
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

  const restoreFromSessionId = async () => {
    const { provider, signer, walletAddress } = await ensureWalletInitialized()

    mergeWithState(state, { 
      walletAddress,
      provider,
      signer,
      sessionId: localStorage.getItem('sessionId'),
      autoConnecting: false, 
      errorMsg: null, buttonAction: null, buttonCaption: null
    })
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

  const ensureWalletInitialized = async () => {
    if(!ethereum){
      ethereum = window.ethereum
      ethereum.on('accountsChanged', tryConnect)
      ethereum.on('chainChanged', tryConnect)
      const provider = new ethers.providers.Web3Provider(ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = provider.getSigner()
      const walletAddress = signer.getAddress()
      return { provider, signer, walletAddress }
    }
  }
  const [state, setState] = useState({
    walletAddress: null,
    tryConnect,
    mergeWithState,
    autoConnecting:false,
    setError
  })
  const [createSession, {sessionData, processing}] = useMutation(gql`mutation CreateSession($signature: String!, $message: String!){
    createSession(input: {signature: $signature, message: $message})
  }`, { client })

  useEffect(async () => {
    if(localStorage.getItem('sessionId') && !state.sessionId) {
      await restoreFromSessionId()
    }
  }, [])

  const dismissErrorMsg = () => setError(state)

  return (
    <AppContext.Provider value={[state, setState]}>
      <ApolloRoot>
        <Backdrop
            open={!!processing}>
            <CircularProgress color="inherit" />
        </Backdrop>
        <Snackbar
          open={!!state.errorMsg}
          autoHideDuration={60000}
          onClose={dismissErrorMsg}
          message={state.errorMsg}>
          <Alert onClose={dismissErrorMsg} severity="error">
              {state.errorMsg}
              {state.buttonCaption && <Button color="secondary" size="small" onClick={state.buttonAction}>
                {state.buttonCaption}
              </Button>}
          </Alert>
        </Snackbar>
        <Dashboard>
          {children}
        </Dashboard>
      </ApolloRoot>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}