import { FaRegCopy } from "react-icons/fa"
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useTranslation } from 'react-i18next'

interface CopyCodeFormInterface {
    title: string,
    copyValue: string
}

export default function CopyCodeForm({title, copyValue}: CopyCodeFormInterface) {
    const { t } = useTranslation()
    return (
        <div className="mx-auto w-full max-w-[350px]">
            <label htmlFor={`copy-${title}`} className="mb-1.5 block text-sm font-semibold text-zinc-800">{title}</label>
            <div className="flex">
                <input
                    id={`copy-${title}`}
                    readOnly={true}
                    value={copyValue}
                    className="min-w-0 flex-1 rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700 outline-none"
                />
                <CopyToClipboard text={copyValue}>
                    <button
                        type="button"
                        aria-label={t('common.copy', { name: title.toLowerCase() })}
                        className="rounded-r-lg border border-zinc-300 bg-white px-3 text-zinc-600 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                        <FaRegCopy />
                    </button>
                </CopyToClipboard>
            </div>
        </div>
    )
}
