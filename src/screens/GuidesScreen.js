import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '../theme'
import { useTranslation } from '../i18n'
import { imageSource, openUrl } from '../utils'
import Header from '../components/Header'
import Icon from '../components/Icon'

const tone = {
  green: { bg: 'softGreen', fg: 'onGreen' },
  orange: { bg: 'softOrange', fg: 'onOrange' },
  blue: { bg: 'softBlue', fg: 'onBlue' },
}

function whatsappNumber(phone = '') {
  const digits = String(phone).replace(/\D/g, '')
  if (!digits) return ''
  return digits.startsWith('55') ? digits : `55${digits}`
}

export default function GuidesScreen({ guides, city, onNotifications, unread, onBack }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const cityGuides = guides.filter((guide) => guide.city === city)
  return (
    <View style={{ flex: 1 }}>
      <Header
        title={t('guides.title')}
        subtitle={t('guides.subtitle')}
        onBack={onBack}
        onNotifications={onNotifications}
        unread={unread}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.intro, { backgroundColor: theme.sand }]}>
          <View style={[styles.introIcon, { backgroundColor: theme.softGreen }]}>
            <Icon name="ShieldCheck" size={21} color={theme.onGreen} />
          </View>
          <Text style={[styles.introText, { color: theme.muted }]}>
            {t('guides.intro')}
          </Text>
        </View>

        {cityGuides.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Icon name="UserRound" size={20} color={theme.muted} />
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Nenhum guia cadastrado em {city} no momento.
            </Text>
          </View>
        ) : null}

        {cityGuides.map((guide) => {
          const colors = tone[guide.color] ?? tone.green
          const phone = whatsappNumber(guide.phone)
          return (
            <View
              key={guide.id ?? guide.name}
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <View style={styles.head}>
                <View style={[styles.avatar, { backgroundColor: theme[colors.bg] }]}>
                  {guide.image ? (
                    <Image
                      source={imageSource(guide.image)}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={[styles.initials, { color: theme[colors.fg] }]}>
                      {guide.initials}
                    </Text>
                  )}
                </View>
                <View style={styles.headCopy}>
                  <Text style={[styles.name, { color: theme.ink }]}>{guide.name}</Text>
                  <Text style={[styles.role, { color: theme.muted }]}>
                    {guide.role}
                    {guide.city ? ` · ${guide.city}` : ''}
                  </Text>
                  {guide.phone ? (
                    <View style={styles.phoneRow}>
                      <Icon name="Phone" size={11} color={theme.forest} />
                      <Text style={[styles.phoneText, { color: theme.forest }]}>
                        {guide.phone}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.rating}>
                    <Icon name="Star" size={13} color={theme.star} filled />
                    <Text style={[styles.ratingValue, { color: theme.ink }]}>
                      {guide.rating}
                    </Text>
                    <Text style={[styles.ratingCount, { color: theme.muted }]}>
                      {t('guides.reviews', { count: guide.reviews })}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.chips}>
                {(guide.specialties ?? []).map((item) => (
                  <View
                    key={item}
                    style={[styles.chip, { backgroundColor: theme[colors.bg] }]}
                  >
                    <Text style={[styles.chipText, { color: theme[colors.fg] }]}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.meta, { borderColor: theme.line }]}>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.muted }]}>
                    {t('guides.cadastur')}
                  </Text>
                  <Text style={[styles.metaValue, { color: theme.ink }]}>{guide.cadastur}</Text>
                </View>
                <View style={[styles.metaDivider, { backgroundColor: theme.line }]} />
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.muted }]}>
                    {t('guides.experience')}
                  </Text>
                  <Text style={[styles.metaValue, { color: theme.ink }]}>{guide.experience}</Text>
                </View>
              </View>

              {phone ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    openUrl(
                      `https://wa.me/${phone}?text=${encodeURIComponent(
                        `Olá, ${guide.name}! Encontrei seu perfil no aplicativo e gostaria de saber mais sobre seus passeios.`,
                      )}`,
                    )
                  }
                  style={[styles.contact, { backgroundColor: theme.forest }]}
                >
                  <Icon name="MessageCircle" size={16} color={theme.lime} />
                  <Text style={[styles.contactText, { color: theme.lime }]}>
                    {t('guides.whatsapp')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 104,
    gap: 13,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 16,
    padding: 13,
  },
  introIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  emptyText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headCopy: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
  },
  role: {
    fontSize: 9,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 9,
    fontWeight: '800',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  ratingValue: {
    fontSize: 10,
    fontWeight: '800',
  },
  ratingCount: {
    fontSize: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 8,
    fontWeight: '800',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  metaLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaDivider: {
    width: 1,
    height: 24,
  },
  contact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  contactText: {
    fontSize: 10,
    fontWeight: '800',
  },
})
