import { useState } from 'react';
import { Socket } from "socket.io-client";

import PlayerCard from '../PlayerCard';
import UsersContainer from '../PlayersContainer'
import PlacesContainer from '../PlacesContainer';
import PlaceCard from '../PlaceCard';

import Place from '../../interfaces/PlaceInterface'
import Player from '../../interfaces/PlayerInterface'
import Role from '../../interfaces/RoleInterface'
import AccuseModal from './AccuseModal';
import VoteModal from './VoteModal';
import GuessModal from './GuessModal';
import QuestionModal from './QuestionModal';
import Timer from './Timer';
import { ActionButton } from '../ui/Modal';
import { useTranslation } from 'react-i18next';
import { localizedName } from '../../utils/localizedName';



interface GamePageProps {
    show?: boolean,
    isSpy?: boolean,
    selectedPlace?: Place,
    playerRole?: Role,
    matchTime: number,
    votationTime: number,
    possiblePlaces: Place[],
    players: Player[],
    currentUserID: string,
    leaderUserID: string,
    askingUserID: string,
    targetUserID?: string,
    previousAskingUserID?: string,
    inVotation: boolean,
    accusedUserID?: string,
    accuserUserID?: string,
    agreedUsersIds: string[],
    desagreedUsersIds: string[],
    socket: Socket
}


export default function GamePage({show, isSpy, selectedPlace, playerRole, possiblePlaces, players, currentUserID, leaderUserID, askingUserID, targetUserID, inVotation, previousAskingUserID, accusedUserID, accuserUserID, agreedUsersIds, desagreedUsersIds, socket, matchTime, votationTime}: GamePageProps) {

    const { t, i18n } = useTranslation()
    const [showAccuseModal, setShowAccuseModal] = useState(false)
    const [showGuessModal, setShowGuessModal] = useState(false)
    const [showQuestionModal, setShowQuestionModal] = useState(false)
    const myTurn = currentUserID === askingUserID && !targetUserID

    if (!show) {
        return null
    }

    return (
        <>
          <div>
            <div className="mb-6 flex justify-center">
              <Timer time={matchTime} />
            </div>

            <section className={`mx-auto max-w-[340px] overflow-hidden rounded-xl border shadow-sm ${isSpy ? 'border-red-300 bg-red-50' : 'border-zinc-200 bg-white'}`}>
                <h4 className={`border-b px-4 py-3 text-center text-xl font-semibold ${isSpy ? 'border-red-200 text-red-800' : 'border-zinc-200'}`}>
                    {(!isSpy) ? t('game.selectedPlace') : t('game.youAreSpy')}
                </h4>
                <div className="p-4">
                  <PlaceCard
                    title={(selectedPlace) ? localizedName(selectedPlace.name, i18n.language) : t('game.spy')}
                    type='selected'
                    imgURL={(selectedPlace) ? (selectedPlace.imgPath) : (undefined)}
                  />
                  {playerRole &&
                    <p className="mt-3 text-center text-lg">
                        {t('game.role')}: <strong>{localizedName(playerRole.name, i18n.language)}</strong>
                    </p>
                  }
                  {isSpy &&
                    <p className="mt-2 text-center text-sm text-red-700">
                        {t('game.spyHint')}
                    </p>
                  }
                </div>
            </section>


            <div className="mx-auto mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
                <ActionButton variant="dark" className="w-full" onClick={() => setShowAccuseModal(true)}>
                  {t('game.accuse')}
                </ActionButton>
                <ActionButton className="w-full" onClick={() => setShowQuestionModal(true)} disabled={!myTurn}>
                  {t('game.question')}
                </ActionButton>
                <ActionButton variant="danger" className="w-full" onClick={() => setShowGuessModal(true)} disabled={!isSpy}>
                  {t('game.guessPlace')}
                </ActionButton>
            </div>
            <p className="mt-3 text-center text-sm text-zinc-500" role="status">
                {myTurn
                    ? t('game.yourTurn')
                    : targetUserID
                        ? t('game.questioningInProgress')
                        : t('game.turnOf', { name: players.find((p) => p.id === askingUserID)?.username ?? t('game.otherPlayer') })}
            </p>

            <UsersContainer title={t('game.players')} containerClassName='mt-8'>
              {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    username={player.username}
                    leader={player.id === leaderUserID}
                    score={player.score}
                    isCurrentUser={player.id === currentUserID}
                    asking={player.id === askingUserID}
                    target={player.id === targetUserID}
                    inGame
                  />
              ))}
            </UsersContainer>

            <PlacesContainer title={t('game.possiblePlaces')} containerClassName='mt-8'>
              {possiblePlaces.map((place) => (
                  <PlaceCard key={place.id} title={localizedName(place.name, i18n.language)} imgURL={place.imgPath} type={'markable'} />
              ))}
            </PlacesContainer>
          </div>

          {(askingUserID === currentUserID) &&
          <footer className="fixed inset-x-0 bottom-0 z-40 bg-zinc-900 py-3 text-center shadow-[0_-2px_10px_rgba(0,0,0,0.25)]">
            {!targetUserID ? (
              <button type="button" className="text-base font-medium text-emerald-300 underline-offset-4 hover:underline" onClick={() => setShowQuestionModal(true)}>
                {t('game.yourTurnFooter')}
              </button>
            ) : (
              <button type="button" className="text-base font-medium text-emerald-300 underline-offset-4 hover:underline" onClick={() => socket.emit('end-questioning')}>
                {t('game.endQuestioning')}
              </button>
            )}
          </footer>
          }

          <AccuseModal
            show={showAccuseModal}
            setShow={setShowAccuseModal}
            socket={socket}

            players={players}
            currentUserID={currentUserID}
          />

          <VoteModal
            show={inVotation}
            socket={socket}

            votationTime={votationTime}
            currentUserID={currentUserID}
            players={players}
            accusedUserID={accusedUserID}
            accuserUserID={accuserUserID}
            agreedUsersIds={agreedUsersIds}
            desagreedUsersIds={desagreedUsersIds}
          />

          <GuessModal
            show={showGuessModal}
            setShow={setShowGuessModal}
            socket={socket}

            places={possiblePlaces}
          />

          <QuestionModal
            show={showQuestionModal}
            setShow={setShowQuestionModal}
            socket={socket}

            players={players}
            currentUserID={currentUserID}
            previousAskingUserID={previousAskingUserID}
          />
        </>
      );
}
