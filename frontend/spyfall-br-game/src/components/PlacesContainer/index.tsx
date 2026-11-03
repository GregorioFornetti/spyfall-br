import RootContainer from "../RootContainer"

interface PlaceContainerProps {
    title: string,
    children: JSX.Element[]|JSX.Element,
    containerClassName?: string
}


export default function PlacesContainer({title, children, containerClassName}: PlaceContainerProps) {
    return (
        <RootContainer
            title={title}
            rowClassName={'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'}
            containerClassName={containerClassName}
        >
            {children}
        </RootContainer>
    )
}
