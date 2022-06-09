import NextLink  from 'next/link'
import { Button } from '@mui/material'

export default function Link(props) {
    return <NextLink href={props.href} passHref>
        <Button variant={props.variant || 'text'} {...props}>{props.children}</Button>
    </NextLink>
}