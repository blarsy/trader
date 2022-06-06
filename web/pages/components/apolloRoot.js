import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client';
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

export default function ApolloRoot({children}) {


    return <ApolloProvider client={client}>
        {children}
    </ApolloProvider>
}

export { client }