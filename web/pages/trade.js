import { DateTime } from 'luxon'
import { Box, CircularProgress } from "@mui/material"
import { useQuery, gql } from '@apollo/client'
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import ZoomIn from '@mui/icons-material/ZoomIn'
import Link from './components/link'
import { useAppContext } from '../lib/appState'

export default function Trade() {
    const [appState] = useAppContext()
    const { loading: tradesLoading, error: tradesError, data: tradesData } = useQuery(gql`{
        trades { id, market, buyPrice, amountLeftCoin, creationTime }
      }`, { onerror: err => appState.setFeedback(appState, 'error', `Error while fetching trades: ${err}`)})

    return <Box sx={{display: 'flex', flexDirection: 'column', alignItems:'center'}}>
        <Link href="/trade/new" variant="contained">Take new trade</Link>
    {tradesLoading && <CircularProgress/>}
        <TableContainer component={Paper}>
            <Table size="small" aria-label="Trades table">
                <TableHead>
                    <TableRow>
                        <TableCell>Creation date</TableCell>
                        <TableCell>Pair</TableCell>
                        <TableCell align="right">Amount coins</TableCell>
                        <TableCell align="right">Buy price</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                {tradesData && 
                <TableBody>
                    { tradesData.trades.map(trade =>
                        <TableRow
                            key={trade.id}>
                            <TableCell component="th" scope="row">{DateTime.fromMillis(Number(trade.creationTime)).toLocaleString()}</TableCell>
                            <TableCell>{trade.market}</TableCell>
                            <TableCell align="right">{trade.amountLeftCoin}</TableCell>
                            <TableCell align="right">{trade.buyPrice}</TableCell>
                            <TableCell align="center"><Link href={`/trade/${trade.id}`}><ZoomIn/></Link></TableCell>
                        </TableRow>
                    )}
                </TableBody>}
            </Table>
        </TableContainer>
    </Box>
}