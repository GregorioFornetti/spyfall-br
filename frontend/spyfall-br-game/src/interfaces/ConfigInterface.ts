

export default interface ConfigInterface {
    nonSpyVictoryScore: number,
    nonSpyAcusatorScore: number,
    timeFinishedScore: number,
    wrongAcusationScore: number,
    correctPlaceScore: number,

    qntSelectedPlaces: number,
    selectedPlacesIds: number[],

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

    roundMaxTime: 5
}