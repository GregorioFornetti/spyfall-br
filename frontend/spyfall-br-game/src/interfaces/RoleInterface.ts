import LocalizedName from './LocalizedName'

export default interface RoleInterface {
    id: number,
    name: LocalizedName,
    hint?: LocalizedName
}