
import placeholderImg from '../../assets/placeholder.png'
import styles from './PlaceCardPreview.module.scss'

interface PlaceCardPreviewProps {
    title: string,
    imgURL?: string
}

export default function PlaceCardPreview({title, imgURL}: PlaceCardPreviewProps) {
    return (
        <div className={styles.previewBox} draggable={false}>
            <img
                className={styles.previewImg}
                src={(imgURL) ? (imgURL) : (placeholderImg)}
                draggable={false}
                
            />
            <div className={styles.previewTitleBox}>
                <p className={styles.previewTitle}>
                    {title}
                </p>
            </div>
        </div>
    )
}