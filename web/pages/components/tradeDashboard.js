import { Box, Typography, Paper, Chip, CircularProgress } from '@mui/material'
import { useAppContext } from '../../lib/appState'
import { useQuery, gql } from '@apollo/client'
import Percent from './Percent'
import Close from '@mui/icons-material/Close'
import Bolt from '@mui/icons-material/Bolt'

export default function TradeDashboard({ tradeId }) {
    const [appState] = useAppContext()
    const {loading: tradeLoading, data: tradeData} = useQuery(gql`query GetTrade($id: ID){
        trades (id: $id) { id, market, buyPrice, amountLeftCoin, creationTime }
    }`, { variables: {id: tradeId } , onError: err => appState.setFeedback(appState, 'error', `Error while fetching trades: ${err}`)})
    const {loading: priceLoading, data: priceData} = useQuery(gql`query getPrice ($market: String){
        prices(market: $market){ market, price }
    }`, { skip: !tradeData?.trades[0].market, 
        variables: { market: tradeData?.trades[0].market}, 
        onError: err => appState.setFeedback(appState, 'error', `Error while fetching price: ${err}`)})

    if(tradeLoading || priceLoading) {
        return <CircularProgress/>
    }
    if(tradeData && priceData) {
        const tradeInfo = {...tradeData.trades[0]}
        tradeInfo.price = priceData.prices[0].price
        tradeInfo.status = tradeInfo.sellPrice ? 'Closed' : 'Active'
        const Status = props => {
            const { buyprice, latestrelevantprice, status } = props
            console.log(`${buyprice} ${latestrelevantprice} ${status}`)
            return <Box sx={{...props.sx, ...{display:'flex', justifyContent: 'space-evenly'}}}>
                <Chip icon={status === 'Active' ? <Bolt/> : <Close/>} label={status} />
                <Percent baseprice={buyprice} currentprice={latestrelevantprice} variant="h6"/>
            </Box>
        }
        console.log(`${JSON.stringify(tradeInfo)}`)
        return <Paper variant="outlined" sx={{padding: '1rem'}}>
            <Typography sx={{display: 'flex', justifyContent: 'center'}} variant="h4">{tradeInfo.market}</Typography>
            <Typography variant="caption" sx={{color: '#CCC'}}>{tradeId}</Typography>
            <Box sx={{ display: 'flex' }}>
                <Typography sx={{flexGrow: '1'}} variant="overline">Status</Typography>
                <Status sx={{flexGrow: '2'}} status={tradeInfo.status} 
                    buyprice={tradeInfo.buyPrice} 
                    latestrelevantprice={tradeInfo.sellPrice || tradeInfo.price} />
            </Box>
        </Paper>
    }

}