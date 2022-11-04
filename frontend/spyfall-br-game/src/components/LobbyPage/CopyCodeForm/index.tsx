import { Button, Form, InputGroup } from "react-bootstrap"
import { FaRegCopy } from "react-icons/fa"
import { CopyToClipboard } from 'react-copy-to-clipboard'

interface CopyCodeFormInterface {
    title: string,
    copyValue: string
}

export default function CopyCodeForm({title, copyValue}: CopyCodeFormInterface) {
    return (
        <div style={{maxWidth: "350px", margin: "auto"}}>
            <Form.Group>
                <Form.Label as='h6'>{title}</Form.Label>
                <InputGroup className="mb-3">
                    <Form.Control
                        readOnly={true}
                        value={copyValue}
                    />
                    <CopyToClipboard text={copyValue}>
                        <Button variant="outline-secondary">
                            <FaRegCopy />
                        </Button>
                    </CopyToClipboard>
                </InputGroup>
            </Form.Group>
        </div>
    )
}