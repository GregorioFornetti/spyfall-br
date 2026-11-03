import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CreatableSelect from 'react-select/creatable'

import Place from '../../../../interfaces/PlaceInterface'
import Role from '../../../../interfaces/RoleInterface'
import Modal, { ActionButton, inputClass, labelClass } from '../../../ui/Modal'
import PlaceCard from '../../../PlaceCard'
import { localizedName } from '../../../../utils/localizedName'
import { CUSTOM_CATEGORY, CUSTOM_CATEGORY_ID, isValidImageUrl } from '../../../../utils/customData'

interface CustomPlaceModalProps {
    show: boolean,
    // null ao criar; o lugar (cópia) ao editar
    place: Place | null,
    roles: Role[],
    onClose: () => void,
    onSave: (draft: Place, newRoleNames: string[]) => void,
    onDelete?: (place: Place) => void
}

interface RoleOption {
    value: number | string,
    label: string,
    __isNew__?: boolean
}

// Interface espelhada no modal de lugares do admin: nomes PT/EN, imagem,
// cargos (selecionáveis ou criados na hora) e pré-visualização do cartão.
// A diferença: a imagem é apenas um link (URL) — não há envio de arquivo.
export default function CustomPlaceModal({ show, place, roles, onClose, onSave, onDelete }: CustomPlaceModalProps) {
    const { t, i18n } = useTranslation()
    const isEditing = place !== null

    const [namePt, setNamePt] = useState('')
    const [nameEn, setNameEn] = useState('')
    const [imgUrl, setImgUrl] = useState('')
    const [selectedRoles, setSelectedRoles] = useState<RoleOption[]>([])
    const [error, setError] = useState('')
    const [confirmingDelete, setConfirmingDelete] = useState(false)

    useEffect(() => {
        if (!show) {
            return
        }
        setNamePt(place?.name.pt ?? '')
        setNameEn(place?.name.en ?? '')
        setImgUrl(place?.imgPath ?? '')
        setSelectedRoles(
            (place?.rolesIds ?? [])
                .map((roleId) => roles.find((role) => role.id === roleId))
                .filter((role): role is Role => !!role)
                .map((role) => ({ value: role.id, label: localizedName(role.name, i18n.language) }))
        )
        setError('')
        setConfirmingDelete(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, place])

    if (!show) {
        return null
    }

    const previewName = { pt: namePt.trim(), en: nameEn.trim() || namePt.trim() }
    const trimmedImgUrl = imgUrl.trim()
    const previewImgUrl = trimmedImgUrl && isValidImageUrl(trimmedImgUrl) ? trimmedImgUrl : undefined

    const handleSubmit = () => {
        if (!namePt.trim()) {
            setError(t('config.custom.nameRequired'))
            return
        }
        if (trimmedImgUrl && !isValidImageUrl(trimmedImgUrl)) {
            setError(t('config.custom.imageInvalid'))
            return
        }
        const existingRoleIds = selectedRoles
            .filter((option) => !option.__isNew__)
            .map((option) => Number(option.value))
        const newRoleNames = selectedRoles
            .filter((option) => option.__isNew__)
            .map((option) => option.label.trim())
            .filter(Boolean)
        if (existingRoleIds.length === 0 && newRoleNames.length === 0) {
            setError(t('config.custom.rolesRequired'))
            return
        }

        const draft: Place = {
            id: place?.id ?? 0,
            name: previewName,
            rolesIds: existingRoleIds,
            categoriesIds: [CUSTOM_CATEGORY_ID]
        }
        if (trimmedImgUrl) {
            draft.imgPath = trimmedImgUrl
        }
        onSave(draft, newRoleNames)
    }

    return (
        <Modal
            show={show}
            title={isEditing ? t('config.custom.modalEdit') : t('config.custom.modalCreate')}
            onClose={onClose}
            footer={
                confirmingDelete ? (
                    <>
                        <ActionButton variant="secondary" onClick={() => setConfirmingDelete(false)}>
                            {t('config.custom.cancelDelete')}
                        </ActionButton>
                        <ActionButton
                            variant="danger"
                            onClick={() => place && onDelete && onDelete(place)}
                        >
                            {t('config.custom.deletePlace')}
                        </ActionButton>
                    </>
                ) : (
                    <>
                        {isEditing && onDelete && (
                            <ActionButton variant="danger" onClick={() => setConfirmingDelete(true)}>
                                {t('config.custom.delete')}
                            </ActionButton>
                        )}
                        <ActionButton variant="secondary" onClick={onClose}>
                            {t('common.close')}
                        </ActionButton>
                        <ActionButton onClick={handleSubmit}>
                            {isEditing ? t('config.custom.savePlace') : t('config.custom.create')}
                        </ActionButton>
                    </>
                )
            }
        >
            {confirmingDelete ? (
                <p className="text-sm text-zinc-600">
                    {t('config.custom.deleteConfirm', { name: localizedName(place?.name, i18n.language) })}
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="custom-place-name-pt" className={labelClass}>{t('config.custom.namePt')}</label>
                        <input
                            id="custom-place-name-pt"
                            className={inputClass}
                            type="text"
                            value={namePt}
                            onChange={(event) => setNamePt(event.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="custom-place-name-en" className={labelClass}>{t('config.custom.nameEn')}</label>
                        <input
                            id="custom-place-name-en"
                            className={inputClass}
                            type="text"
                            value={nameEn}
                            onChange={(event) => setNameEn(event.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="custom-place-image" className={labelClass}>{t('config.custom.imageLink')}</label>
                        <input
                            id="custom-place-image"
                            className={inputClass}
                            type="url"
                            placeholder="https://…"
                            value={imgUrl}
                            onChange={(event) => setImgUrl(event.target.value)}
                        />
                        <p className="mt-1.5 text-xs text-zinc-500">{t('config.custom.imageHelp')}</p>
                    </div>

                    <div>
                        <label htmlFor="custom-place-roles" className={labelClass}>{t('config.custom.roles')}</label>
                        <CreatableSelect
                            inputId="custom-place-roles"
                            isMulti
                            options={roles.map((role) => ({ value: role.id, label: localizedName(role.name, i18n.language) }))}
                            value={selectedRoles}
                            onChange={(options) => setSelectedRoles([...options] as RoleOption[])}
                            placeholder=""
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                            menuPosition="fixed"
                            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                        />
                        <p className="mt-1.5 text-xs text-zinc-500">{t('config.custom.rolesHelp')}</p>
                    </div>

                    <div>
                        <span className={labelClass}>{t('config.custom.categoryLabel')}</span>
                        <span className="inline-block rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">
                            {localizedName(CUSTOM_CATEGORY.name, i18n.language)}
                        </span>
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-700" role="alert">{error}</p>
                    )}

                    <hr className="border-zinc-200" />

                    <div>
                        <span className={labelClass}>{t('config.custom.preview')}</span>
                        <PlaceCard
                            type="selected"
                            title={localizedName(previewName, i18n.language) || '…'}
                            imgURL={previewImgUrl}
                        />
                    </div>
                </div>
            )}
        </Modal>
    )
}
