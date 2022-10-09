
import placeholderImg from '../../assets/placeholder.png'
import styles from './PlaceCard.module.scss'
import classNames from 'classnames'
import { useState } from 'react'

interface PlaceCardProps {
    title: string,
    type: "markable"|"selected"|"option",
    imgURL?: string
}

export default function PlaceCard({title, type, imgURL}: PlaceCardProps) {
    const [marked, setMarked] = useState(false)

    return (
        <div 
            className={classNames({
                [styles.placeBox]: true,
                [styles.clickable]: type === 'markable' || type === 'option'
            })} 
            draggable={false}
            onClick={() => {
                if (type === 'markable') {
                    setMarked(!marked)
                }
            }}
        >
            <img
                className={classNames(styles.placeImg, styles.noselect)}
                src={(imgURL) ? (imgURL) : (placeholderImg)}
                draggable={false}
            />
            <div className={styles.placeTitleBox}>
                <p className={classNames({
                    [styles.placeTitle]: true,
                    [styles.noselect]: true,
                    [styles.markedPlace]: marked
                })}>
                    {title}
                </p>
            </div>
        </div>
    )
}