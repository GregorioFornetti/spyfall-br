import React from 'react';
import { Socket } from "socket.io-client";

import Player from '../../../interfaces/PlayerInterface'
import PlayerCard from '../../PlayerCard'
import Modal, { ActionButton } from '../../ui/Modal';
import { useTranslation } from 'react-i18next';

interface QuestionModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    players: Player[],
    currentUserID: string,
    previousAskingUserID: string|undefined
}

export default function QuestionModal({show, setShow, socket, players, previousAskingUserID, currentUserID}: QuestionModalProps) {

    const { t } = useTranslation()
    const handleClose = () => setShow(false);

    return (
        <Modal
            show={show}
            title={t('game.questionPlayer')}
            onClose={handleClose}
            wide
            footer={<ActionButton variant="secondary" onClick={handleClose}>{t('common.close')}</ActionButton>}
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {players
                .filter((player) => player.id !== currentUserID && player.id !== previousAskingUserID)
                .map((player) => (
                    <PlayerCard
                        key={player.id}
                        username={player.username}
                        score={player.score}
                        onClick={() => {
                            socket.emit('new-questioning', player.id)
                            handleClose()
                        }}
                    />
                ))}
            </div>
        </Modal>
    );
}
