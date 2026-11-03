import { useState } from 'react'
import { Socket } from "socket.io-client";
import { useTranslation } from 'react-i18next';
import Modal, { ActionButton, inputClass, labelClass } from '../ui/Modal';

interface MainPageProps {
    show?: boolean,
    socket: Socket,
    URLGameCode: string,
    setURLGameCode: React.Dispatch<React.SetStateAction<string>>
}

export default function MainPage({show, socket, URLGameCode, setURLGameCode}: MainPageProps) {
    const { t } = useTranslation()
    const [showNewMatchModal, setShowNewMatchModal] = useState(false)
    const [showJoinMatchModal, setShowJoinMatchModal] = useState(false)

    const [username, setUsername] = useState("")
    const [roomCode, setRoomCode] = useState("")

    const openNewMatchModal = () => setShowNewMatchModal(true)
    const closeNewMatchModal = () => setShowNewMatchModal(false)

    const openJoinMatchModal = () => setShowJoinMatchModal(true)
    const closeJoinMatchModal = () => {
        setURLGameCode('')
        setShowJoinMatchModal(false)
    }

    const createRoom = () => {
        if (username.trim().length > 0) {
            socket.emit("create-room", {username: username})
            setShowNewMatchModal(false)
        } else {
            alert(t('main.alertName'))
        }
    }

    const joinRoom = () => {
        if (username.trim().length > 0 && (roomCode.trim().length > 0 || URLGameCode.trim().length > 0)) {
            socket.emit("join-room", {roomCode: (URLGameCode) ? URLGameCode : roomCode, username: username})
            setURLGameCode('')
            setShowJoinMatchModal(false)
        } else {
            alert(t('main.alertNameAndCode'))
        }
    }

    if (!show) {
        return null
    }

    return (
        <>
            <section className="mx-auto max-w-2xl pt-6 text-center sm:pt-12">
                <p className="font-display text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
                    Spyfall<span className="text-emerald-700">-br</span>
                </p>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
                    {t('main.tagline')}
                </p>

                <div className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={openNewMatchModal}
                        className="rounded-xl bg-emerald-700 px-5 py-4 text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                    >
                        <span className="block text-base font-semibold">{t('main.createTitle')}</span>
                        <span className="mt-0.5 block text-sm text-emerald-100">{t('main.createSubtitle')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={openJoinMatchModal}
                        className="rounded-xl border border-zinc-300 bg-white px-5 py-4 text-zinc-900 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
                    >
                        <span className="block text-base font-semibold">{t('main.joinTitle')}</span>
                        <span className="mt-0.5 block text-sm text-zinc-500">{t('main.joinSubtitle')}</span>
                    </button>
                </div>

                <ol className="mx-auto mt-10 grid max-w-xl gap-4 text-left text-sm text-zinc-600 sm:grid-cols-3">
                    <li>
                        <span className="font-display text-2xl font-bold text-zinc-900">1.</span>
                        <p className="mt-1">{t('main.how1')}</p>
                    </li>
                    <li>
                        <span className="font-display text-2xl font-bold text-zinc-900">2.</span>
                        <p className="mt-1">{t('main.how2')}</p>
                    </li>
                    <li>
                        <span className="font-display text-2xl font-bold text-zinc-900">3.</span>
                        <p className="mt-1">{t('main.how3')}</p>
                    </li>
                </ol>
            </section>

            <Modal
                show={showNewMatchModal}
                title={t('main.createTitle')}
                onClose={closeNewMatchModal}
                footer={
                    <>
                        <ActionButton variant="secondary" onClick={closeNewMatchModal}>{t('common.close')}</ActionButton>
                        <ActionButton onClick={createRoom}>{t('main.create')}</ActionButton>
                    </>
                }
            >
                <label htmlFor="create-username" className={labelClass}>{t('main.name')}</label>
                <input id="create-username" className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} type="text" autoFocus />
            </Modal>

            <Modal
                show={showJoinMatchModal || URLGameCode.length !== 0}
                title={t('main.joinTitle')}
                onClose={closeJoinMatchModal}
                footer={
                    <>
                        <ActionButton variant="secondary" onClick={closeJoinMatchModal}>{t('common.close')}</ActionButton>
                        <ActionButton onClick={joinRoom}>{t('main.enter')}</ActionButton>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    {(!URLGameCode) &&
                        <div>
                            <label htmlFor="join-code" className={labelClass}>{t('main.roomCode')}</label>
                            <input id="join-code" className={inputClass} value={roomCode} onChange={(event) => setRoomCode(event.target.value)} type="text" />
                        </div>
                    }
                    <div>
                        <label htmlFor="join-username" className={labelClass}>{t('main.name')}</label>
                        <input id="join-username" className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} type="text" autoFocus={!!URLGameCode} />
                    </div>
                </div>
            </Modal>
        </>
    )
}
