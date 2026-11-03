interface RootContainerProps {
    title: string,
    children: JSX.Element[]|JSX.Element,
    rowClassName: string,
    containerClassName?: string
}

export default function RootContainer({title, children, rowClassName, containerClassName}: RootContainerProps) {
    return (
        <section className={containerClassName}>
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <h3 className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-xl font-semibold">{title}</h3>
                <div className="p-4 sm:p-5">
                    <div className={`grid gap-4 ${rowClassName}`}>
                        {children}
                    </div>
                </div>
            </div>
        </section>
    )
}
