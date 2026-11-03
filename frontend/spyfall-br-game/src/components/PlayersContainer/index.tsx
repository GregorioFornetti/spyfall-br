import RootContainer from "../RootContainer"


interface PlayersContainerProps {
    title: string,
    children: JSX.Element[]|JSX.Element
    containerClassName?: string
}


export default function PlayersContainer({title, children, containerClassName}: PlayersContainerProps) {
    return (
        <RootContainer
            title={title}
            rowClassName={'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}
            containerClassName={containerClassName}
        >
            {children}
        </RootContainer>
    )
}
