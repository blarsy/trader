
import { forwardRef } from 'react'
import NextLink  from 'next/link'
import { Button } from '@mui/material'

export default forwardRef((props, ref) => <NextLink href={props.href} passHref>
    <Button ref={ref}  variant={props.variant || 'text'} {...props}>{props.children}</Button>
</NextLink>)