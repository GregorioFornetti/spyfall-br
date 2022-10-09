import RootContainer from "../RootContainer"


interface UserContainerProps {
    title: string,
    children: JSX.Element[]|JSX.Element,
    containerClassName?: string
}


export default function UsersContainer({title, children, containerClassName}: UserContainerProps) {
    return (
        <RootContainer 
            title={title} 
            rowClassName={'row-cols-1 row-cols-lg-2 row-cols-xl-3 gy-4'}
            containerClassName={containerClassName}
        >
            {children}
        </RootContainer>
    )
}