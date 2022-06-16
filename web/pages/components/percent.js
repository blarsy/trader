import { Typography } from "@mui/material"

const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export default function Percent(props) {
    const {baseprice, currentprice, variant} = props
    const percent = ((currentprice - baseprice)/baseprice)*100
    const color = percent < 0 ? 'error' : 'success'
    return <Typography {...props} color={color} variant={variant}>{formatter.format(percent)} %</Typography>
}