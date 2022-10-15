import crypto from 'crypto'

function randomId() {
    return crypto.randomBytes(8).toString("hex")
}

export default class User {
    constructor() {
        this.userID = randomId()
        this.socketID = null
        this.game = null
    }
}
