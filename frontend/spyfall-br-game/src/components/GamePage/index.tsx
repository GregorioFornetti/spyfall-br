import { useEffect } from 'react';
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
import Modal, { ActionButton } from '../ui/Modal';
import { useTranslation } from 'react-i18next';
import { localizedName } from '../../utils/localizedName';
import { alertMyTurn, playTickSound, requestNotificationPermission, notifyVoteOpened, notifyBrowser } from '../../utils/alerts';
import { questionHintsFor } from '../../utils/questionHints';
import { roleHintText } from '../../utils/roleHint';
import { useState } from 'react';


export interface QuestionLogEntry {
    askingUserID: string,
    targetUserID: string
}

export interface ExtensionVote {
    proposerUserID: string,
    agreedUsersIds: string[],
    disagreedUsersIds: string[]
}

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
    round: number,
    questionLog: QuestionLogEntry[],
    extensionUsed: boolean,
    extensionVote: ExtensionVote | null,
    socket: Socket
}


export default function GamePage({show, isSpy, selectedPlace, playerRole, possiblePlaces, players, currentUserID, leaderUserID, askingUserID, targetUserID, inVotation, previousAskingUserID, accusedUserID, accuserUserID, agreedUsersIds, desagreedUsersIds, socket, matchTime, votationTime, round, questionLog, extensionUsed, extensionVote}: GamePageProps) {

    const { t, i18n } = useTranslation()
    const [showAccuseModal, setShowAccuseModal] = useState(false)
    const [showGuessModal, setShowGuessModal] = useState(false)
    const [showQuestionModal, setShowQuestionModal] = useState(false)
    const myTurn = currentUserID === askingUserID && !targetUserID
    const playerName = (userID?: string) => players.find((p) => p.id === userID)?.username ?? t('game.otherPlayer')
    const hintText = (!isSpy) ? roleHintText(playerRole, selectedPlace, i18n.language, (role, place) => t('game.roleHintFallback', { role, place })) : null
    const hints = questionHintsFor(i18n.language, questionLog.length)

    // Alerta de turno: som + vibração quando chega a minha vez de questionar
    // (e notificação se a aba estiver escondida).
    useEffect(() => {
        if (show && myTurn) {
            alertMyTurn()
            if (document.hidden) {
                notifyBrowser(t('game.yourTurnNotify'), '')
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myTurn, askingUserID, show])

    // Notificação do navegador quando uma votação de acusação abre.
    useEffect(() => {
        if (show && inVotation) {
            notifyVoteOpened(
                t('game.voteNotifyTitle'),
                `${playerName(accuserUserID)} → ${playerName(accusedUserID)}`
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inVotation, show])

    // Tic-tac nos últimos 10 segundos da rodada.
    useEffect(() => {
        if (show && matchTime > 0 && matchTime <= 10) {
            playTickSound()
        }
    }, [matchTime, show])

    useEffect(() => {
        if (show) {
            requestNotificationPermission()
        }
    }, [show])

    if (!show) {
        return null
    }

    const extensionVoted = extensionVote
        ? (extensionVote.agreedUsersIds.includes(currentUserID) || extensionVote.disagreedUsersIds.includes(currentUserID))
        : false

    return (
        <>
          <div>
            {round > 0 &&
              <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-zinc-500">{t('game.round', { round })}</p>
            }
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
                  {hintText &&
                    <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-900">
                        <span className="font-semibold">{t('game.roleHintLabel')}:</span> {hintText}
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
            <div className="mx-auto mt-3 max-w-xl">
                <ActionButton
                  variant="secondary"
                  className="w-full"
                  disabled={extensionUsed || !!extensionVote || inVotation}
                  onClick={() => socket.emit('request-extension')}
                >
                  {extensionUsed ? t('game.extendUsed') : t('game.extendTime')}
                </ActionButton>
            </div>
            <p className="mt-3 text-center text-sm text-zinc-500" role="status">
                {myTurn
                    ? t('game.yourTurn')
                    : targetUserID
                        ? t('game.questioningInProgress')
                        : t('game.turnOf', { name: playerName(askingUserID) })}
            </p>

            {myTurn &&
              <section className="mx-auto mt-4 max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <h5 className="text-sm font-semibold text-emerald-900">{t('game.questionHints')}</h5>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-emerald-900">
                  {hints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              </section>
            }

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

            <section className="mx-auto mt-8 max-w-xl">
              <h4 className="text-center text-lg font-semibold text-zinc-900">{t('game.questionLog')}</h4>
              {questionLog.length === 0 ? (
                <p className="mt-2 text-center text-sm text-zinc-500">{t('game.logEmpty')}</p>
              ) : (
                <ol className="mt-3 space-y-1.5">
                  {questionLog.map((entry, index) => (
                    <li key={index} className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 shadow-sm">
                      <span className="font-medium text-zinc-900">{playerName(entry.askingUserID)}</span>
                      {' → '}
                      <span className="font-medium text-zinc-900">{playerName(entry.targetUserID)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

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

          <Modal
            show={!!extensionVote}
            title={t('game.extensionTitle')}
            wide
            footer={
                <>
                    <ActionButton onClick={() => socket.emit('extension-vote', true)} disabled={extensionVoted} className="flex-1 sm:flex-none">
                        {t('game.agree')}
                    </ActionButton>
                    <ActionButton variant="danger" onClick={() => socket.emit('extension-vote', false)} disabled={extensionVoted} className="flex-1 sm:flex-none">
                        {t('game.disagree')}
                    </ActionButton>
                </>
            }
          >
            <p className="text-sm text-zinc-600">
                {t('game.extensionAsk', { name: playerName(extensionVote?.proposerUserID) })}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {players.map((player) => (
                    <PlayerCard
                        key={player.id}
                        username={player.username}
                        score={player.score}
                        agreed={extensionVote?.agreedUsersIds.includes(player.id)}
                        desagreed={extensionVote?.disagreedUsersIds.includes(player.id)}
                    />
                ))}
            </div>
          </Modal>

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
            hints={hints}
          />
        </>
      );
}
