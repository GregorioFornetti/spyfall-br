
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TooltipIcon from '../../../TooltipIcon';
import { BsQuestionCircle } from 'react-icons/bs'
import Config from '../../../../interfaces/ConfigInterface';


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
        <Form.Group controlId={name}>
            <Form.Label>
                {labelText} <TooltipIcon Icon={BsQuestionCircle} tooltipText={tooltipText} />
            </Form.Label>
            {disabled ?
                <OverlayTrigger
                    overlay={<Tooltip>{disabledTooltipText}</Tooltip>}
                    placement='top'
                >
                    <Form.Control
                        onChange={(event) => setConfig({...config, [name]: parseInt(event.target.value)})}
                        value={config[name] as number}
                        name={name}
                        min={min} 
                        max={max} 
                        type="number" 
                        disabled={disabled}
                    />
                </OverlayTrigger>
                :
                <Form.Control
                    onChange={(event) => setConfig({...config, [name]: parseInt(event.target.value)})}
                    value={config[name] as number}
                    name={name}
                    min={min} 
                    max={max} 
                    type="number" 
                    disabled={disabled}
                />
            }
        </Form.Group>       
    );
}