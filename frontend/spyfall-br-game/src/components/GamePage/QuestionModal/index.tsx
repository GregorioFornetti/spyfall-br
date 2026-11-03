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
    previousAskingUserID: string|undefined,
    hints?: string[]
}

export default function QuestionModal({show, setShow, socket, players, previousAskingUserID, currentUserID, hints}: QuestionModalProps) {

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
            {hints && hints.length > 0 &&
                <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3">
                    <h5 className="text-sm font-semibold text-emerald-900">{t('game.questionHints')}</h5>
                    <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-emerald-900">
                        {hints.map((hint) => (
                            <li key={hint}>{hint}</li>
                        ))}
                    </ul>
                </div>
            }
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
