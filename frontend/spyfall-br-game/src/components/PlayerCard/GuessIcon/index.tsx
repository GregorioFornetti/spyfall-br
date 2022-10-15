import { IconType } from "react-icons";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import classNames from 'classnames'
import styles from './GuessIcon.module.scss'

interface GuessIconProps {
    tooltipText: string,
    onClick?: () => void,
    Icon: IconType,
    iconClass?: string,
    clickable?: boolean
}

export default function GuessIcon({tooltipText, onClick, Icon, iconClass, clickable}: GuessIconProps) {
    return (
        <OverlayTrigger
            overlay={<Tooltip>{tooltipText}</Tooltip>}
            placement='top'
        >
            <div>
                <Icon
                    onClick={onClick} 
                    className={classNames(iconClass, {[styles.clickable]: clickable})} 
                />
            </div>
        </OverlayTrigger>
    )
}