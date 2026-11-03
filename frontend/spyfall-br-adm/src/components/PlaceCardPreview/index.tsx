import placeholderImg from '../../assets/placeholder.png'

interface PlaceCardPreviewProps {
    title: string,
    imgURL?: string
}

export default function PlaceCardPreview({ title, imgURL }: PlaceCardPreviewProps) {
    return (
        <figure className="relative mx-auto w-[300px] max-w-full text-center">
            <img
                className="aspect-[3/2] w-full select-none rounded-[20px] border-[3px] border-zinc-400 object-cover"
                src={imgURL ? imgURL : placeholderImg}
                alt={title}
                draggable={false}
            />
            <figcaption className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-black/70 px-3.5 py-2">
                <span className="text-xl font-medium text-white">{title}</span>
            </figcaption>
        </figure>
    )
}
