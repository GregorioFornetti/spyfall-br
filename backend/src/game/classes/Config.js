import { getPlaces } from "../../db-api/models/getters.js"

export default class Config {
    static async build() {
        const newOption = new this()
        newOption.selectedPlacesIds = (await getPlaces()).map((place) => (place.id))
        return newOption
    }

    constructor() {
        // Configurações de pontuação
        this.nonSpyVictoryScore = 1
        this.nonSpyAcusatorScore = 1
        this.timeFinishedScore = 2
        this.wrongAcusationScore = 4
        this.correctPlaceScore = 4

        // Configurações de lugares
        this.selectedPlacesIds = null  // Será preenchido no build
        this.qntSelectedPlaces = 15

        // Configurações de tempo
        this.roundMaxTime = 10 * 60
        this.votationTime = 1 * 60 + 30
    }

    toJSON() {
        return {
            possiblePlaces: this.possiblePlaces,
            possiblePlacesNumber: this.possiblePlacesNumber
        }
    }
}