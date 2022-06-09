import NextLink  from 'next/link'
import { Button } from '@mui/material'

export default function Link({href, children}) {
    return <NextLink href={href} passHref>
        <Button variant="outlined" href={href}>{children}</Button>
    </NextLink>
}