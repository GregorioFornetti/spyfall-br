interface InputsContainerProps {
    title: string,
    children: JSX.Element[]|JSX.Element
}

export default function InputsContainer({title, children}: InputsContainerProps) {
    return (
        <section className="mb-4 rounded-xl border border-zinc-200 p-4 sm:p-5">
            <h3 className="mb-4 text-center text-lg font-semibold">{title}</h3>
            {children}
        </section>
    );
}
