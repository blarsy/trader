import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, gql, useMutation } from '@apollo/client'
import { Checkbox, CircularProgress, MenuItem, Select, Stack, TextField, 
    FormGroup, FormControlLabel, FormControl, InputLabel, Button } from '@mui/material'

export default function Trade() {
    const router = useRouter()
    const { id } = router.query
    const [newTrade, setNewTrade] = useState({ amountLeftCoin: 0, buyPrice: 0, buyFromMarket: false})
    const [validations, setValidations] = useState({})

    const {loading: marketsLoading, error, data: marketsData} = useQuery(gql`{
        markets { leftCoin, rightCoin }
      }`)

    if(id === "new") {

    }
    return <Stack spacing={2}>
        {marketsLoading && <CircularProgress/>} 
        {!marketsLoading && marketsData && 
            <FormControl required>
                <InputLabel id="label-coinpair">Coin pair</InputLabel>
                <Select labelId="label-coinpair" size="small" label="Coin pair *"
                    value={newTrade.leftCoin ? newTrade.leftCoin + '/' + newTrade.rightCoin : ''} onChange={e => {
                        const [leftCoin, rightCoin] = e.target.value.split('/')
                        setNewTrade({...newTrade, ...{leftCoin, rightCoin}})
                }}>
                    {marketsData.markets.map(market => <MenuItem key={market.leftCoin + '/' + market.rightCoin} value={market.leftCoin + '/' + market.rightCoin}>{market.leftCoin + market.rightCoin}</MenuItem>)}
                </Select>
            </FormControl>
        }
        <TextField
            label="Amount coins" 
            required
            size="small" 
            error={validations.amountLeftCoin}
            helperText={validations.amountLeftCoin}
            value={newTrade.amountLeftCoin} 
            onChange={e => {
                setNewTrade({...newTrade, ...{amountLeftCoin: e.target.value}})
                let validationMessage
                if (isNaN(Number(e.target.value))) {
                    validationMessage = 'Cannot convert value to a number.'
                } else {
                    validationMessage = ''                 
                }
                setValidations({...validations, ...{ amountLeftCoin: validationMessage }})
            }}/>
        <FormGroup>
            <FormControlLabel control={<Checkbox size="small"
                checked={newTrade.buyFromMarket}
                onChange={e => setNewTrade({...newTrade, ...{buyFromMarket :e.target.checked}})} />} label="Buy from market ?" />
        </FormGroup>
        <TextField
            label="Buy price"
            size="small"
            disabled={newTrade.buyFromMarket}
            required={!newTrade.buyFromMarket}
            error={validations.buyPrice}
            helperText={validations.buyPrice}
            value={newTrade.buyPrice}
            onChange={e => {
                setNewTrade({...newTrade, ...{buyPrice: e.target.value}})
                let validationMessage
                if (isNaN(Number(e.target.value))) {
                    validationMessage = 'Cannot convert value to a number.'
                } else {
                    validationMessage = ''                 
                }
                setValidations({...validations, ...{ buyPrice: validationMessage }})
            }}/>
        <Button variant="outlined" disabled={validations !== {}} onClick={() => {
            console.log(newTrade)
        }}>Ok</Button>
    </Stack>
}