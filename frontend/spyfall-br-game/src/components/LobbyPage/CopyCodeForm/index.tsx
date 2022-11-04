import { Button, Form, InputGroup } from "react-bootstrap"
import { FaRegCopy } from "react-icons/fa"

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
                    <Button variant="outline-secondary" onClick={() => {window.navigator.clipboard.writeText(copyValue)}}>
                        <FaRegCopy />
                    </Button>
                </InputGroup>
            </Form.Group>
        </div>
    )
}