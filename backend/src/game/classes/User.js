import crypto from 'crypto'
import randomID from '../randomID.js'

export default class User {
    constructor(socketID) {
        this.userID = randomID()
        this.socketID = socketID
        this.game = null
    }
}
