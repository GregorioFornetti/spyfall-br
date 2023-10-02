// Fonte: https://codesandbox.io/p/github/nswagg/MultiSelect-TS/csb-uov6l8/draft/long-snow?file=%2Fpages%2Findex.tsx%3A8%2C3-8%2C48

import { ActionMeta, Options } from 'react-select';
import { Dispatch, SetStateAction, useRef } from "react";

import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animate = makeAnimated();

interface Props {
  options: Option[]
  selected: Option[],
  setSelected: Dispatch<SetStateAction<any>>,
  title: string,
  onChange?: (newValue: unknown, actionMeta: ActionMeta<unknown>, selectAllOption: Option) => void,
  hide?: boolean,
  disabled?: boolean,
  disabledTooltipText?: string
}

export type Option = {
  value: number | string;
  label: string;
};

/* Advanced Dropdown Select Menu using React select
 * Inspired by https://stackoverflow.com/a/61250357/20007391 and 
 * added typing.
 * 
 * For more information about the react-select API, options, and 
 * customization, see https://react-select.com/home
 * 
 * This component is just the select box. Options are passed in from 
 * the parent and the parent maintains the state of the object for 
 * callbacks and function handling. */
export default function MultiSelect(props: Props) {
  // For component "memory"
  const valueRef = useRef(props.selected);
  valueRef.current = props.selected;
  
  const selectAllOption = {value: "*", label:"Tudo"};
  const isSelectAllSelected = () => (valueRef.current.length === props.options.length) && props.options.length > 1;
  const isOptionSelected = (option: Option, selectValue: Options<Option>) => 
    valueRef.current.some(({value}) => value === option.value) ||
    isSelectAllSelected();

  //const getOptions = () => isSelectAllSelected() ? [] : [selectAllOption, ...props.options];
  const getOptions = () => props.options.length > 1 ? [selectAllOption, ...props.options] : [...props.options];
  const getValue = () => isSelectAllSelected() ? [selectAllOption] : props.selected;

  const handleSelect = (newValue: unknown, actionMeta: ActionMeta<unknown>) => {
    const {action, option, removedValue} = actionMeta;
  
    // Reassigning for typing. Unknown by default
    const opt = option as Option;
    const removed = removedValue as Option;
    if (action === "select-option" && opt.value === selectAllOption.value) {
      props.setSelected(props.options);
    } else if ((action === "deselect-option" && opt.value === selectAllOption.value) || (action === "remove-value" && removed.value === selectAllOption.value)) {
      props.setSelected([]);
    } else if (actionMeta.action === "deselect-option" && isSelectAllSelected()) {
      props.setSelected(
        props.options.filter(({ value }) => value !== opt.value));
    } else {
      props.setSelected(newValue || []);
    }

    if (props.onChange) {
      props.onChange(newValue, actionMeta, selectAllOption);
    }
  }

  return (
    
      <Select
        isOptionSelected={isOptionSelected}
        closeMenuOnSelect={false}
        defaultValue={getOptions()} // Should default to select all option
        value={getValue()}
        isMulti
        //isSearchable
        //components={animate}
        placeholder={props.title}
        options={getOptions()}
        onChange={handleSelect}
        hideSelectedOptions={props.hide ?? false}
        instanceId={props.title}
        id={props.title}
        isDisabled={props.disabled}
      />
  )
}