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
            rowClassName={'row-cols-1 row-cols-md-2 row-cols-xl-3 row-cols-xxl-4 gy-4'}
            containerClassName={containerClassName}
        >
            {children}
        </RootContainer>
    )
}