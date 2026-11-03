import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal, { ActionButton } from '../ui/Modal';

interface HelpModalProps {
    show: boolean,
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

export default function HelpModal({show, setShow}: HelpModalProps) {
    const { t } = useTranslation()

    const handleClose = () => setShow(false);

    return (
        <Modal
            show={show}
            title={t('help.title')}
            onClose={handleClose}
            footer={<ActionButton variant="secondary" onClick={handleClose}>{t('common.close')}</ActionButton>}
        >
            <div className="flex flex-col gap-4 leading-relaxed text-zinc-700 [&_a]:font-medium [&_a]:text-emerald-700 [&_a]:underline [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_li]:ml-5 [&_li]:list-disc [&_p]:text-base">
                <h2>{t('help.videoTitle')}</h2>
                <p>
                    {t('help.videoTextBefore')}<a href='https://youtu.be/OdbCMcpCR4c?si=jx8pOGtwF-S0b2Zg'>{t('help.videoLink')}</a>
                </p>

                <h2>{t('help.contextTitle')}</h2>
                <p>{t('help.contextText')}</p>

                <h2>{t('help.recommendationsTitle')}</h2>
                <ul>
                    <li>{t('help.rec1')}</li>
                    <li>{t('help.rec2')}</li>
                    <li>{t('help.rec3')}</li>
                </ul>

                <h2>{t('help.howToPlayTitle')}</h2>
                <p>
                    {t('help.introBefore')}<strong>{t('help.introSpy')}</strong>{t('help.introMiddle')}<strong>{t('help.introDetectives')}</strong>{t('help.introAfter')}<strong>{t('help.introPlace')}</strong>{t('help.introEnd')}
                    <ul>
                        <li>
                            <strong>{t('help.spyGoalLabel')}</strong>{t('help.spyGoal')}
                        </li>
                        <li>
                            <strong>{t('help.detectivesGoalLabel')}</strong>{t('help.detectivesGoal')}
                        </li>
                    </ul>
                </p>

                <h2>{t('help.roundsTitle')}</h2>
                <p>
                    {t('help.roundsBefore')}<strong>{t('help.roundsRole')}</strong>{t('help.roundsMiddle')}<strong>{t('help.roundsPlace')}</strong>{t('help.roundsText')}<strong>{t('help.roundsQuestion')}</strong>{t('help.roundsEnd')}
                    <ul>
                        <li>
                            <strong>{t('help.endVoteLabel')}</strong>{t('help.endVote')}
                        </li>
                        <li>
                            <strong>{t('help.endGuessLabel')}</strong>{t('help.endGuess')}
                        </li>
                        <li>
                            <strong>{t('help.endTimeLabel')}</strong>{t('help.endTime')}
                        </li>
                    </ul>
                </p>
            </div>
        </Modal>
    )
}
