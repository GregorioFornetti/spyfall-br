import React from 'react'

interface ModalProps {
    show: boolean,
    title: string,
    onClose: () => void,
    children: React.ReactNode,
    footer?: React.ReactNode,
    closeable?: boolean
}

export default function Modal({ show, title, onClose, children, footer, closeable = true }: ModalProps) {
    if (!show) {
        return null
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-950/60 p-4 sm:items-center"
            onClick={() => closeable && onClose()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className="w-full max-w-lg rounded-xl bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4">
                    <h2 className="text-lg font-semibold leading-snug text-zinc-900">{title}</h2>
                    {closeable && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Fechar janela"
                            className="-mr-1 rounded-md px-2 py-0.5 text-2xl leading-none text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                        >
                            &times;
                        </button>
                    )}
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
                {footer && (
                    <div className="flex justify-end gap-2 border-t border-zinc-200 px-6 py-4">{footer}</div>
                )}
            </div>
        </div>
    )
}

export function Spinner({ label }: { label?: string }) {
    return (
        <div className="flex flex-col items-center gap-3 py-6" role="status">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-emerald-600" />
            {label && <p className="text-sm text-zinc-500">{label}</p>}
        </div>
    )
}

export const inputClass =
    'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'

export const labelClass = 'mb-1.5 block text-sm font-medium text-zinc-700'

export function PrimaryButton({ children, onClick, danger = false }: {
    children: React.ReactNode,
    onClick: () => void,
    danger?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                danger
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                    : 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-700'
            }`}
        >
            {children}
        </button>
    )
}

export function SecondaryButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2"
        >
            {children}
        </button>
    )
}
