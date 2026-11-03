import React from 'react'
import { useTranslation } from 'react-i18next'

interface ModalProps {
    show: boolean,
    title: string,
    onClose?: () => void,
    children: React.ReactNode,
    footer?: React.ReactNode,
    wide?: boolean,
    headerExtra?: React.ReactNode
}

export default function Modal({ show, title, onClose, children, footer, wide = false, headerExtra }: ModalProps) {
    const { t } = useTranslation()
    if (!show) {
        return null
    }
    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-950/60 p-4 sm:items-center"
            onClick={() => onClose && onClose()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className={`w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} rounded-xl bg-white shadow-2xl`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold leading-snug text-zinc-900">{title}</h2>
                        {headerExtra}
                    </div>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t('common.closeWindow')}
                            className="-mr-1 rounded-md px-2 py-0.5 text-2xl leading-none text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                        >
                            &times;
                        </button>
                    )}
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
                {footer && (
                    <div className="flex flex-wrap justify-end gap-2 border-t border-zinc-200 px-6 py-4">{footer}</div>
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

const variants = {
    primary: 'bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-700 disabled:bg-emerald-700/40',
    dark: 'bg-zinc-900 text-white hover:bg-zinc-700 focus:ring-zinc-900 disabled:bg-zinc-900/40',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 disabled:bg-red-600/40',
    secondary: 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-400 disabled:opacity-50'
}

export function ActionButton({ children, onClick, variant = 'primary', disabled = false, className = '', type, form }: {
    children: React.ReactNode,
    onClick?: () => void,
    variant?: keyof typeof variants,
    disabled?: boolean,
    className?: string,
    type?: 'submit' | 'button',
    form?: string
}) {
    return (
        <button
            type={type ?? 'button'}
            form={form}
            onClick={onClick}
            disabled={disabled}
            className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    )
}

export const inputClass =
    'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 disabled:bg-zinc-100 disabled:text-zinc-500'

export const labelClass = 'mb-1.5 block text-sm font-medium text-zinc-700'
