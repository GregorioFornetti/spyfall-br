import React, { useEffect, useState } from 'react';
import { Socket } from "socket.io-client";
import NumberInput from './NumberInput';
import InputsContainer from './InputsContainer';
import Place from '../../../interfaces/PlaceInterface';
import Category from '../../../interfaces/CategoryInterface';
import Config from '../../../interfaces/ConfigInterface';
import PlaceSelector from './PlacesSelector';
import CustomPlaceModal from './CustomPlaceModal';
import Modal, { ActionButton, Spinner } from '../../ui/Modal';
import Role from '../../../interfaces/RoleInterface';
import { localizedName } from '../../../utils/localizedName';
import { useTranslation } from 'react-i18next';


interface ConfigModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>,
    socket: Socket,
    currentUserID: string,
    leaderUserID: string,
    places: Place[],
    categories: Category[],
    roles: Role[],
    config: Config,
    setConfig: React.Dispatch<React.SetStateAction<Config>>,
    customPlaces: Place[],
    customRoles: Role[],
    onSaveCustomPlace: (draft: Place, newRoleNames: string[]) => void,
    onDeleteCustomPlace: (place: Place) => void,
    onDeleteCustomRole: (role: Role) => void
}

export default function ConfigModal({show, setShow, socket, currentUserID, leaderUserID, places, categories, roles, config, setConfig, customPlaces, customRoles, onSaveCustomPlace, onDeleteCustomPlace, onDeleteCustomRole}: ConfigModalProps) {

    const { t, i18n } = useTranslation()
    const [loading, setLoading] = useState(false);
    const [customPlaceModal, setCustomPlaceModal] = useState<{ show: boolean, place: Place | null }>({ show: false, place: null })
    const handleClose = () => setShow(false);
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (config.selectedPlacesIds.length < 2) {
            alert(t('config.selectAtLeast2'))
            return
        }
        // Junto da configuração vão as definições dos lugares personalizados
        // do líder que estão selecionados (e os cargos usados por eles): é
        // assim que o servidor e os outros jogadores conhecem esses lugares.
        const selectedCustomPlaces = customPlaces.filter((place) => config.selectedPlacesIds.includes(place.id))
        const usedRoleIds = new Set(selectedCustomPlaces.flatMap((place) => place.rolesIds))
        const payload = {
            ...config,
            customPlaces: selectedCustomPlaces,
            customRoles: customRoles.filter((role) => usedRoleIds.has(role.id))
        }
        socket.emit('set-new-config', payload)
        setLoading(true)
    }

    useEffect(() => {
        socket.on('config-success', () => {
            alert(t('config.saved'))
            setLoading(false)
        })

        socket.on('config-error', (error: any) => {
            alert(t('config.saveError'))
            console.log(error)
            setLoading(false)
        })
    }, [])

    const onlyLeader = t('config.onlyLeader')
    const isNotLeader = leaderUserID !== currentUserID

    return (
        <>
        <Modal
            show={show}
            title={t('config.title')}
            onClose={loading ? undefined : handleClose}
            wide
            footer={
                <>
                    <ActionButton variant="secondary" disabled={loading} onClick={handleClose}>
                        {t('common.close')}
                    </ActionButton>
                    <ActionButton type="submit" form="config-form" disabled={loading || isNotLeader}>
                        {t('config.save')}
                    </ActionButton>
                </>
            }
        >
            <form id="config-form" onSubmit={handleSubmit}>
                {loading
                ?
                <Spinner />
                :
                <>
                <InputsContainer title={t('config.scoreSettings')}>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <NumberInput
                            name='nonSpyVictoryScore'
                            tooltipText={t('config.fields.nonSpyVictory.tooltip')}
                            labelText={t('config.fields.nonSpyVictory.label')}
                            config={config}
                            setConfig={setConfig}
                            min={0}
                            disabled={isNotLeader}
                            disabledTooltipText={onlyLeader}
                        />
                        <NumberInput
                            name='nonSpyAcusatorScore'
                            tooltipText={t('config.fields.nonSpyAccuser.tooltip')}
                            labelText={t('config.fields.nonSpyAccuser.label')}
                            config={config}
                            setConfig={setConfig}
                            min={0}
                            disabled={isNotLeader}
                            disabledTooltipText={onlyLeader}
                        />
                        <NumberInput
                            name='timeFinishedScore'
                            tooltipText={t('config.fields.timeFinished.tooltip')}
                            labelText={t('config.fields.timeFinished.label')}
                            config={config}
                            setConfig={setConfig}
                            min={0}
                            disabled={isNotLeader}
                            disabledTooltipText={onlyLeader}
                        />
                        <NumberInput
                            name='wrongAcusationScore'
                            tooltipText={t('config.fields.wrongAccusation.tooltip')}
                            labelText={t('config.fields.wrongAccusation.label')}
                            config={config}
                            setConfig={setConfig}
                            min={0}
                            disabled={isNotLeader}
                            disabledTooltipText={onlyLeader}
                        />
                        <NumberInput
                            name='correctPlaceScore'
                            tooltipText={t('config.fields.correctPlace.tooltip')}
                            labelText={t('config.fields.correctPlace.label')}
                            config={config}
                            setConfig={setConfig}
                            min={0}
                            disabled={isNotLeader}
                            disabledTooltipText={onlyLeader}
                        />
                    </div>
                </InputsContainer>

                <InputsContainer title={t('config.placeSettings')}>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <NumberInput
                            name='qntSelectedPlaces'
                            tooltipText={t('config.fields.placesCount.tooltip')}
                            labelText={t('config.fields.placesCount.label')}
                            config={config}
                            setConfig={setConfig}
                            min={1}
                            disabled={isNotLeader}
                            disabledTooltipText={onlyLeader}
                        />
                    </div>

                    <PlaceSelector
                        categories={categories}
                        places={places}
                        config={config}
                        setConfig={setConfig}
                        disabled={isNotLeader}
                    />

                    <div className="mt-6 border-t border-zinc-200 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h5 className="text-base font-semibold text-zinc-900">{t('config.custom.title')}</h5>
                            <ActionButton variant="dark" onClick={() => setCustomPlaceModal({ show: true, place: null })}>
                                {t('config.custom.newPlace')}
                            </ActionButton>
                        </div>
                        <p className="mt-2 text-sm text-zinc-600">{t('config.custom.description')}</p>

                        {customPlaces.length === 0 ? (
                            <p className="mt-3 text-sm text-zinc-500">{t('config.custom.empty')}</p>
                        ) : (
                            <ul className="mt-3 divide-y divide-zinc-200 rounded-xl border border-zinc-200">
                                {customPlaces.map((place) => (
                                    <li key={place.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5">
                                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-900">
                                            {localizedName(place.name, i18n.language)}
                                        </span>
                                        <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                            {t('config.custom.category')}
                                        </span>
                                        <button
                                            type="button"
                                            className="text-sm font-medium text-emerald-800 hover:underline"
                                            onClick={() => setCustomPlaceModal({ show: true, place: { ...place } })}
                                        >
                                            {t('config.custom.edit')}
                                        </button>
                                        <button
                                            type="button"
                                            className="text-sm font-medium text-red-700 hover:underline"
                                            onClick={() => onDeleteCustomPlace(place)}
                                        >
                                            {t('config.custom.delete')}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {customRoles.length > 0 && (
                            <div className="mt-4">
                                <h6 className="text-sm font-semibold text-zinc-900">{t('config.custom.rolesTitle')}</h6>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {customRoles.map((role) => (
                                        <span key={role.id} className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                                            {localizedName(role.name, i18n.language)}
                                            <button
                                                type="button"
                                                aria-label={`${t('config.custom.delete')} ${localizedName(role.name, i18n.language)}`}
                                                className="font-bold text-red-700 hover:text-red-900"
                                                onClick={() => onDeleteCustomRole(role)}
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="mt-3 text-xs text-zinc-500">{t('config.custom.leaderNote')}</p>
                    </div>
                </InputsContainer>

                <InputsContainer title={t('config.timeSettings')}>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <NumberInput
                            name='roundMaxTime'
                            tooltipText={t('config.fields.roundMaxTime.tooltip')}
                            labelText={t('config.fields.roundMaxTime.label')}
                            config={config}
                            setConfig={setConfig}
                            min={1}
                            max={60}
                            disabled={isNotLeader}
                            disabledTooltipText={onlyLeader}
                        />
                    </div>
                </InputsContainer>
                </>
                }
            </form>
        </Modal>

        <CustomPlaceModal
            show={customPlaceModal.show}
            place={customPlaceModal.place}
            roles={roles}
            onClose={() => setCustomPlaceModal({ show: false, place: null })}
            onSave={(draft, newRoleNames) => {
                onSaveCustomPlace(draft, newRoleNames)
                setCustomPlaceModal({ show: false, place: null })
            }}
            onDelete={(place) => {
                onDeleteCustomPlace(place)
                setCustomPlaceModal({ show: false, place: null })
            }}
        />
        </>
    );
}
