import { Button } from "@mui/material"
import { useAppContext } from '../../lib/appState'

export default function Connect() {
    const [state] = useAppContext()

    return <Button variant="contained" onClick={state.tryConnect}>Connect</Button>
}