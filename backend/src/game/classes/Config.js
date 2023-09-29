import { getPlaces } from "../../db-api/models/getters.js"

function verifyNumberInput(errors, inputName, input, min, max) {
    if (!Number.isInteger(input)) {
        errors[inputName] = 'Precisa ser um número inteiro'
    }
    else if (min !== null && input < min) {
        errors[inputName] = 'Não pode ser negativo'
    }
    else if (max !== null && input > max) {
        errors[inputName] = 'Não pode ser maior que ' + max
    }
}

export default class Config {
    static async build() {
        const newOption = new this()
        newOption.selectedPlacesIds = (await getPlaces()).map((place) => (place.id))
        newOption.possiblePlacesIds = [...newOption.selectedPlacesIds]
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

    setNewConfig(newConfig) {
        const errors = this.verifyConfig(newConfig)
        
        if (Object.keys(errors).length > 0) {
            return [true, errors]
        }

        this.nonSpyVictoryScore = newConfig.nonSpyVictoryScore
        this.nonSpyAcusatorScore = newConfig.nonSpyAcusatorScore
        this.timeFinishedScore = newConfig.timeFinishedScore
        this.wrongAcusationScore = newConfig.wrongAcusationScore
        this.correctPlaceScore = newConfig.correctPlaceScore

        this.selectedPlacesIds = newConfig.selectedPlacesIds
        this.qntSelectedPlaces = newConfig.qntSelectedPlaces

        this.roundMaxTime = newConfig.roundMaxTime * 60

        return [false, null]
    }

    verifyConfig(newConfig) {
        const errors = {}
        
        verifyNumberInput(errors, 'nonSpyVictoryScore', newConfig.nonSpyVictoryScore, 0, null)   
        verifyNumberInput(errors, 'nonSpyAcusatorScore', newConfig.nonSpyAcusatorScore, 0, null)
        verifyNumberInput(errors, 'timeFinishedScore', newConfig.timeFinishedScore, 0, null)
        verifyNumberInput(errors, 'wrongAcusationScore', newConfig.wrongAcusationScore, 0, null)
        verifyNumberInput(errors, 'correctPlaceScore', newConfig.correctPlaceScore, 0, null)
        
        if (!Array.isArray(newConfig.selectedPlacesIds)) {
            errors['selectedPlacesIds'] = 'Precisa ser um array'
        } else if (newConfig.selectedPlacesIds.length < 2) {
            errors['selectedPlacesIds'] = 'Precisa ter pelo menos 2 lugares'
        } else {
            for (let id of newConfig.selectedPlacesIds) {
                if (this.possiblePlacesIds.indexOf(id) === -1) {
                    errors['selectedPlacesIds'] = `O id ${id} não é um id válido`
                    break
                }
            }
        }
        verifyNumberInput(errors, 'qntSelectedPlaces', newConfig.qntSelectedPlaces, 1, null)

        verifyNumberInput(errors, 'roundMaxTime', newConfig.roundMaxTime, 1, 60)

        return errors
    }

    toJSON() {
        return {
            nonSpyVictoryScore: this.nonSpyVictoryScore,
            nonSpyAcusatorScore: this.nonSpyAcusatorScore,
            timeFinishedScore: this.timeFinishedScore,
            wrongAcusationScore: this.wrongAcusationScore,
            correctPlaceScore: this.correctPlaceScore,

            selectedPlacesIds: this.selectedPlacesIds,
            qntSelectedPlaces: this.qntSelectedPlaces,

            roundMaxTime: Math.round(this.roundMaxTime / 60)
        }
    }
}