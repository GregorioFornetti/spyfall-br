import { Spinner } from '../ui/Modal'

interface ModalLoadingProps {
    show: boolean
}

export default function ModalLoading({ show }: ModalLoadingProps) {
    if (!show) {
        return null
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60" role="dialog" aria-modal="true" aria-label="Carregando">
            <div className="rounded-xl bg-white px-10 py-6 shadow-2xl">
                <Spinner label="Carregando..." />
            </div>
        </div>
    )
}
