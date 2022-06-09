import { MenuItem, MenuList, Stack } from '@mui/material'
import { Box } from '@mui/system'
import {useAppContext} from '../../lib/appState'
import Link from './link'

export default function Dashboard({ children }) {
    const [appState] = useAppContext()
    if(!appState.sessionId) {
        return children
    }
    return <Stack direction="row">
        <MenuList>
            <MenuItem><Link href="/trade">Trades</Link></MenuItem>
            <MenuItem><Link href="/sniper">Sniper</Link></MenuItem>
        </MenuList>
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'stretch', flexGrow: 1}}>
            {children}
        </Box>
    </Stack>
}