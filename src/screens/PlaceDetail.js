import { useState } from 'react'
import {
  ImageBackground,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from '../i18n'
import { useTheme } from '../theme'
import { imageSource, openUrl } from '../utils'
import Icon from '../components/Icon'
import IconButton from '../components/IconButton'

export default function PlaceDetail({
  place,
  saved,
  onSave,
  onClose,
  reviews = [],
  onAddReview,
  userName,
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const reviewAverage = reviews.length
    ? (
        reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : Number(place.rating).toFixed(1)

  function submitReview() {
    const text = comment.trim()
    if (!text) return
    if (onAddReview) {
      onAddReview({
        placeId: place.id,
        placeName: place.name,
        author: userName || t('place.guest'),
        rating,
        text,
      })
    }
    setComment('')
    setRating(5)
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `${place.name} — ${place.city}. Descubra no aplicativo!`,
      })
    } catch (error) {
      // Sharing can be cancelled by the user.
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.paper }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ImageBackground
          source={imageSource(place.image)}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={[styles.overlayActions, { paddingTop: insets.top + 10 }]}>
            <IconButton
              icon="ArrowLeft"
              label={t('place.back')}
              onPress={onClose}
              background="rgba(255,255,255,0.92)"
              color={theme.forest}
            />
            <View style={styles.overlayRight}>
              <IconButton
                icon="Share2"
                label={t('place.share')}
                onPress={handleShare}
                background="rgba(255,255,255,0.92)"
                color={theme.forest}
              />
              <IconButton
                icon="Heart"
                label={saved ? t('place.removeFavorite') : t('place.saveFavorite')}
                onPress={onSave}
                filled={saved}
                background={saved ? theme.forest : 'rgba(255,255,255,0.92)'}
                color={saved ? '#ffffff' : theme.forest}
              />
            </View>
          </View>
          <View style={[styles.heroBadge, { borderColor: theme.line }]}>
            <Icon name="MapPin" size={13} color={theme.forestDark} />
            <Text style={[styles.heroBadgeText, { color: theme.forestDark }]}>
              {place.city}
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.body}>
          <Text style={[styles.kicker, { color: theme.kicker }]}>{place.category}</Text>
          <Text style={[styles.title, { color: theme.ink }]}>{place.name}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.ratingPill, { backgroundColor: theme.sand }]}>
              <Icon name="Star" size={14} color={theme.star} filled />
              <Text style={[styles.ratingText, { color: theme.ink }]}>
                {reviewAverage}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="Navigation" size={14} color={theme.muted} />
              <Text style={[styles.metaText, { color: theme.muted }]}>{place.distance}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="Clock3" size={14} color={theme.muted} />
              <Text style={[styles.metaText, { color: theme.muted }]}>
                {t('place.openAllDay')}
              </Text>
            </View>
          </View>

          <Text style={[styles.description, { color: theme.muted }]}>{place.description}</Text>

          {place.tags?.length ? (
            <View style={styles.tags}>
              {place.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: theme.sand }]}>
                  <Text style={[styles.tagText, { color: theme.forest }]}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.infoGrid}>
            <View style={[styles.info, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <Icon name="Compass" size={18} color={theme.forest} />
              <Text style={[styles.infoLabel, { color: theme.muted }]}>
                {t('place.category')}
              </Text>
              <Text style={[styles.infoValue, { color: theme.ink }]}>{place.category}</Text>
            </View>
            <View style={[styles.info, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <Icon name="Navigation" size={18} color={theme.forest} />
              <Text style={[styles.infoLabel, { color: theme.muted }]}>
                {t('place.distance')}
              </Text>
              <Text style={[styles.infoValue, { color: theme.ink }]}>{place.distance}</Text>
            </View>
            <View style={[styles.info, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <Icon name="Star" size={18} color={theme.star} />
              <Text style={[styles.infoLabel, { color: theme.muted }]}>
                {t('place.rating')}
              </Text>
              <Text style={[styles.infoValue, { color: theme.ink }]}>
                {reviewAverage} / 5
              </Text>
            </View>
          </View>

          <View style={styles.reviewsHead}>
            <View>
              <Text style={[styles.reviewsKicker, { color: theme.kicker }]}>
                {t('place.community')}
              </Text>
              <Text style={[styles.reviewsTitle, { color: theme.ink }]}>
                {t('place.reviewsTitle')}
              </Text>
            </View>
            <View style={[styles.reviewAverage, { backgroundColor: theme.sand }]}>
              <Icon name="Star" size={13} color={theme.star} filled />
              <Text style={[styles.reviewAverageText, { color: theme.ink }]}>
                {reviewAverage}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.reviewForm,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Text style={[styles.reviewLabel, { color: theme.muted }]}>
              {t('place.yourRating')}
            </Text>
            <View style={styles.reviewStars}>
              {Array.from({ length: 5 }).map((_, index) => {
                const active = index < rating
                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.75}
                    onPress={() => setRating(index + 1)}
                    accessibilityLabel={t('place.stars', { count: index + 1 })}
                  >
                    <Icon
                      name="Star"
                      size={24}
                      color={active ? theme.star : theme.line}
                      filled={active}
                    />
                  </TouchableOpacity>
                )
              })}
            </View>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t('place.reviewPlaceholder')}
              placeholderTextColor={theme.muted}
              multiline
              style={[
                styles.reviewInput,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.line,
                  color: theme.ink,
                },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={submitReview}
              style={[
                styles.reviewSubmit,
                { backgroundColor: comment.trim() ? theme.forest : theme.line },
              ]}
            >
              <Icon
                name="Send"
                size={15}
                color={comment.trim() ? theme.lime : theme.muted}
              />
              <Text
                style={[
                  styles.reviewSubmitText,
                  { color: comment.trim() ? theme.lime : theme.muted },
                ]}
              >
                {t('place.publishReview')}
              </Text>
            </TouchableOpacity>
          </View>

          {reviews.length ? (
            <View style={styles.reviewList}>
              {reviews.map((review) => (
                <View
                  key={review.id}
                  style={[
                    styles.reviewItem,
                    { backgroundColor: theme.surface, borderColor: theme.line },
                  ]}
                >
                  <View style={styles.reviewItemHead}>
                    <View style={[styles.reviewAvatar, { backgroundColor: theme.sand }]}>
                      <Icon name="UserRound" size={15} color={theme.forest} />
                    </View>
                    <Text style={[styles.reviewAuthor, { color: theme.ink }]}>
                      {review.author || t('place.guest')}
                    </Text>
                    <View style={styles.reviewItemStars}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Icon
                          key={index}
                          name="Star"
                          size={10}
                          color={index < review.rating ? theme.star : theme.line}
                          filled={index < review.rating}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.reviewText, { color: theme.muted }]}>
                    {review.text}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.reviewEmpty, { backgroundColor: theme.sand }]}>
              <Icon name="MessagesSquare" size={19} color={theme.forest} />
              <Text style={[styles.reviewEmptyText, { color: theme.muted }]}>
                {t('place.emptyReview')}
              </Text>
            </View>
          )}

          <View style={[styles.map, { backgroundColor: theme.mapBg }]}>
            <View style={styles.mapLines}>
              <View style={[styles.mapLine, { backgroundColor: theme.hairline }]} />
              <View style={[styles.mapLine, { backgroundColor: theme.hairline }]} />
              <View style={[styles.mapLine, { backgroundColor: theme.hairline }]} />
            </View>
            <View style={[styles.pin, { backgroundColor: theme.forest }]}>
              <Icon name="MapPin" size={20} color={theme.lime} />
            </View>
            <View style={styles.mapCopy}>
              <Text style={[styles.mapTitle, { color: theme.ink }]}>
                {place.name}
              </Text>
              <Text style={[styles.mapText, { color: theme.muted }]}>
                {place.city} · Ceará
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                openUrl(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${place.name} ${place.city}`,
                  )}`,
                )
              }
              style={[styles.mapButton, { backgroundColor: theme.forest }]}
            >
              <Text style={[styles.mapButtonText, { color: theme.lime }]}>
                {t('place.openMap')}
              </Text>
              <Icon name="ChevronRight" size={15} color={theme.lime} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onSave}
            style={[
              styles.saveButton,
              saved
                ? { backgroundColor: theme.forest }
                : { borderColor: theme.line, backgroundColor: theme.surface },
            ]}
          >
            <Icon
              name="Heart"
              size={18}
              filled={saved}
              color={saved ? theme.lime : theme.forest}
            />
            <Text
              style={[
                styles.saveText,
                { color: saved ? theme.lime : theme.forest },
              ]}
            >
              {saved ? t('place.saved') : t('place.saveFavorite')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 36,
  },
  hero: {
    height: 320,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  overlayActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  overlayRight: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    marginLeft: 18,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  kicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 9,
  },
  description: {
    fontSize: 11,
    lineHeight: 18,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 14,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 8,
    fontWeight: '800',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 18,
  },
  info: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 11,
    gap: 5,
  },
  infoLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  reviewsHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
  },
  reviewsKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  reviewAverage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  reviewAverageText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reviewForm: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  reviewLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 7,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 11,
    minHeight: 70,
    paddingHorizontal: 11,
    paddingTop: 10,
    fontSize: 11,
    textAlignVertical: 'top',
  },
  reviewSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 11,
    paddingVertical: 11,
    marginTop: 9,
  },
  reviewSubmitText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reviewList: {
    gap: 8,
    marginTop: 10,
  },
  reviewItem: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 11,
  },
  reviewItemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAuthor: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
  },
  reviewItemStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 7,
  },
  reviewEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 13,
    padding: 12,
    marginTop: 10,
  },
  reviewEmptyText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  map: {
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'flex-end',
  },
  mapLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-evenly',
    transform: [{ rotate: '-12deg' }],
  },
  mapLine: {
    height: 1,
    opacity: 0.8,
  },
  pin: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCopy: {
    marginBottom: 10,
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  mapText: {
    fontSize: 9,
    marginTop: 2,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  mapButtonText: {
    fontSize: 10,
    fontWeight: '800',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 16,
  },
  saveText: {
    fontSize: 11,
    fontWeight: '800',
  },
})
