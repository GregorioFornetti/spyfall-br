import Card from 'react-bootstrap/Card'
import Container from 'react-bootstrap/Container'


interface RootContainerProps {
    title: string,
    children: JSX.Element|JSX.Element[]
}

export default function RootContainer({title, children}: RootContainerProps) {
    return (
        <Container>
            <Card>
                <Card.Header as="h3" className={'text-center'}>{title}</Card.Header>
                <Card.Body>
                    {children}
                </Card.Body>
            </Card>
        </Container>
    )
}