import { ReactElement } from "react"
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
            rowClassName={'row-cols-1 row-cols-lg-2 row-cols-xl-3 gy-4'}
            containerClassName={containerClassName}
        >
            {children}
        </RootContainer>
    )
}