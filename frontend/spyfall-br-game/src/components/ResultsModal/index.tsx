import React from 'react';

import Place from '../../interfaces/PlaceInterface'
import Player from '../../interfaces/PlayerInterface'
import PlaceCard from '../PlaceCard';
import PlayerCard from '../PlayerCard'
import Modal, { ActionButton } from '../ui/Modal';
import { useTranslation } from 'react-i18next';
import { translateServerMessage } from '../../i18n';
import { localizedName } from '../../utils/localizedName';


interface ResultsModalInterface {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    winner?: "spy"|"agents",
    winDescripton?: string,
    selectedPlace?: Place,
    round?: number,
    isLeader?: boolean,
    onNextRound?: () => void,
    spy?: Player
}

export default function ResultsModal({show, setShow, winner, winDescripton, selectedPlace, spy, round, isLeader, onNextRound}: ResultsModalInterface) {
    const { t, i18n } = useTranslation()
    const handleClose = () => setShow(false);

    let winText = ''
    if (winner) {
        winText = (winner === 'spy') ? t('results.spyWon') : t('results.agentsWon')
    }

    return (
        <Modal
            show={show}
            title={t('results.title')}
            onClose={handleClose}
            footer={<>
                {isLeader && onNextRound && <ActionButton onClick={() => { handleClose(); onNextRound() }}>{t('results.nextRound')}</ActionButton>}
                <ActionButton variant="secondary" onClick={handleClose}>{t('common.close')}</ActionButton>
            </>}
        >
            <div className="flex flex-col gap-8 text-center">
                <div>
                    <h3 className={`font-display text-3xl font-bold ${winner === 'spy' ? 'text-red-700' : 'text-emerald-700'}`}>
                        {winText}
                    </h3>
                    {round ? <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-zinc-400">{t('game.round', { round })}</p> : null}
                    {!isLeader && <p className="mt-1 text-sm text-zinc-500">{t('results.waitingLeader')}</p>}
                    <p className="mt-1 text-lg text-zinc-600">
                        {winDescripton ? translateServerMessage(winDescripton) : winDescripton}
                    </p>
                </div>
                <div>
                    <h4 className="mb-3 text-lg font-semibold">{t('results.selectedPlaceWas')}</h4>
                    {(selectedPlace) &&
                        <PlaceCard
                            title={localizedName(selectedPlace.name, i18n.language)}
                            imgURL={selectedPlace.imgPath}
                            type='selected'
                        />
                    }
                </div>
                <div>
                    <h4 className="mb-3 text-lg font-semibold">{t('results.spyWas')}</h4>
                    {(spy) &&
                        <PlayerCard
                            username={spy.username}
                            score={spy.score}
                        />
                    }
                </div>
            </div>
        </Modal>
    );
}
