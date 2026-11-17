import { useMemo } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTheme } from '../theme'
import { imageSource } from '../utils'
import Header from '../components/Header'
import Icon from '../components/Icon'

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch (error) {
    return ''
  }
}

const kindConfig = {
  favorite: { icon: 'Heart', label: 'Favorito' },
  review: { icon: 'StarFilled', label: 'Avaliação' },
  photo: { icon: 'Camera', label: 'Foto' },
  map: { icon: 'Map', label: 'Mapa offline' },
}

export default function RecordsScreen({
  name,
  city,
  places = [],
  savedPlaces = [],
  reviews = [],
  photos = [],
  mapDownloaded,
  onOpenPlace,
  onOpenPhotos,
  onOpenMap,
  onBack,
  onNotifications,
  unread,
}) {
  const theme = useTheme()

  const entries = useMemo(() => {
    const favorites = savedPlaces.map((place) => ({
      id: `favorite-${place.id}`,
      kind: 'favorite',
      date: '',
      title: place.name,
      detail: [place.category, place.city].filter(Boolean).join(' · '),
      image: place.image,
      place,
    }))

    const myReviews = reviews
      .filter(
        (review) =>
          String(review.author || '').trim().toLowerCase() ===
          String(name || '').trim().toLowerCase(),
      )
      .map((review) => {
        const place = places.find((item) => String(item.id) === String(review.placeId))
        return {
          id: `review-${review.id}`,
          kind: 'review',
          date: review.createdAt,
          title: review.placeName || place?.name || 'Atrativo avaliado',
          detail: `${Number(review.rating) || 5}/5${
            review.text ? ` · ${review.text}` : ''
          }`,
          place,
        }
      })

    const photoEntries = photos.map((photo) => ({
      id: `photo-${photo.id}`,
      kind: 'photo',
      date: photo.createdAt,
      title: photo.placeName || photo.city || city,
      detail: photo.caption || 'Foto adicionada à sua viagem',
      image: photo.url,
    }))

    const mapEntries = mapDownloaded
      ? [
          {
            id: 'map-offline',
            kind: 'map',
            date: '',
            title: 'Mapa offline do Sertão Central',
            detail: 'Disponível para consulta sem conexão',
          },
        ]
      : []

    return [...favorites, ...myReviews, ...photoEntries, ...mapEntries].sort(
      (a, b) => {
        const first = a.date ? new Date(a.date).getTime() : 0
        const second = b.date ? new Date(b.date).getTime() : 0
        return second - first
      },
    )
  }, [city, mapDownloaded, name, photos, places, reviews, savedPlaces])

  function openEntry(entry) {
    if (entry.kind === 'favorite' && entry.place) {
      onOpenPlace?.(entry.place)
      return
    }
    if (entry.kind === 'review' && entry.place) {
      onOpenPlace?.(entry.place)
      return
    }
    if (entry.kind === 'photo') {
      onOpenPhotos?.()
      return
    }
    if (entry.kind === 'map') {
      onOpenMap?.()
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.paper }}>
      <Header
        title="Registros"
        subtitle="Sua jornada pelo Sertão Central"
        onBack={onBack}
        onNotifications={onNotifications}
        unread={unread}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.summary, { backgroundColor: theme.sand }]}>
          <View style={[styles.summaryIcon, { backgroundColor: theme.forest }]}>
            <Icon name="Bookmark" size={22} color={theme.lime} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={[styles.summaryTitle, { color: theme.ink }]}>
              {entries.length
                ? `${entries.length} ${
                    entries.length === 1 ? 'registro na jornada' : 'registros na jornada'
                  }`
                : 'Sua jornada começa agora'}
            </Text>
            <Text style={[styles.summaryText, { color: theme.muted }]}>
              Favoritos, avaliações, fotos e mapas baixados em um só lugar.
            </Text>
          </View>
        </View>

        {entries.length ? (
          <View style={styles.timeline}>
            {entries.map((entry) => {
              const config = kindConfig[entry.kind] ?? kindConfig.favorite
              const pressable = Boolean(entry.place) || entry.kind === 'photo' || entry.kind === 'map'
              return (
                <TouchableOpacity
                  key={entry.id}
                  activeOpacity={pressable ? 0.85 : 1}
                  onPress={() => openEntry(entry)}
                  disabled={!pressable}
                  style={styles.entryRow}
                >
                  <View style={styles.timelineRail}>
                    <View style={[styles.entryIcon, { backgroundColor: theme.sand }]}>
                      <Icon name={config.icon} size={16} color={theme.forest} />
                    </View>
                    <View style={[styles.rail, { backgroundColor: theme.line }]} />
                  </View>
                  <View
                    style={[
                      styles.entryCard,
                      { backgroundColor: theme.surface, borderColor: theme.line },
                    ]}
                  >
                    <View style={styles.entryHead}>
                      <Text style={[styles.entryKind, { color: theme.kicker }]}>
                        {config.label.toUpperCase()}
                      </Text>
                      {entry.date ? (
                        <Text style={[styles.entryDate, { color: theme.muted }]}>
                          {formatDate(entry.date)}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.entryBody}>
                      {entry.image ? (
                        <Image
                          source={imageSource(entry.image)}
                          style={styles.entryImage}
                          resizeMode="cover"
                        />
                      ) : null}
                      <View style={styles.entryCopy}>
                        <Text
                          style={[styles.entryTitle, { color: theme.ink }]}
                          numberOfLines={2}
                        >
                          {entry.title}
                        </Text>
                        <Text
                          style={[styles.entryDetail, { color: theme.muted }]}
                          numberOfLines={2}
                        >
                          {entry.detail}
                        </Text>
                      </View>
                      {pressable ? (
                        <Icon name="ChevronRight" size={16} color={theme.muted} />
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.sand }]}>
              <Icon name="Bookmark" size={24} color={theme.forest} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.ink }]}>
              Nenhum registro ainda
            </Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Salve atrativos, avalie lugares, adicione fotos ou baixe o mapa offline para
              começar sua jornada.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 14,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 14,
  },
  timeline: {
    gap: 0,
  },
  entryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineRail: {
    width: 34,
    alignItems: 'center',
  },
  entryIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  rail: {
    width: 1,
    flex: 1,
    marginVertical: 4,
  },
  entryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 11,
    marginBottom: 10,
  },
  entryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  entryKind: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
  },
  entryDate: {
    fontSize: 8,
    fontWeight: '700',
  },
  entryBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  entryImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  entryCopy: {
    flex: 1,
    gap: 2,
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  entryDetail: {
    fontSize: 9,
    lineHeight: 13,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
})

