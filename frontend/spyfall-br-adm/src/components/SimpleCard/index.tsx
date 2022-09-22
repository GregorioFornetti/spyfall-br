import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'


interface SimpleCardProps {
    name: string,
    deleteFunction: () => void,
    updateFunction: () => void
}

export default function SimpleCard({name, deleteFunction, updateFunction}: SimpleCardProps) {
    return (
        <div>
            <Card>
                <Card.Header as="h5">{name}</Card.Header>
                <Card.Body>
                    <div className="d-grid gap-2">
                        <Button 
                            variant="primary"
                            size="sm"
                            onClick={updateFunction}
                        >
                            Atualizar
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={deleteFunction}
                        >
                            Deletar
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    )
}