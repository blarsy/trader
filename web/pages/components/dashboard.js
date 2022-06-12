import { MenuItem, MenuList, Stack } from '@mui/material'
import { Box } from '@mui/system'
import { useRouter } from 'next/router'
import ArrowRight from '@mui/icons-material/ArrowRight'
import {useAppContext} from '../../lib/appState'
import Link from './link'

export default function Dashboard({ children }) {
    const [appState] = useAppContext()
    const router = useRouter()
    if(!appState.sessionId) {
        return children
    }
    const routes = [
        {path: '/trade', title: 'Trades'},
        {path: '/sniper', title: 'Sniper'},
    ]
    return <Stack direction="row">
        <MenuList sx={{display: 'flex', flexDirection: 'column', justifyContent: 'stretch', alignContent: 'stretch'}}>
            {routes.map(route => <MenuItem key={route.path} component={Link} href={route.path}>{route.title}{router.pathname.toLocaleLowerCase() === route.path && <ArrowRight/>}</MenuItem>)}
        </MenuList>
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'stretch', flexGrow: 1}}>
            {children}
        </Box>
    </Stack>
}