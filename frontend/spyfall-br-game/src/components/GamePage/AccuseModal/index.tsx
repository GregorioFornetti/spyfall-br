import React from 'react';
import { Socket } from "socket.io-client";

import Player from '../../../interfaces/PlayerInterface'
import PlayerCard from '../../PlayerCard';
import Modal, { ActionButton } from '../../ui/Modal';
import { useTranslation } from 'react-i18next';


interface AccuseModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    players: Player[],
    currentUserID: string
}

export default function AccuseModal({show, setShow, socket, players, currentUserID}: AccuseModalProps) {

    const { t } = useTranslation()
    const handleClose = () => setShow(false);

    return (
        <Modal
            show={show}
            title={t('game.accusePlayer')}
            onClose={handleClose}
            wide
            footer={<ActionButton variant="secondary" onClick={handleClose}>{t('common.close')}</ActionButton>}
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {players
                .filter((player) => player.id !== currentUserID)
                .map((player) => (
                    <PlayerCard
                        key={player.id}
                        username={player.username}
                        score={player.score}
                        onClick={() => {
                            socket.emit('accuse', player.id)
                            handleClose()
                        }}
                    />
                ))}
            </div>
        </Modal>
    );
}
