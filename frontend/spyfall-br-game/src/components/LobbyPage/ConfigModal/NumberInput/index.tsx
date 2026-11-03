import TooltipIcon from '../../../TooltipIcon';
import { BsQuestionCircle } from 'react-icons/bs'
import Config from '../../../../interfaces/ConfigInterface';
import { inputClass, labelClass } from '../../../ui/Modal';


interface NumberInputProps {
    name: keyof Config,
    tooltipText: string,
    labelText: string,
    config: Config,
    setConfig: React.Dispatch<React.SetStateAction<Config>>,
    min?: number,
    max?: number,
    disabled?: boolean,
    disabledTooltipText?: string
}

export default function NumberInput({name, tooltipText, labelText, config, setConfig, min, max, disabled, disabledTooltipText}: NumberInputProps) {
    return (
        <div>
            <label htmlFor={name} className={labelClass}>
                {labelText} <TooltipIcon Icon={BsQuestionCircle} tooltipText={tooltipText} />
            </label>
            <input
                id={name}
                className={inputClass}
                onChange={(event) => setConfig({...config, [name]: parseInt(event.target.value)})}
                value={config[name] as number}
                name={name}
                min={min}
                max={max}
                type="number"
                disabled={disabled}
                title={disabled ? disabledTooltipText : undefined}
            />
        </div>
    );
}
