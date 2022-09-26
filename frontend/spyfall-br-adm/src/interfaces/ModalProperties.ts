
export default interface ModalProperties<ValueType> {
    show: boolean,
    currentValue: ValueType,
    type: "create"|"update"|"delete"
}