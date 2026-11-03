import { FaCrown } from 'react-icons/fa'
import { BiTargetLock } from 'react-icons/bi'
import { BsCheck, BsQuestionLg, BsCheckLg, BsXLg, BsFillMegaphoneFill } from 'react-icons/bs'
import { useState } from 'react'
import TooltipIcon from '../TooltipIcon'
import { useTranslation } from 'react-i18next'


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

const stateStyles = {
    'current user': 'border-zinc-900 bg-zinc-200',
    undefined: 'border-zinc-800 bg-zinc-50',
    suspect: 'border-red-800 bg-red-100',
    safe: 'border-emerald-800 bg-emerald-100'
}

export default function PlayerCard({username, leader, score, isCurrentUser, inGame, ready, asking, target, agreed, desagreed, accused, onClick}: PlayerCardProps) {

    const { t } = useTranslation()
    const [guess, setGuess] = useState<"current user"|"undefined"|"suspect"|"safe">((isCurrentUser) ? ('current user') : ('undefined'))
    const state = (isCurrentUser || accused) ? 'current user' : (desagreed ? 'suspect' : (agreed ? 'safe' : guess))

    return (
        <div
            onClick={onClick}
            className={`mx-auto w-full max-w-[320px] rounded-lg border-2 p-5 text-left shadow-sm ${stateStyles[state]} ${inGame ? 'min-h-[155px]' : ''} ${onClick !== undefined ? 'cursor-pointer transition hover:shadow-md' : ''}`}
        >
            <p className="truncate text-xl font-semibold leading-snug" title={username}>
                {username}
            </p>
            <div className="mt-1 flex items-center gap-3 text-base">
                <span className="flex-1">{t('player.score', { score })}</span>
                {leader &&
                    <TooltipIcon Icon={FaCrown} tooltipText={t('player.roomCreator')} />
                }
                {ready &&
                    <TooltipIcon Icon={BsCheck} tooltipText={t('player.ready')} />
                }
                {(inGame && target) &&
                    <TooltipIcon Icon={BiTargetLock} tooltipText={t('player.questioned')} />
                }
                {(inGame && asking) &&
                    <TooltipIcon Icon={BsFillMegaphoneFill} tooltipText={t('player.questioning')} />
                }
            </div>
            {(!isCurrentUser && inGame) &&
                <div className="mt-4 flex justify-around text-xl" aria-label={t('player.markSuspicion')}>
                    <TooltipIcon
                        onClick={() => setGuess('undefined')}
                        iconClass="text-zinc-500"
                        tooltipText={t('player.undefined')}
                        Icon={BsQuestionLg}
                        clickable
                    />
                    <TooltipIcon
                        onClick={() => setGuess('safe')}
                        iconClass="text-emerald-700"
                        Icon={BsCheckLg}
                        tooltipText={t('player.safe')}
                        clickable
                    />
                    <TooltipIcon
                        onClick={() => setGuess('suspect')}
                        iconClass="text-red-600"
                        Icon={BsXLg}
                        tooltipText={t('player.suspect')}
                        clickable
                    />
                </div>
            }
        </div>
    )
}
