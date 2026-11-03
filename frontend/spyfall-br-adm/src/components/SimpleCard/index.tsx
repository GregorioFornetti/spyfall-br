interface SimpleCardProps {
    name: string,
    imgURL?: string,
    meta?: string,
    deleteFunction: () => void,
    updateFunction: () => void
}

export default function SimpleCard({ name, imgURL, meta, deleteFunction, updateFunction }: SimpleCardProps) {
    return (
        <article className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
            {imgURL && (
                <img src={imgURL} alt={name} className="aspect-[3/2] w-full object-cover" draggable={false} />
            )}
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-zinc-900" title={name}>{name}</h3>
                    {meta && <p className="mt-0.5 text-xs text-zinc-500">{meta}</p>}
                </div>
                <div className="mt-auto flex gap-2">
                    <button
                        type="button"
                        onClick={updateFunction}
                        className="flex-1 rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
                    >
                        Atualizar
                    </button>
                    <button
                        type="button"
                        onClick={deleteFunction}
                        className="flex-1 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
                    >
                        Deletar
                    </button>
                </div>
            </div>
        </article>
    )
}
