import RootContainer from "../RootContainer"


interface RootContainerProps {
    title: string,
    children: JSX.Element[]|JSX.Element
}


export default function UsersContainer({title, children}: RootContainerProps) {
    return (
        <RootContainer title={title} rowClassName={'row-cols-1 row-cols-lg-2 row-cols-xl-3 gy-4'}>
            {children}
        </RootContainer>
    )
}