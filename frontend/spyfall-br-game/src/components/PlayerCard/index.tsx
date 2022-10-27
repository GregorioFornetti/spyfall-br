import { FaCrown } from 'react-icons/fa'
import { BiTargetLock } from 'react-icons/bi'
import { BsQuestionLg, BsCheckLg, BsXLg, BsFillMegaphoneFill } from 'react-icons/bs'
import styles from './PlayerCard.module.scss'
import classNames from 'classnames'
import { useState } from 'react'
import GuessIcon from './GuessIcon'


interface PlayerCardProps {
    username: string,
    leader?: boolean,
    score: number,
    isCurrentUser?: boolean,
    inGame?: boolean,
    asking?: boolean,
    target?: boolean,
    onClick?: () => void
}

export default function PlayerCard({username, leader, score, isCurrentUser, inGame, asking, target, onClick}: PlayerCardProps) {

    const [guess, setGuess] = useState<"current user"|"undefined"|"suspect"|"safe">((isCurrentUser) ? ('current user') : ('undefined'))

    return (
        <div onClick={onClick} className={classNames({
            [styles['user-card']]: true,
            [styles['game-user-card']]: inGame,
            [styles['user-card-current-user']]: isCurrentUser,
            [styles['user-card-undefined']]: guess === 'undefined',
            [styles['user-card-suspect']]: guess === 'suspect',
            [styles['user-card-safe']]: guess === 'safe',
            [styles['user-card-clickable']]: onClick !== undefined,
            'm-auto': true
        })}
        >
            <p className='h4'> 
                {username}
            </p>
            <div className='h5'>
                <div className='row'>
                    <div className='col-8'>
                        <span>Pontuação: {score}</span>
                    </div>
                    {leader &&
                        <div className='col-2'>
                            {leader && <GuessIcon Icon={FaCrown} tooltipText={'criador da sala'} /> }
                        </div>
                    }
                    {(inGame && target) && 
                        <div className='col-2'>
                            <GuessIcon Icon={BiTargetLock} tooltipText={'questionado'} />
                        </div>
                    }
                    {(inGame && asking) &&
                        <div className='col-2'>
                            <GuessIcon Icon={BsFillMegaphoneFill} tooltipText={'questionando'} />
                        </div>
                    }
                </div>
            </div>
            {(!isCurrentUser && inGame) && 
                <div className='d-flex justify-content-around h5 mt-3'>
                    <GuessIcon
                        onClick={() => setGuess('undefined')} 
                        iconClass={styles['undefined-icon']}
                        tooltipText="indefinido"
                        Icon={BsQuestionLg} 
                        clickable
                    />
                    <GuessIcon
                        onClick={() => setGuess('safe')}
                        iconClass={styles['safe-icon']}
                        Icon={BsCheckLg}
                        tooltipText="safe"
                        clickable
                    />
                    <GuessIcon
                        onClick={() => setGuess('suspect')}
                        iconClass={classNames(styles['suspect-icon'], styles.icon)}
                        Icon={BsXLg}
                        tooltipText="suspeito"
                        clickable
                    />
                </div>
            }
        </div>
    )
}