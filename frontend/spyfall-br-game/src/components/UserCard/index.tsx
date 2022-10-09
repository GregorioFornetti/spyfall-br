import { FaCrown } from 'react-icons/fa'
import { BsQuestionLg, BsCheckLg, BsXLg } from 'react-icons/bs'
import styles from './UserCard.module.scss'
import classNames from 'classnames'
import { useState } from 'react'
import GuessIcon from './GuessIcon'


interface UserCardProps {
    username: string,
    leader: boolean,
    score: number,
    isCurrentUser: boolean
}

export default function UserCard({username, leader, score, isCurrentUser}: UserCardProps) {

    const [guess, setGuess] = useState<"current user"|"undefined"|"suspect"|"safe">((isCurrentUser) ? ('current user') : ('undefined'))

    return (
        <div className={classNames({
            [styles['user-card']]: true,
            [styles['user-card-current-user']]: isCurrentUser,
            [styles['user-card-undefined']]: guess === 'undefined',
            [styles['user-card-suspect']]: guess === 'suspect',
            [styles['user-card-safe']]: guess === 'safe',
            'm-auto': true
        })}
        >
            <p className='h4'>{username} {leader && <FaCrown />}</p>
            <p className='h5'>Pontuação: {score}</p>
            {!isCurrentUser && 
                <div className='d-flex justify-content-around h5 mt-3'>
                    <GuessIcon
                        onClick={() => setGuess('undefined')} 
                        iconClass={styles['undefined-icon']}
                        tooltipText="indefinido"
                        Icon={BsQuestionLg} 
                    />
                    <GuessIcon
                        onClick={() => setGuess('safe')}
                        iconClass={styles['safe-icon']}
                        Icon={BsCheckLg}
                        tooltipText="safe"
                    />
                    <GuessIcon
                        onClick={() => setGuess('suspect')}
                        iconClass={classNames(styles['suspect-icon'], styles.icon)}
                        Icon={BsXLg}
                        tooltipText="suspeito"
                    />
                </div>
            }
        </div>
    )
}