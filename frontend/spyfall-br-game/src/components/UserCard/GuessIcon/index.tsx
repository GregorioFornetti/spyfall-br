import { IconType } from "react-icons";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import classNames from 'classnames'
import styles from './GuessIcon.module.scss'

interface GuessIconProps {
    tooltipText: string,
    onClick: () => void,
    Icon: IconType,
    iconClass: string
}

export default function GuessIcon({tooltipText, onClick, Icon, iconClass}: GuessIconProps) {
    return (
        <OverlayTrigger
            overlay={<Tooltip>{tooltipText}</Tooltip>}
            placement='top'
        >
            <div>
                <Icon
                    onClick={onClick} 
                    className={classNames(iconClass, styles.icon)} 
                />
            </div>
        </OverlayTrigger>
    )
}