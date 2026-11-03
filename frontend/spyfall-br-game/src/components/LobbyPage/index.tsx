import React, { useEffect, useState } from 'react';

import PlayerCard from "../PlayerCard";
import PlayersContainer from "../PlayersContainer";
import Player from '../../interfaces/PlayerInterface'
import { Socket } from "socket.io-client";
import ConfigModal from './ConfigModal';

import CopyCodeForm from './CopyCodeForm'
import Place from '../../interfaces/PlaceInterface';
import Role from '../../interfaces/RoleInterface';
import Category from '../../interfaces/CategoryInterface';
import Config from '../../interfaces/ConfigInterface';
import {
    CUSTOM_CATEGORY,
    loadCustomPlaces,
    loadCustomRoles,
    mergeById,
    nextCustomId,
    saveCustomPlaces,
    saveCustomRoles
} from '../../utils/customData';
import { ActionButton } from '../ui/Modal';
import { useTranslation } from 'react-i18next';

interface LobbyPageInterface {
    currentUserID: string,
    players: Player[],
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
    show?: boolean,
    gameCode: string,
    leaderUserID: string,
    socket: Socket,
    serverURL: string,
    places: Place[],
    categories: Category[],
    roles: Role[],
    config: Config,
    setConfig: React.Dispatch<React.SetStateAction<Config>>,
    onCustomDataChange: (places: Place[], roles: Role[]) => void
}

export default function LobbyPage({players, setPlayers, currentUserID, show, gameCode, leaderUserID, socket, serverURL, places, categories, roles, config, setConfig, onCustomDataChange}: LobbyPageInterface) {

    const { t } = useTranslation()
    const [showConfigModal, setShowConfigModal] = useState(false)

    // Lugares/cargos personalizados deste usuário: vivem no localStorage e
    // são sincronizados para o App, que os junta aos dados do servidor.
    const [customPlaces, setCustomPlaces] = useState<Place[]>(() => loadCustomPlaces())
    const [customRoles, setCustomRoles] = useState<Role[]>(() => loadCustomRoles())

    useEffect(() => {
        saveCustomPlaces(customPlaces)
        saveCustomRoles(customRoles)
        onCustomDataChange(customPlaces, customRoles)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customPlaces, customRoles])

    // O que a tela de configurações enxerga: banco + personalizados do líder
    // (vindos na configuração da sala) + personalizados deste usuário.
    const effectivePlaces = mergeById(mergeById(places, config.customPlaces ?? []), customPlaces)
    const effectiveRoles = mergeById(mergeById(roles, config.customRoles ?? []), customRoles)
    const effectiveCategories = categories.some((category) => category.id === CUSTOM_CATEGORY.id)
        ? categories
        : [...categories, CUSTOM_CATEGORY]

    const saveCustomPlace = (draft: Place, newRoleNames: string[]) => {
        let nextRoleId = nextCustomId(effectiveRoles)
        const createdRoles: Role[] = newRoleNames.map((name) => ({
            id: nextRoleId--,
            name: { pt: name, en: name }
        }))
        const allCustomRoles = [...customRoles, ...createdRoles]
        if (createdRoles.length > 0) {
            setCustomRoles(allCustomRoles)
        }

        const place: Place = {
            ...draft,
            rolesIds: [...draft.rolesIds, ...createdRoles.map((role) => role.id)]
        }
        if (place.id === 0) {
            place.id = nextCustomId(effectivePlaces)
            setCustomPlaces([...customPlaces, place])
            // Quem é líder já deixa o lugar novo selecionado para a partida.
            if (leaderUserID === currentUserID && !config.selectedPlacesIds.includes(place.id)) {
                setConfig({ ...config, selectedPlacesIds: [...config.selectedPlacesIds, place.id] })
            }
        } else {
            setCustomPlaces(customPlaces.map((customPlace) => customPlace.id === place.id ? place : customPlace))
        }
    }

    const deleteCustomPlace = (place: Place) => {
        setCustomPlaces(customPlaces.filter((customPlace) => customPlace.id !== place.id))
        if (config.selectedPlacesIds.includes(place.id)) {
            setConfig({ ...config, selectedPlacesIds: config.selectedPlacesIds.filter((id) => id !== place.id) })
        }
    }

    const deleteCustomRole = (role: Role) => {
        setCustomRoles(customRoles.filter((customRole) => customRole.id !== role.id))
        setCustomPlaces(customPlaces.map((place) => ({
            ...place,
            rolesIds: place.rolesIds.filter((roleId) => roleId !== role.id)
        })))
    }

    const currentPlayer = players.find((player) => player.id === currentUserID)
    const isCurrentPlayerReady = currentPlayer?.ready
    const isAllPlayersReady = players.every((player) => (player.ready || player.id === leaderUserID))
    const isLeader = leaderUserID === currentUserID
    const canStart = isLeader && isAllPlayersReady && players.length >= 3

    if (!show) {
        return null
    }

    return (
        <div>
            <div className="flex flex-col items-center gap-4">
                <CopyCodeForm title={t('lobby.roomCode')} copyValue={gameCode} />
                <CopyCodeForm title={t('lobby.roomLink')} copyValue={`${serverURL}${process.env.PUBLIC_URL}/${gameCode}`} />
            </div>

            <PlayersContainer title={t('lobby.players', { count: players.length })} containerClassName={'mt-8'}>
                {players.map((player) => (
                    <PlayerCard
                        key={player.id}
                        username={player.username}
                        leader={leaderUserID === player.id}
                        score={player.score}
                        ready={player.ready}
                        isCurrentUser={currentUserID === player.id}
                    />
                ))}
            </PlayersContainer>

            <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
                {isLeader &&
                    <ActionButton
                        onClick={() => (socket.emit('match-start'))}
                        disabled={!canStart}
                        className="w-full py-2.5"
                    >
                        {t('lobby.startMatch')}
                    </ActionButton>
                }
                {!isLeader && (
                    isCurrentPlayerReady ? (
                        <ActionButton
                            variant="danger"
                            className="w-full py-2.5"
                            onClick={() => {
                                socket.emit('player-unready', currentUserID)
                                if (currentPlayer) {
                                    currentPlayer.ready = false
                                    setPlayers([...players])
                                }
                            }}
                        >
                            {t('lobby.notReady')}
                        </ActionButton>
                    ) : (
                        <ActionButton
                            className="w-full py-2.5"
                            onClick={() => {
                                socket.emit('player-ready', currentUserID)
                                if (currentPlayer) {
                                    currentPlayer.ready = true
                                    setPlayers([...players])
                                }
                            }}
                        >
                            {t('lobby.ready')}
                        </ActionButton>
                    )
                )}
                <ActionButton
                    variant="dark"
                    className="w-full py-2.5"
                    onClick={() => setShowConfigModal(true)}
                >
                    {t('lobby.settings')}
                </ActionButton>
            </div>
            {isLeader && !canStart &&
                <p className="mt-3 text-center text-sm text-zinc-500" role="status">
                    {players.length < 3
                        ? t('lobby.waitingMorePlayers', { count: players.length })
                        : t('lobby.waitingReady')}
                </p>
            }

            <ConfigModal
                show={showConfigModal}
                setShow={setShowConfigModal}
                leaderUserID={leaderUserID}

                socket={socket}
                currentUserID={currentUserID}
                places={effectivePlaces}
                categories={effectiveCategories}
                roles={effectiveRoles}

                config={config}
                setConfig={setConfig}
                customPlaces={customPlaces}
                customRoles={customRoles}
                onSaveCustomPlace={saveCustomPlace}
                onDeleteCustomPlace={deleteCustomPlace}
                onDeleteCustomRole={deleteCustomRole}
            />
        </div>
    )
}
