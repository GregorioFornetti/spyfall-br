import React from 'react';
import { Form } from 'react-bootstrap';
import TooltipIcon from '../../../TooltipIcon';
import { BsQuestionCircle } from 'react-icons/bs'


interface NumberInputProps {
    name: string,
    tooltipText: string,
    labelText: string,
    min?: number,
    max?: number
}

export default function NumberInput({name, tooltipText, labelText, min, max}: NumberInputProps) {
    return (
        <Form.Group controlId={name}>
            <Form.Label>
                {labelText} <TooltipIcon Icon={BsQuestionCircle} tooltipText={tooltipText} />
            </Form.Label>
            <Form.Control min={min} max={max} name={name} type="number" defaultValue={1} />
        </Form.Group>       
    );
}