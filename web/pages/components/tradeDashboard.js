import { Box, Typography, Paper, Chip, Collapse } from '@mui/material'
import Percent from './Percent'
import Close from '@mui/icons-material/Close'
import Bolt from '@mui/icons-material/Bolt'

export default function TradeDashboard({ tradeId }) {
    const tradeInfo = {
        market: 'BTCUSDT',
        buyPrice: 40000,
        currentPrice: 37000,
        status: 'active',
        sellPrice: 41000
    }

    const Status = props => {
        const { buyprice, latestrelevantprice, status } = props
        return <Box sx={{...props.sx, ...{display:'flex', justifyContent: 'space-evenly'}}}>
            <Chip icon={status === 'active' ? <Bolt/> : <Close/>} label={status} />
            <Percent baseprice={buyprice} currentprice={latestrelevantprice} variant="h6"/>
        </Box>
    }

    return <Paper variant="outlined" sx={{padding: '1rem'}}>
        <Typography sx={{display: 'flex', justifyContent: 'center'}} variant="h4">{tradeInfo.market}</Typography>
        <Typography variant="caption" sx={{color: '#CCC'}}>{tradeId}</Typography>
        <Box sx={{ display: 'flex' }}>
            <Typography sx={{flexGrow: '1'}} variant="overline">Status</Typography>
            <Status sx={{flexGrow: '2'}} status={tradeInfo.status} 
                buyprice={tradeInfo.buyPrice} 
                latestrelevantprice={tradeInfo.status === 'active' ? tradeInfo.currentPrice : tradeInfo.sellPrice} />
        </Box>
    </Paper>
}