import { Socket } from "socket.io-client";

import Player from '../../../interfaces/PlayerInterface'
import PlayerCard from '../../PlayerCard'
import Timer from '../Timer';
import Modal, { ActionButton } from '../../ui/Modal';
import { useTranslation } from 'react-i18next';

interface VoteModalProps {
    show: boolean,
    socket: Socket,
    currentUserID: string,
    votationTime: number,
    players: Player[],
    accusedUserID?: string,
    accuserUserID?: string,
    agreedUsersIds: string[],
    desagreedUsersIds: string[]
}

export default function VoteModal({show, socket, currentUserID, players, accusedUserID, accuserUserID, agreedUsersIds, desagreedUsersIds, votationTime}: VoteModalProps) {

    const { t } = useTranslation()
    var accusedUsername = ''
    if (accusedUserID) {
        accusedUsername = (players.find((player) => player.id == accusedUserID) as Player).username
    }
    var accuserUsername = ''
    if (accuserUserID) {
        accuserUsername = (players.find((player) => player.id == accuserUserID) as Player).username
    }

    const disabled = (currentUserID === accusedUserID ||
                      currentUserID === accuserUserID ||
                      agreedUsersIds.includes(currentUserID) ||
                      desagreedUsersIds.includes(currentUserID))

    return (
        <Modal
            show={show}
            title={t('game.vote')}
            wide
            headerExtra={
                <>
                    <p className="mt-1 text-sm text-zinc-600">
                        <strong>{accuserUsername}</strong> {t('game.accusingConnector')} <strong>{accusedUsername}</strong>
                    </p>
                    <div className="mt-3">
                        <Timer time={votationTime} />
                    </div>
                </>
            }
            footer={
                <>
                    <ActionButton
                        onClick={() => socket.emit('vote', true)}
                        disabled={disabled}
                        className="flex-1 sm:flex-none"
                    >
                        {t('game.agree')}
                    </ActionButton>
                    <ActionButton
                        variant="danger"
                        onClick={() => socket.emit('vote', false)}
                        disabled={disabled}
                        className="flex-1 sm:flex-none"
                    >
                        {t('game.disagree')}
                    </ActionButton>
                </>
            }
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {players.map((player) => (
                    <PlayerCard
                        key={player.id}
                        username={player.username}
                        score={player.score}
                        agreed={agreedUsersIds.includes(player.id) || player.id === accuserUserID}
                        desagreed={desagreedUsersIds.includes(player.id)}
                        accused={player.id === accusedUserID}
                    />
                ))}
            </div>
        </Modal>
    );
}
