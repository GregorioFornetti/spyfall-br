import { useTranslation } from 'react-i18next'

interface TimerProps {
    time: number
}

export default function Timer({time}: TimerProps) {
    const { t } = useTranslation()
    let minutes = Math.floor(time / 60)
    let seconds = time % 60

    const state = time <= 5
        ? 'danger'
        : time <= 10
            ? 'alert'
            : time <= 30
                ? 'warning'
                : 'normal'

    const colors = {
        normal: 'border-zinc-300 bg-white text-zinc-900',
        warning: 'border-amber-400 bg-amber-50 text-amber-700',
        alert: 'border-amber-600 bg-amber-100 text-amber-800 motion-safe:animate-pulse',
        danger: 'border-red-600 bg-red-50 text-red-700 motion-safe:animate-pulse'
    }

    return (
        <div
            data-state={state}
            className={`inline-block rounded-lg border-2 px-5 py-2 text-center text-3xl font-semibold tabular-nums shadow-sm ${colors[state]}`}
            role="timer"
            aria-label={t('timer.aria', { minutes, seconds })}
        >
            <span>
                {minutes.toString().padStart(2, '0')}
            </span>
            :
            <span>
                {seconds.toString().padStart(2, '0')}
            </span>
        </div>
    )
}
