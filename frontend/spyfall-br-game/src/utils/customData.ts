import Place from '../interfaces/PlaceInterface'
import Role from '../interfaces/RoleInterface'
import Category from '../interfaces/CategoryInterface'

// Lugares e cargos personalizados vivem só no navegador de quem os criou
// (localStorage). Para nunca colidirem com os ids do servidor (positivos),
// os ids personalizados são sempre negativos e todos eles pertencem à
// categoria sintética abaixo, que só existe no cliente e no payload da
// configuração da sala.
export const CUSTOM_CATEGORY_ID = -1

export const CUSTOM_CATEGORY: Category = {
    id: CUSTOM_CATEGORY_ID,
    name: { pt: 'Personalizados', en: 'Custom' }
}

export const CUSTOM_PLACES_KEY = 'spyfall.customPlaces.v1'
export const CUSTOM_ROLES_KEY = 'spyfall.customRoles.v1'

export function isCustomId(id: number): boolean {
    return Number.isInteger(id) && id < 0
}

// Imagem de lugar personalizado é somente um link: nenhum arquivo é
// enviado. Qualquer coisa fora de http(s) é recusada.
export function isValidImageUrl(value: string): boolean {
    const trimmed = value.trim()
    if (!trimmed || trimmed.length > 1000) {
        return false
    }
    try {
        const url = new URL(trimmed)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

export function nextCustomId(items: { id: number }[]): number {
    return items.reduce((min, item) => Math.min(min, item.id), 0) - 1
}

function isValidName(name: any): boolean {
    return !!name && typeof name.pt === 'string' && name.pt.trim().length > 0
}

function sanitizePlaces(raw: any): Place[] {
    if (!Array.isArray(raw)) {
        return []
    }
    return raw
        .filter((place) => place && isCustomId(place.id) && isValidName(place.name) && Array.isArray(place.rolesIds))
        .map((place) => {
            const clean: Place = {
                id: place.id,
                name: {
                    pt: place.name.pt.trim(),
                    en: (typeof place.name.en === 'string' && place.name.en.trim()) ? place.name.en.trim() : place.name.pt.trim()
                },
                rolesIds: place.rolesIds.filter((id: any) => Number.isInteger(id)),
                categoriesIds: [CUSTOM_CATEGORY_ID]
            }
            if (typeof place.imgPath === 'string' && isValidImageUrl(place.imgPath)) {
                clean.imgPath = place.imgPath.trim()
            }
            return clean
        })
}

function sanitizeRoles(raw: any): Role[] {
    if (!Array.isArray(raw)) {
        return []
    }
    return raw
        .filter((role) => role && isCustomId(role.id) && isValidName(role.name))
        .map((role) => ({
            id: role.id,
            name: {
                pt: role.name.pt.trim(),
                en: (typeof role.name.en === 'string' && role.name.en.trim()) ? role.name.en.trim() : role.name.pt.trim()
            }
        }))
}

function load<T>(key: string, sanitize: (raw: any) => T[]): T[] {
    try {
        const raw = window.localStorage.getItem(key)
        return raw ? sanitize(JSON.parse(raw)) : []
    } catch {
        return []
    }
}

function save(key: string, items: unknown[]): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(items))
    } catch {
        // localStorage cheio/indisponível: os personalizados só não persistem.
    }
}

export function loadCustomPlaces(): Place[] {
    return load(CUSTOM_PLACES_KEY, sanitizePlaces)
}

export function saveCustomPlaces(places: Place[]): void {
    save(CUSTOM_PLACES_KEY, places)
}

export function loadCustomRoles(): Role[] {
    return load(CUSTOM_ROLES_KEY, sanitizeRoles)
}

export function saveCustomRoles(roles: Role[]): void {
    save(CUSTOM_ROLES_KEY, roles)
}

// Junta duas listas por id, sem duplicar; itens de `extra` vencem em conflito.
export function mergeById<T extends { id: number }>(base: T[], extra: T[]): T[] {
    const byId = new Map<number, T>()
    for (const item of base) {
        byId.set(item.id, item)
    }
    for (const item of extra) {
        byId.set(item.id, item)
    }
    return Array.from(byId.values())
}
