import { IconType } from "react-icons";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import classNames from 'classnames'
import styles from './TooltipIcon.module.scss'

interface TooltipIconProps {
    tooltipText: string,
    onClick?: () => void,
    Icon: IconType,
    iconClass?: string,
    clickable?: boolean
}

export default function TooltipIcon({tooltipText, onClick, Icon, iconClass, clickable}: TooltipIconProps) {
    return (
        <OverlayTrigger
            overlay={<Tooltip>{tooltipText}</Tooltip>}
            placement='top'
        >
            <span>
                <Icon
                    onClick={onClick} 
                    className={classNames(iconClass, {[styles.clickable]: clickable})} 
                />
            </span>
        </OverlayTrigger>
    )
}