import { Row } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'


interface RootContainerProps {
    title: string,
    children: JSX.Element[]|JSX.Element,
    rowClassName: string,
    containerClassName?: string
}

export default function RootContainer({title, children, rowClassName, containerClassName}: RootContainerProps) {
    return (
        <Container className={containerClassName}>
            <Card>
                <Card.Header as="h3" className={'text-center'}>{title}</Card.Header>
                <Card.Body>
                    <Container>
                        <Row className={rowClassName}>
                            {children}
                        </Row>
                    </Container>
                </Card.Body>
            </Card>
        </Container>
    )
}