import { getPlaces, getRoles } from "../../db-api/models/getters.js"

// Lugares/cargos personalizados são criados no navegador do líder e ficam
// no localStorage dele; eles só viajam junto da configuração da sala.
// Para nunca colidirem com os ids do banco (positivos), os ids
// personalizados são sempre negativos, e a categoria deles é esta:
export const CUSTOM_CATEGORY_ID = -1

const MAX_CUSTOM_ITEMS = 100
const MAX_NAME_LENGTH = 80
const MAX_IMAGE_URL_LENGTH = 1000

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

function sanitizeName(raw) {
    if (!raw || typeof raw !== 'object') {
        return null
    }
    const pt = typeof raw.pt === 'string' ? raw.pt.trim() : ''
    const en = typeof raw.en === 'string' ? raw.en.trim() : ''
    if (!pt || pt.length > MAX_NAME_LENGTH || en.length > MAX_NAME_LENGTH) {
        return null
    }
    return { pt, en: en || pt }
}

function sanitizeCustomRoles(input, errors) {
    if (input === undefined) {
        return []
    }
    if (!Array.isArray(input) || input.length > MAX_CUSTOM_ITEMS) {
        errors['customRoles'] = 'Precisa ser um array de cargos personalizados'
        return []
    }
    const roles = []
    const seenIds = new Set()
    for (const raw of input) {
        const name = sanitizeName(raw?.name)
        if (!Number.isInteger(raw?.id) || raw.id >= 0 || seenIds.has(raw.id) || !name) {
            errors['customRoles'] = 'Cargo personalizado inválido (id negativo único e nome são obrigatórios)'
            return []
        }
        seenIds.add(raw.id)
        roles.push({ id: raw.id, name })
    }
    return roles
}

function sanitizeCustomPlaces(input, errors, validRolesIds) {
    if (input === undefined) {
        return []
    }
    if (!Array.isArray(input) || input.length > MAX_CUSTOM_ITEMS) {
        errors['customPlaces'] = 'Precisa ser um array de lugares personalizados'
        return []
    }
    const places = []
    const seenIds = new Set()
    for (const raw of input) {
        const name = sanitizeName(raw?.name)
        if (!Number.isInteger(raw?.id) || raw.id >= 0 || seenIds.has(raw.id) || !name) {
            errors['customPlaces'] = 'Lugar personalizado inválido (id negativo único e nome são obrigatórios)'
            return []
        }
        if (!Array.isArray(raw.rolesIds) || raw.rolesIds.length === 0 ||
            raw.rolesIds.some((id) => !Number.isInteger(id) || !validRolesIds.has(id))) {
            errors['customPlaces'] = 'Lugar personalizado precisa de cargos existentes'
            return []
        }
        const place = { id: raw.id, name, rolesIds: [...new Set(raw.rolesIds)], categoriesIds: [CUSTOM_CATEGORY_ID] }
        if (raw.imgPath !== undefined && raw.imgPath !== null && raw.imgPath !== '') {
            // Imagem de lugar personalizado é apenas um link; upload não é aceito.
            if (typeof raw.imgPath !== 'string' || raw.imgPath.length > MAX_IMAGE_URL_LENGTH ||
                !/^https?:\/\/\S+$/i.test(raw.imgPath.trim())) {
                errors['customPlaces'] = 'A imagem do lugar personalizado precisa ser um link http(s)'
                return []
            }
            place.imgPath = raw.imgPath.trim()
        }
        seenIds.add(raw.id)
        places.push(place)
    }
    return places
}

export default class Config {
    static async build() {
        const newOption = new this()
        newOption.selectedPlacesIds = (await getPlaces()).map((place) => (place.id))
        newOption.possiblePlacesIds = [...newOption.selectedPlacesIds]
        newOption.possibleRolesIds = (await getRoles()).map((role) => (role.id))
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
        this.customPlaces = []
        this.customRoles = []

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
        this.customPlaces = this._sanitizedCustomPlaces
        this.customRoles = this._sanitizedCustomRoles

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

        const customRoles = sanitizeCustomRoles(newConfig.customRoles, errors)
        const validRolesIds = new Set([...(this.possibleRolesIds ?? []), ...customRoles.map((role) => role.id)])
        const customPlaces = sanitizeCustomPlaces(newConfig.customPlaces, errors, validRolesIds)
        this._sanitizedCustomRoles = customRoles
        this._sanitizedCustomPlaces = customPlaces

        if (!Array.isArray(newConfig.selectedPlacesIds)) {
            errors['selectedPlacesIds'] = 'Precisa ser um array'
        } else if (newConfig.selectedPlacesIds.length < 2) {
            errors['selectedPlacesIds'] = 'Precisa ter pelo menos 2 lugares'
        } else {
            const validPlacesIds = new Set([...this.possiblePlacesIds, ...customPlaces.map((place) => place.id)])
            for (let id of newConfig.selectedPlacesIds) {
                if (!validPlacesIds.has(id)) {
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
            customPlaces: this.customPlaces,
            customRoles: this.customRoles,

            roundMaxTime: Math.round(this.roundMaxTime / 60)
        }
    }
}
