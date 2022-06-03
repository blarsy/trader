import { createContext, useContext, useState } from 'react'
import { ethers } from 'ethers'
import { Button, Snackbar, Alert, Backdrop, CircularProgress } from '@mui/material'
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, gql, useMutation } from '@apollo/client';
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: 'http://localhost:8080/query',
})
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('sessionId');
  // return the headers to the context so httpLink can read them
  if(token) {
    return {
      headers: {
        ...headers,
        authorization: token,
      }
    }
  }
  return { headers }

})
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  // Enable sending cookies over cross-origin requests
  credentials: 'include'
})
const AppContext = createContext();

let ethereum

export function AppWrapper({ children }) {
  const [createSession, {sessionData, processing}] = useMutation(gql`mutation CreateSession($signature: String!, $message: String!){
    createSession(input: {signature: $signature, message: $message})
  }`, { client })
  const tryConnect = async () => {
    try {
        const { provider, signer, walletAddress } = await ensureWalletInitialized()
        const timestamp = Date.now().toString()
        const signature = await signer.signMessage(timestamp)
        await createSession({ 
          variables: {signature, message: timestamp}, 
          onCompleted: res => {
            console.log(res.createSession)
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

  const [state, setState] = useState({
    walletAddress: null,
    tryConnect,
    mergeWithState,
    restoreFromSessionId,
    autoConnecting:false,
    setError
  })

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

  const dismissErrorMsg = () => setError(state)

  return (
    <AppContext.Provider value={[state, setState]}>
      <ApolloProvider client={client}>
      <Backdrop
          open={!!processing}
        >
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
        {children}
      </ApolloProvider>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}