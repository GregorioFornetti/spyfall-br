
import styles from "./Timer.module.scss"
import classNames from 'classnames'


interface TimerProps {
    time: number
}

export default function Timer({time}: TimerProps) {
    let minutes = Math.floor(time / 60)
    let seconds = time % 60

    return (
        <div className={classNames({
            'h2': true,
            'text-center': true,
            [styles['timer-box']]: true,
            [styles['normal']]: (minutes > 0 || seconds > 10),
            [styles['alert']]: (minutes == 0 && (seconds <= 10 && seconds > 5)),
            [styles['danger']]: (minutes == 0 && seconds <= 5)
        })}
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