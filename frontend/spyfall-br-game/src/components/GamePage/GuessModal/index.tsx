import React from 'react';
import { Socket } from "socket.io-client";

import PlaceCard from '../../PlaceCard';
import Place from '../../../interfaces/PlaceInterface'
import Modal, { ActionButton } from '../../ui/Modal';
import { useTranslation } from 'react-i18next';
import { localizedName } from '../../../utils/localizedName';

interface GuessModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    places: Place[]
}

export default function GuessModal({show, setShow, socket, places}: GuessModalProps) {

    const { t, i18n } = useTranslation()
    const handleClose = () => setShow(false);

    return (
        <Modal
            show={show}
            title={t('game.guessLocation')}
            onClose={handleClose}
            wide
            footer={<ActionButton variant="secondary" onClick={handleClose}>{t('common.close')}</ActionButton>}
        >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {places
                .map((place) => (
                    <PlaceCard key={place.id}
                        imgURL={place.imgPath}
                        title={localizedName(place.name, i18n.language)}
                        type='option'
                        onClick={() => {
                            socket.emit('guess-place', place.id)
                            handleClose()
                        }}
                    />
                ))}
            </div>
        </Modal>
    );
}
