

import Place from './PlaceInterface'
import Role from './RoleInterface'

export default interface ConfigInterface {
    nonSpyVictoryScore: number,
    nonSpyAcusatorScore: number,
    timeFinishedScore: number,
    wrongAcusationScore: number,
    correctPlaceScore: number,

    qntSelectedPlaces: number,
    selectedPlacesIds: number[],
    customPlaces?: Place[],
    customRoles?: Role[],

    roundMaxTime: number
}

export const defaultConfig: ConfigInterface = {
    nonSpyVictoryScore: 0,
    nonSpyAcusatorScore: 0,
    timeFinishedScore: 0,
    wrongAcusationScore: 0,
    correctPlaceScore: 0,

    qntSelectedPlaces: 1,
    selectedPlacesIds: [],
    customPlaces: [],
    customRoles: [],

    roundMaxTime: 5
}