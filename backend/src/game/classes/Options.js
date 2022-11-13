import { getPlaces } from "../../db-api/models/getters.js"

export default class Options {
    static async build() {
        const newOption = new this()
        newOption.possiblePlaces = (await getPlaces()).map((place) => (place.id))
        return newOption
    }

    constructor() {
        this.possiblePlaces = null
        this.possiblePlacesNumber = 20
        this.matchTime = 10 * 60
        this.votationTime = 1 * 60 + 30
    }

    toJSON() {
        return {
            possiblePlaces: this.possiblePlaces,
            possiblePlacesNumber: this.possiblePlacesNumber
        }
    }
}