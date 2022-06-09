import { DateTime } from 'luxon'
import { Button, Box, CircularProgress } from "@mui/material"
import { useMutation, useQuery, gql } from '@apollo/client'
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import Link from './components/link'
import { useAppContext } from '../lib/appState'

export default function Trade() {
    const [appState] = useAppContext()
    const { loading: tradesLoading, error: tradesError, data: tradesData } = useQuery(gql`{
        trades { id, leftCoin, rightCoin, buyPrice, amountLeftCoin, creationTime }
      }`, { onerror: err => appState.setError(appState, `Error while fetching trades: ${err}`)})

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
                    </TableRow>
                </TableHead>
                {tradesData && 
                <TableBody>
                    { tradesData.trades.map(trade =>
                        <TableRow
                            key={trade.id}>
                            <TableCell component="th" scope="row">{DateTime.fromMillis(Number(trade.creationTime)).toLocaleString()}</TableCell>
                            <TableCell align="right">{trade.leftCoin}/{trade.rightCoin}</TableCell>
                            <TableCell align="right">{trade.amountLeftCoin}</TableCell>
                            <TableCell align="right">{trade.buyPrice}</TableCell>
                        </TableRow>
                    )}
                </TableBody>}
            </Table>
        </TableContainer>
    </Box>
}