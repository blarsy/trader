import { useState } from 'react'
import { useQuery, gql, useMutation } from '@apollo/client'
import { Checkbox, CircularProgress, Autocomplete, Stack, TextField, Typography,
    FormGroup, FormControlLabel, FormControl, Button, FormHelperText, Chip } from '@mui/material'
import { useAppContext } from '../../lib/appState'
import { Box } from '@mui/system'

export default function NewTrade() {
    const [newTrade, setNewTrade] = useState({ amountLeftCoin: 0, buyPrice: 0, buyFromMarket: false, market: null})
    const [appState] = useAppContext()

    const [validations, setValidations] = useState({
        pristine: true,
        market: { required: true },
        amountLeftCoin: { required: true, float: true },
        buyPrice: { float: true, customConstraint: state => state.buyFromMarket ? true : !!state.buyPrice}
    })
    const setControlError = (controlName, message) => setValidations({ ...validations, ...{ [controlName]: {...validations[controlName], ...{error: message}}}})

    const {loading: marketsLoading, error, data: marketsData} = useQuery(gql`{
        markets {coin, pair}
    }`)
    const {loading: accountLoading, error: accountLoadError, data: accountData} = useQuery(gql`{
        balances { coin, free, amountCoins }
    }`)

    const [createTrade, {data, loading: updating, error: createTradeError}] = useMutation(gql`mutation CreateTrade($trade: NewTrade!){
        createTrade(input: $trade)
    }`, { onError: err => {
        appState.setFeedback(appState, 'error', err.toString())
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
    return <Stack spacing={2}>
            <Typography sx={{display: 'flex', justifyContent: 'center'}} variant="h4">New trade</Typography>
    {marketsLoading && <CircularProgress/>} 
    {marketsData && accountData && (() => {
        const marketOptions = marketsData.markets.map(market => {
            const balance = accountData.balances.find(balance => balance.coin === market.coin)
            return {label: market.pair, free: balance.free, amountCoins: balance.amountCoins}
        })
        return <FormControl required error={!!validations.market.error || (!validations.pristine && !newTrade.market)}>
            <Autocomplete
                options={marketOptions} 
                renderInput={params => <TextField {...params} error={!!validations.market.error || (!validations.pristine && !newTrade.market)} label="Coin pair" required/>}
                value={newTrade.market}
                isOptionEqualToValue={(option, value) => option.label === value}
                renderOption={(props, option) => (
                    <Box key={option.label} component="li" {...props} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <span>{option.label}</span><Chip label={`${option.free} free of ${option.amountCoins}`}/>
                    </Box>
                )}
                onChange={(e, newValue) => {
                    setNewTrade({...newTrade, ...{market: newValue ? newValue.label : null}})
                }}/>
            { validations.market.error && <FormHelperText>{validations.market.error}</FormHelperText> }
        </FormControl>
    })()}

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
            } }, onCompleted: () => {
                appState.setFeedback(appState, 'success', 'Trade created.')
                setNewTrade({ amountLeftCoin: 0, buyPrice: 0, buyFromMarket: false, market: null})
            }})
        } else {
            setValidations({...validations, ...{ pristine: false }})
        }
    }}>{updating && <CircularProgress/> }Ok</Button>
</Stack>
}