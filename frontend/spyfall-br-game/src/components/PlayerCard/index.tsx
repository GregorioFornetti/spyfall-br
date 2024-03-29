import { FaCrown } from 'react-icons/fa'
import { BiTargetLock } from 'react-icons/bi'
import { BsCheck, BsQuestionLg, BsCheckLg, BsXLg, BsFillMegaphoneFill } from 'react-icons/bs'
import styles from './PlayerCard.module.scss'
import classNames from 'classnames'
import { useState } from 'react'
import TooltipIcon from '../TooltipIcon'


interface PlayerCardProps {
    username: string,
    leader?: boolean,
    score: number,
    isCurrentUser?: boolean,
    inGame?: boolean,
    ready?: boolean,
    asking?: boolean,
    target?: boolean,
    onClick?: () => void,
    agreed?: boolean,
    desagreed?: boolean,
    accused?: boolean
}

export default function PlayerCard({username, leader, score, isCurrentUser, inGame, ready, asking, target, agreed, desagreed, accused, onClick}: PlayerCardProps) {

    const [guess, setGuess] = useState<"current user"|"undefined"|"suspect"|"safe">((isCurrentUser) ? ('current user') : ('undefined'))

    return (
        <div onClick={onClick} className={classNames({
            [styles['user-card']]: true,
            [styles['game-user-card']]: inGame,
            [styles['user-card-current-user']]: isCurrentUser || accused,
            [styles['user-card-undefined']]: guess === 'undefined',
            [styles['user-card-suspect']]: guess === 'suspect' || desagreed,
            [styles['user-card-safe']]: guess === 'safe' || agreed,
            [styles['user-card-clickable']]: onClick !== undefined,
            'm-auto': true,
            'text-left': true
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
                            <TooltipIcon Icon={FaCrown} tooltipText={'criador da sala'} />
                        </div>
                    }
                    {ready && 
                        <div className='col-2'>
                            <TooltipIcon Icon={BsCheck} tooltipText={'pronto'} />
                        </div>
                    }
                    {(inGame && target) && 
                        <div className='col-2'>
                            <TooltipIcon Icon={BiTargetLock} tooltipText={'questionado'} />
                        </div>
                    }
                    {(inGame && asking) &&
                        <div className='col-2'>
                            <TooltipIcon Icon={BsFillMegaphoneFill} tooltipText={'questionando'} />
                        </div>
                    }
                </div>
            </div>
            {(!isCurrentUser && inGame) && 
                <div className='d-flex justify-content-around h5 mt-3'>
                    <TooltipIcon
                        onClick={() => setGuess('undefined')} 
                        iconClass={styles['undefined-icon']}
                        tooltipText="indefinido"
                        Icon={BsQuestionLg} 
                        clickable
                    />
                    <TooltipIcon
                        onClick={() => setGuess('safe')}
                        iconClass={styles['safe-icon']}
                        Icon={BsCheckLg}
                        tooltipText="safe"
                        clickable
                    />
                    <TooltipIcon
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