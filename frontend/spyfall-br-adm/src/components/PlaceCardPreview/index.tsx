
import placeholderImg from '../../assets/placeholder.png'

interface PlaceCardPreviewProps {
    title: string,
    imgURL?: string
}

export default function PlaceCardPreview({title, imgURL}: PlaceCardPreviewProps) {
    return (
        <div>
            <p>{title}</p>
            <img src={(imgURL) ? (imgURL) : (placeholderImg)} />
        </div>
    )
}