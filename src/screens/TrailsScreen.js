import { useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from '../i18n'
import { useTheme } from '../theme'
import { imageSource, openUrl } from '../utils'
import { sertaoCentralCities } from '../data'
import AppModal from '../components/AppModal'
import CityPicker from '../components/CityPicker'
import ContentCard from '../components/ContentCard'
import Header from '../components/Header'
import Icon from '../components/Icon'

const levels = ['Todas', 'Fácil', 'Moderada', 'Difícil']

export default function TrailsScreen({
  trails = [],
  city,
  onChangeCity,
  onNotifications,
  unread,
  onOpenOfflineMap,
  onBack,
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [level, setLevel] = useState('Todas')
  const [selectedTrail, setSelectedTrail] = useState(null)
  const cities = [...new Set([...sertaoCentralCities, ...trails.map((trail) => trail.city)])]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
  const visibleTrails = trails.filter((trail) => {
    if (trail.city !== city) return false
    if (level !== 'Todas' && trail.level !== level) return false
    return true
  })

  function openTrailOnMap(trail) {
    const latitude = Number(trail.latitude)
    const longitude = Number(trail.longitude)
    const focus = {
      name: trail.name,
      place: trail.place,
      city,
      description: `Localização da ${trail.name} em ${trail.place || city}.`,
    }
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      focus.latitude = latitude
      focus.longitude = longitude
    }
    setSelectedTrail(null)
    onOpenOfflineMap?.(focus)
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={t('trails.title')}
        subtitle={t('trails.subtitle')}
        onBack={onBack}
        onNotifications={onNotifications}
        unread={unread}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.intro, { backgroundColor: theme.sand }]}>
          <View style={[styles.introIcon, { backgroundColor: theme.forest }]}>
            <Icon name="Mountain" size={23} color={theme.lime} />
          </View>
          <View style={styles.introCopy}>
            <Text style={[styles.introKicker, { color: theme.kicker }]}>
              {t('trails.introKicker')}
            </Text>
            <Text style={[styles.introTitle, { color: theme.ink }]}>
              {t('trails.introTitle')}
            </Text>
            <Text style={[styles.introText, { color: theme.muted }]}>
              Contrate guias credenciados, leve água e respeite as sinalizações de cada percurso.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => onOpenOfflineMap?.()}
          style={[
            styles.offline,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <View style={[styles.offlineIcon, { backgroundColor: theme.forest }]}>
            <Icon name="Map" size={21} color={theme.lime} />
          </View>
          <View style={styles.offlineCopy}>
            <Text style={[styles.offlineTitle, { color: theme.ink }]}>
              {t('trails.offlineTitle')}
            </Text>
            <Text style={[styles.offlineText, { color: theme.muted }]}>
              {t('trails.offlineText')}
            </Text>
          </View>
          <Icon name="ChevronRight" size={18} color={theme.muted} />
        </TouchableOpacity>

        <CityPicker cities={cities} city={city} onChangeCity={onChangeCity} />

        <Text style={[styles.filterLabel, { color: theme.muted }]}>{t('trails.level')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {levels.map((item) => {
            const active = level === item
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                onPress={() => setLevel(item)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.forest : theme.surface,
                    borderColor: active ? theme.forest : theme.line,
                  },
                ]}
              >
                <Text
                  style={[styles.chipText, { color: active ? theme.lime : theme.muted }]}
                >
                  {item === 'Todas' ? t('trails.all') : item}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {visibleTrails.length === 0 ? (
          <View
            style={[
              styles.emptyTrails,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Icon name="Mountain" size={20} color={theme.muted} />
            <Text style={[styles.emptyTrailsText, { color: theme.muted }]}>
              Nenhuma trilha cadastrada em {city} para este nível.
            </Text>
          </View>
        ) : null}

        {visibleTrails.map((trail) => (
          <ContentCard
            key={trail.id ?? trail.name}
            image={trail.image}
            imageHeight={172}
            badge={trail.level}
            badgeIcon="Mountain"
            title={trail.name}
            subtitle={trail.place}
            onPress={() => setSelectedTrail(trail)}
            actionLabel={t('trails.details')}
          >
            <View style={[styles.stats, { borderColor: theme.line }]}>
              <View style={styles.stat}>
                <Icon name="Route" size={16} color={theme.forest} />
                <Text style={[styles.statValue, { color: theme.ink }]}>{trail.distance}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>distância</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.line }]} />
              <View style={styles.stat}>
                <Icon name="Clock3" size={16} color={theme.forest} />
                <Text style={[styles.statValue, { color: theme.ink }]}>{trail.time}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>duração</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: theme.line }]} />
              <View style={styles.stat}>
                <Icon name="Mountain" size={16} color={theme.forest} />
                <Text style={[styles.statValue, { color: theme.ink }]}>{trail.gain}</Text>
                <Text style={[styles.statLabel, { color: theme.muted }]}>elevação</Text>
              </View>
            </View>
          </ContentCard>
        ))}
      </ScrollView>

      <AppModal
        visible={Boolean(selectedTrail)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTrail(null)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setSelectedTrail(null)}
            accessibilityLabel="Fechar detalhes da trilha"
          />
          <View style={[styles.modalSheet, { backgroundColor: theme.paper }]}>
            {selectedTrail ? (
              <>
                <View style={[styles.modalImageWrap, { backgroundColor: theme.sand }]}>
                  <Image
                    source={imageSource(selectedTrail.image) ?? imageSource('environment')}
                    style={styles.modalImage}
                    resizeMode="cover"
                    pointerEvents="none"
                  />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setSelectedTrail(null)}
                    style={[styles.modalClose, { backgroundColor: 'rgba(255,255,255,0.92)' }]}
                  >
                    <Icon name="X" size={18} color={theme.forest} />
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.modalImageCopy,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <Text style={[styles.modalPlace, { color: theme.muted }]}>
                      {selectedTrail.place || selectedTrail.city || city}
                    </Text>
                    <Text style={[styles.modalTitle, { color: theme.ink }]}>
                      {selectedTrail.name}
                    </Text>
                  </View>
                </View>

                <ScrollView
                  style={styles.modalBodyScroll}
                  contentContainerStyle={[
                    styles.modalBody,
                    { paddingBottom: Math.max(insets.bottom, 16) },
                  ]}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={[styles.modalDescription, { color: theme.muted }]}>
                    Percurso {(selectedTrail.level || 'moderada').toLowerCase()} com{' '}
                    {selectedTrail.distance || 'extens�o vari�vel'}, cerca de{' '}
                    {selectedTrail.time || '1h'} e {selectedTrail.gain || 'eleva��o leve'}.
                  </Text>

                  <View style={styles.modalStats}>
                    {[
                      ['Nível', selectedTrail.level || 'Moderada'],
                      ['Distância', selectedTrail.distance || '—'],
                      ['Tempo', selectedTrail.time || '—'],
                    ].map(([label, value]) => (
                      <View
                        key={label}
                        style={[styles.modalStat, { backgroundColor: theme.sand }]}
                      >
                        <Text style={[styles.modalStatLabel, { color: theme.muted }]}>
                          {label}
                        </Text>
                        <Text style={[styles.modalStatValue, { color: theme.ink }]}>
                          {value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <Text style={[styles.modalTip, { color: theme.muted }]}>
                    Leve água, protetor solar e calçado fechado. Evite horários de sol forte.
                  </Text>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() =>
                        openUrl(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${selectedTrail.name} ${selectedTrail.place || city}`,
                          )}`,
                        )
                      }
                      style={[styles.modalPrimary, { backgroundColor: theme.forest }]}
                    >
                      <Icon name="Navigation" size={16} color={theme.lime} />
                      <Text style={[styles.modalPrimaryText, { color: theme.lime }]}>
                        Ver no mapa
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() => openTrailOnMap(selectedTrail)}
                      style={[styles.modalSecondary, { borderColor: theme.line }]}
                    >
                      <Icon name="Map" size={16} color={theme.forest} />
                      <Text style={[styles.modalSecondaryText, { color: theme.forest }]}>
                        Abrir mapa offline
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </AppModal>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 104,
    gap: 14,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 14,
  },
  introIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introCopy: {
    flex: 1,
  },
  introKicker: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  introTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  introText: {
    fontSize: 9,
    lineHeight: 14,
  },
  filters: {
    gap: 7,
    paddingRight: 6,
  },
  filterLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: -6,
  },
  emptyTrails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  emptyTrailsText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 11,
    paddingTop: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 8,
  },
  divider: {
    width: 1,
    height: 30,
  },
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  offlineIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineCopy: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  offlineText: {
    fontSize: 9,
    marginTop: 2,
    lineHeight: 13,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
  },
  modalImageWrap: {
    height: 280,
  },
  modalImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  modalClose: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageCopy: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    maxWidth: '78%',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  modalPlace: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  modalBodyScroll: {
    flexShrink: 1,
  },
  modalBody: {
    padding: 16,
    gap: 10,
  },
  modalActions: {
    gap: 10,
  },
  modalDescription: {
    fontSize: 10,
    lineHeight: 15,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 8,
  },
  modalStat: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  modalStatLabel: {
    fontSize: 7,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalStatValue: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  modalTip: {
    fontSize: 9,
    lineHeight: 14,
  },
  modalPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    paddingVertical: 13,
  },
  modalPrimaryText: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  modalSecondaryText: {
    fontSize: 10,
    fontWeight: '800',
  },
})
