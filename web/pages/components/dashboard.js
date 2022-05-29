import {useState, useEffect} from 'react'
import { Button } from "@mui/material"

export default function Dashboard() {
    const [trades, setTrades] = useState(null)

    useEffect(async () => {
        //load trades
    },trades)

    return <Button href="#/trades/new">Take Trade</Button>
}