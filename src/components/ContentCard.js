import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '../theme'
import { imageSource } from '../utils'
import Icon from './Icon'

export default function ContentCard({
  image,
  imageHeight = 172,
  imageResizeMode = 'cover',
  showImage = true,
  badge,
  badgeIcon = 'MapPin',
  title,
  subtitle,
  description,
  meta = [],
  locationLabel,
  locationIcon = 'MapPin',
  cornerLabel,
  cornerIcon = 'Navigation',
  saved = false,
  onSave,
  onPress,
  actionLabel,
  children,
  width = '100%',
  horizontal = false,
  style,
}) {
  const theme = useTheme()
  const badgeNode = badge ? (
    <View
      style={[
        styles.badge,
        !showImage && styles.badgeInline,
        { borderColor: theme.line },
      ]}
    >
      <Icon name={badgeIcon} size={11} color={theme.forestDark} />
      <Text style={[styles.badgeText, { color: theme.forestDark }]} numberOfLines={1}>
        {badge}
      </Text>
    </View>
  ) : null
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[
        styles.card,
        {
          width,
          backgroundColor: theme.surface,
          borderColor: theme.line,
          marginRight: horizontal ? 13 : 0,
        },
        style,
      ]}
    >
      {showImage ? (
        <View style={[styles.imageWrap, { height: imageHeight, backgroundColor: theme.sand }]}>
          <ImageBackground
            source={imageSource(image) ?? imageSource('environment')}
            style={styles.imageBackground}
            imageStyle={styles.imageBackgroundImage}
            resizeMode={imageResizeMode}
          >
            {badgeNode}
          {onSave ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              onPress={onSave}
              activeOpacity={0.85}
              style={[
                styles.save,
                { backgroundColor: saved ? theme.forest : theme.paper },
              ]}
            >
              <Icon
                name="Heart"
                size={18}
                filled={saved}
                color={saved ? theme.lime : theme.forest}
              />
            </TouchableOpacity>
          ) : null}
            {locationLabel || cornerLabel ? (
              <View
                style={[
                  styles.imageFooter,
                  locationLabel && cornerLabel && styles.imageFooterSpread,
                ]}
              >
                {locationLabel ? (
                  <View style={[styles.chip, { backgroundColor: theme.paper }]}>
                    <Icon name={locationIcon} size={12} color={theme.forest} />
                    <Text style={[styles.chipText, { color: theme.ink }]} numberOfLines={1}>
                      {locationLabel}
                    </Text>
                  </View>
                ) : null}
                {cornerLabel ? (
                  <View style={[styles.chip, { backgroundColor: theme.paper }]}>
                    <Icon name={cornerIcon} size={12} color={theme.forest} />
                    <Text style={[styles.chipText, { color: theme.ink }]} numberOfLines={1}>
                      {cornerLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </ImageBackground>
        </View>
      ) : null}

      <View style={styles.body}>
        {!showImage ? badgeNode : null}
        <Text style={[styles.title, { color: theme.ink }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.muted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta.length ? (
          <View style={styles.meta}>
            {meta.map((item, index) => (
              <View key={`${item.text}-${index}`} style={styles.metaItem}>
                {index > 0 ? (
                  <Text style={[styles.metaDot, { color: theme.muted }]}>•</Text>
                ) : null}
                <Icon
                  name={item.icon}
                  size={13}
                  color={item.color ?? theme.muted}
                  filled={item.filled}
                />
                <Text style={[styles.metaText, { color: theme.muted }]} numberOfLines={1}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {description ? (
          <Text style={[styles.description, { color: theme.muted }]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        {children}
        {actionLabel ? (
          <View style={[styles.action, { borderColor: theme.line }]}>
            <Text style={[styles.actionText, { color: theme.forest }]}>{actionLabel}</Text>
            <Icon name="ChevronRight" size={15} color={theme.forest} />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageWrap: {
    width: '100%',
    position: 'relative',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  imageBackgroundImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    left: 11,
    top: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeInline: {
    position: 'relative',
    left: 0,
    top: 0,
    alignSelf: 'flex-start',
    marginBottom: 9,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  save: {
    position: 'absolute',
    right: 11,
    top: 11,
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFooter: {
    marginHorizontal: 11,
    marginBottom: 10,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  imageFooterSpread: {
    justifyContent: 'space-between',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    maxWidth: '100%',
    flexShrink: 1,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    flexShrink: 1,
  },
  body: {
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
    marginTop: 7,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDot: {
    fontSize: 10,
    marginRight: 2,
  },
  metaText: {
    fontSize: 10,
  },
  description: {
    marginTop: 7,
    fontSize: 10,
    lineHeight: 15,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  actionText: {
    fontSize: 10,
    fontWeight: '800',
  },
})
