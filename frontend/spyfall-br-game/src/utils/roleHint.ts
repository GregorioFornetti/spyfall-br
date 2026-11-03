import Role from '../interfaces/RoleInterface'
import Place from '../interfaces/PlaceInterface'
import { localizedName } from './localizedName'

// Dica privada de atuação para o cargo do jogador: usa a dica cadastrada
// do cargo (campo opcional `hint`) ou gera uma a partir de cargo + lugar.
export function roleHintText(
    role: Role | undefined,
    place: Place | undefined,
    language: string,
    fallback: (roleName: string, placeName: string) => string
): string | null {
    if (!role) {
        return null
    }
    if (role.hint) {
        return localizedName(role.hint, language)
    }
    if (!place) {
        return null
    }
    return fallback(localizedName(role.name, language), localizedName(place.name, language))
}
