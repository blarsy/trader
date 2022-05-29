import { useRouter } from 'next/router'
import { Stack, TextField } from '@mui/material'

export default function Trade() {
    const router = useRouter()
    const { id } = router
    if(id === "new") {
        return <Stack>
            <TextField label="Outlined"></TextField>
        </Stack>
    }
    return "Not implemented"
}