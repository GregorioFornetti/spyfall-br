import { IconType } from "react-icons";

interface TooltipIconProps {
    tooltipText: string,
    onClick?: () => void,
    Icon: IconType,
    iconClass?: string,
    clickable?: boolean
}

export default function TooltipIcon({tooltipText, onClick, Icon, iconClass, clickable}: TooltipIconProps) {
    return (
        <span className="group relative inline-flex" title={tooltipText}>
            <Icon
                onClick={(event) => {
                    if (onClick) {
                        event.stopPropagation()
                        onClick()
                    }
                }}
                className={`${iconClass ?? ''} ${clickable ? 'cursor-pointer transition hover:scale-110' : ''}`}
                aria-label={tooltipText}
                role={clickable ? 'button' : undefined}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-2 py-1 text-xs text-white group-hover:block">
                {tooltipText}
            </span>
        </span>
    )
}
