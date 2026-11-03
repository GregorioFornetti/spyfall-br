import placeholderImg from '../../assets/placeholder.png'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface PlaceCardProps {
    title: string,
    type: "markable"|"selected"|"option",
    imgURL?: string,
    onClick?: () => void
}

export default function PlaceCard({title, type, imgURL, onClick}: PlaceCardProps) {
    const { t } = useTranslation()
    const [marked, setMarked] = useState(false)
    const onClickFinal = (onClick) ? (onClick) : (() => {
        if (type === 'markable') {
            setMarked(!marked)
        }
    })
    const interactive = type === 'markable' || type === 'option'

    return (
        <figure
            className={`relative mx-auto w-full max-w-[300px] select-none text-center ${interactive ? 'cursor-pointer' : ''}`}
            draggable={false}
            onClick={onClickFinal}
        >
            <img
                className={`aspect-[3/2] w-full select-none rounded-[20px] border-[3px] object-cover transition ${
                    marked ? 'border-red-500 opacity-60 grayscale-[35%]' : 'border-zinc-400'
                }`}
                src={(imgURL) ? (imgURL) : (placeholderImg)}
                alt={title}
                draggable={false}
            />
            <figcaption className="absolute left-1/2 top-1/2 max-w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-black/70 px-3.5 py-2">
                <span className={`text-xl font-medium leading-tight text-white ${marked ? 'line-through decoration-red-400 decoration-2' : ''}`}>
                    {title}
                </span>
            </figcaption>
            {marked && (
                <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                    {t('place.crossedOut')}
                </span>
            )}
        </figure>
    )
}
