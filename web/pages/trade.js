import { DateTime } from 'luxon'
import { Button, Box, CircularProgress } from "@mui/material"
import { useMutation, useQuery, gql } from '@apollo/client'
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { useAppContext } from '../lib/appState'

export default function Trade() {
    const [appState] = useAppContext()
    const { loading: tradesLoading, error: tradesError, data: trades } = useQuery(gql`{
        trades { id, leftCoin, rightCoin, buyPrice, amountLeftCoin, creationTime }
      }`, { onerror: err => appState.setError(appState, `Error while fetching trades: ${err}`)})

    return <Box sx={{display: 'flex', flexDirection: 'column', alignContent:'stretch'}}>
        <Button href="/trade/new">Take new trade</Button>
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
                {trades && 
                <TableBody>
                    { trades.map(trade =>
                        <TableRow
                            key={trade.ID}>
                            <TableCell component="th" scope="row">{DateTime.fromISO(trade.creationTime)}</TableCell>
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