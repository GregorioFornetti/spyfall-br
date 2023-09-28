

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
    selectedPlacesIds: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],

    roundMaxTime: 5
}