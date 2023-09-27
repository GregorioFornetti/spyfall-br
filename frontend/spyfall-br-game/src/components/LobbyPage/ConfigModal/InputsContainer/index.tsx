import { Container, Row } from 'react-bootstrap';

interface InputsContainerProps {
    title: string,
    children: JSX.Element[]|JSX.Element
}

export default function InputsContainer({title, children}: InputsContainerProps) {
    return (
        <Container className="border p-4 rounded mb-4">
            <h2 className="h4 text-center mb-4">{title}</h2>
            {children}
        </Container>
    );
}