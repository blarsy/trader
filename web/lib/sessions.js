import { ethers } from "ethers"

const sessions = {}
const getNonce = address => sessions[address]
export default {
    add: (nonce, signature) => {
        const address = ethers.utils.verifyMessage(nonce, signature)
        const prevNonce = getNonce(address)
        if(prevNonce && nonce < prevNonce) {
            throw new Error('Invalid nonce.')
        }
        sessions[address] = nonce
        return address
    },
    check: (nonce, signature) => {
        const address = ethers.utils.verifyMessage(nonce, signature)
        if(nonce < getNonce(address)) {
            return false
        }
        return true
    },
    getNonce
}