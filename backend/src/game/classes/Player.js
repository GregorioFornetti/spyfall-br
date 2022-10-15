

export default class Player {
    constructor(user, username) {
        this.user = user
        this.username = username
        this.score = 0
    }

    increaseScore(value) {
        this.score += value
    }

    toJSON() {
        return {
            id: this.user.userID,
            username: this.username,
            score: this.score
        }
    }

    getSocketID() {
        return this.user.socketID
    }
}