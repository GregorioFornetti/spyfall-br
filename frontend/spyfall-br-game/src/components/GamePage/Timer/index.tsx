import { useTranslation } from 'react-i18next'

interface TimerProps {
    time: number
}

export default function Timer({time}: TimerProps) {
    const { t } = useTranslation()
    let minutes = Math.floor(time / 60)
    let seconds = time % 60

    const state = (minutes == 0 && seconds <= 5)
        ? 'danger'
        : (minutes == 0 && seconds <= 10)
            ? 'alert'
            : 'normal'

    const colors = {
        normal: 'border-zinc-300 bg-white text-zinc-900',
        alert: 'border-amber-500 bg-amber-50 text-amber-700',
        danger: 'border-red-600 bg-red-50 text-red-700'
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
