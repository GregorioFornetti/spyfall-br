import crypto from 'crypto'

export default function randomID() {
    return crypto.randomBytes(8).toString("hex")
}