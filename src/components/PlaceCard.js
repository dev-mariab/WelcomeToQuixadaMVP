import { useTheme } from '../theme'
import ContentCard from './ContentCard'

const categoryIcon = {
  Monólitos: 'Mountain',
  Aventura: 'Wind',
  História: 'Landmark',
  Religioso: 'Church',
  Ecoturismo: 'Leaf',
  Cultura: 'Sparkles',
}

export default function PlaceCard({
  place,
  saved,
  onSave,
  onOpen,
  width = '100%',
  imageHeight = 172,
  horizontal = false,
  overlayCity = true,
  description,
  actionLabel,
}) {
  const theme = useTheme()
  const meta = [
    !overlayCity && place.city ? { icon: 'MapPin', text: place.city } : null,
    place.rating
      ? { icon: 'Star', text: String(place.rating), color: theme.star, filled: true }
      : null,
  ].filter(Boolean)

  return (
    <ContentCard
      image={place.image}
      imageHeight={imageHeight}
      badge={place.category}
      badgeIcon={categoryIcon[place.category] ?? 'MapPin'}
      title={place.name}
      description={description}
      meta={meta}
      locationLabel={overlayCity ? place.city : null}
      cornerLabel={place.distance}
      saved={saved}
      onSave={onSave}
      onPress={onOpen}
      actionLabel={actionLabel}
      width={width}
      horizontal={horizontal}
    />
  )
}
