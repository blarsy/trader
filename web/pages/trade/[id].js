import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, gql, useMutation } from '@apollo/client'
import { Checkbox, CircularProgress, MenuItem, Select, Stack, TextField, 
    FormGroup, FormControlLabel, FormControl, InputLabel, Button, filledInputClasses, FormHelperText } from '@mui/material'
import { useAppContext } from '../../lib/appState'

export default function Trade() {
    const router = useRouter()
    const { id } = router.query
    const [newTrade, setNewTrade] = useState({ amountLeftCoin: 0, buyPrice: 0, buyFromMarket: false})
    const [appState] = useAppContext()

    const [validations, setValidations] = useState({
        pristine: true,
        coinpair: { required: true },
        amountLeftCoin: { required: true, float: true },
        buyPrice: { float: true, customConstraint: state => state.buyFromMarket ? true : !!state.buyPrice}
    })
    const setControlError = (controlName, message) => setValidations({ ...validations, ...{ [controlName]: {...validations[controlName], ...{error: message}}}})

    const {loading: marketsLoading, error, data: marketsData} = useQuery(gql`{
        markets { name }
      }`)

    const [createTrade, {data, loading: updating, error: createTradeError}] = useMutation(gql`mutation CreateTrade($trade: NewTrade!){
        createTrade(input: $trade)
      }`, { onError: err => {
          appState.setError(appState, err.toString())
        }})

    const isFormValid = () => {
        for(const propName in validations) {
            if (validations[propName].required && !newTrade[propName]) {
                return false
            }
            if (validations[propName].customConstraint && !validations[propName].customConstraint(newTrade)) {
                return false
            }
            if (validations[propName].validationMessage) {
                return false
            }
        }
        return true
    }
    if(id === "new") {

    }
    return <Stack spacing={2}>
        {marketsLoading && <CircularProgress/>} 
        {!marketsLoading && marketsData && 
            <FormControl required error={!!validations.coinpair.error || (!validations.pristine && !newTrade.coinpair)}>
                <InputLabel id="label-coinpair">Coin pair</InputLabel>
                <Select labelId="label-coinpair" size="small" label="Coin pair *"
                    value={newTrade.market} onChange={e => {
                        setNewTrade({...newTrade, ...{market: e.target.value}})
                }}>
                    {marketsData.markets.map(market => <MenuItem key={market} value={market}>{market}</MenuItem>)}
                </Select>
                { validations.coinpair.error && <FormHelperText>{validations.market.error}</FormHelperText> }
            </FormControl>
        }
        <TextField
            label="Amount coins" 
            required
            size="small" 
            error={!!validations.amountLeftCoin.error || (!validations.pristine && !newTrade.amountLeftCoin)}
            helperText={validations.amountLeftCoin.error}
            value={newTrade.amountLeftCoin} 
            onChange={e => {
                setNewTrade({...newTrade, ...{amountLeftCoin: e.target.value}})
                if (isNaN(Number(e.target.value))) {
                    setControlError('amountLeftCoin', 'Cannot convert value to a number.')
                } else {
                    setControlError('amountLeftCoin', '')              
                }
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
            error={!!validations.buyPrice.error || (!validations.pristine && !newTrade.buyFromMarket && !newTrade.buyPrice)}
            helperText={validations.buyPrice.error}
            value={newTrade.buyPrice}
            onChange={e => {
                setNewTrade({...newTrade, ...{buyPrice: e.target.value}})
                if (isNaN(Number(e.target.value))) {
                    setControlError('buyPrice', 'Cannot convert value to a number.')
                } else {
                    setControlError('buyPrice', '')
                }
            }}/>
        <Button variant="outlined" disabled={updating} onClick={() => {
            if(isFormValid()) {
                createTrade({ variables: { trade: { 
                    market: newTrade.market,
                    amountLeftCoin: Number(newTrade.amountLeftCoin),
                    marketBuy: newTrade.buyFromMarket,
                    buyPrice: Number(newTrade.buyPrice)
                } }})
            } else {
                setValidations({...validations, ...{ pristine: false }})
            }
        }}>{updating && <CircularProgress/> }Ok</Button>
    </Stack>
}