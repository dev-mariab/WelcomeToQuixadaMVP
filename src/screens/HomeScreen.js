import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from '../i18n'
import { useTheme } from '../theme'
import { images, sertaoCentralCities } from '../data'
import AppModal from '../components/AppModal'
import ContentCard from '../components/ContentCard'
import Header from '../components/Header'
import Icon from '../components/Icon'
import PlaceCard from '../components/PlaceCard'

const quickLinks = [
  { labelKey: 'home.quick.atrativos', icon: 'MapPin', tab: 'explorar' },
  { labelKey: 'home.quick.trilhas', icon: 'Mountain', tab: 'trilhas' },
  { labelKey: 'home.quick.guias', icon: 'UserRound', tab: 'guias' },
  { labelKey: 'home.quick.agenda', icon: 'CalendarDays', tab: 'agenda' },
]

function weatherFor(cityName = '') {
  const seed = Array.from(cityName).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  )
  const temperature = 28 + (seed % 6)
  const wind = 10 + (seed % 15)
  const humidity = 38 + (seed % 21)
  const conditions = ['Ensolarado', 'Parcialmente nublado', 'Céu aberto com vento']
  const condition = conditions[seed % conditions.length]
  return {
    temp: `${temperature}°`,
    text: `${condition} · Vento ${wind} km/h · Umidade ${humidity}%`,
  }
}

export default function HomeScreen({
  events,
  places,
  trails = [],
  saved,
  onToggleSave,
  onOpenPlace,
  onNavigate,
  onNotifications,
  unread,
  name,
  city: selectedCity,
  onChangeCity,
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const city = selectedCity ?? 'Quixadá'
  const [cityPickerOpen, setCityPickerOpen] = useState(false)

  const cities = [
    ...new Set([
      ...sertaoCentralCities,
      ...places.map((place) => place.city),
      ...events.map((event) => event.city),
    ]),
  ]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  const cityPlaces = places.filter((place) => place.city === city)
  const cityTrails = trails.filter((trail) => trail.city === city)
  const highlights = cityPlaces.slice(0, 6)
  const cityEvents = events.filter((event) => event.city === city)
  const nextEvent = cityEvents[0]
  const weather = weatherFor(city)
  const firstName = (name || 'visitante').split(' ')[0]

  return (
    <View style={{ flex: 1 }}>
      <Header
        subtitle={t('home.subtitle', { name: firstName })}
        subtitleStyle={styles.headerSubtitle}
        onNotifications={onNotifications}
        unread={unread}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setCityPickerOpen(true)}
          style={[
            styles.citySelector,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <View style={[styles.citySelectorIcon, { backgroundColor: theme.sand }]}>
            <Icon name="MapPin" size={19} color={theme.forest} />
          </View>
          <View style={styles.citySelectorCopy}>
            <Text style={[styles.citySelectorLabel, { color: theme.muted }]}>
              {t('home.cityLabel')}
            </Text>
            <Text style={[styles.citySelectorName, { color: theme.ink }]}>{city}</Text>
          </View>
          <Text style={[styles.citySelectorAction, { color: theme.forest }]}>
            {t('home.change')}
          </Text>
          <Icon name="ChevronDown" size={16} color={theme.forest} />
        </TouchableOpacity>

        <View style={[styles.weather, { backgroundColor: theme.sand }]}>
          <View style={[styles.weatherIcon, { backgroundColor: theme.softOrange }]}>
            <Icon name="CloudSun" size={21} color={theme.onOrange} />
          </View>
          <View style={styles.weatherCopy}>
            <Text style={[styles.weatherTitle, { color: theme.ink }]}>
              Clima agora em {city}
            </Text>
            <Text style={[styles.weatherText, { color: theme.muted }]}>
              {weather.text}
            </Text>
          </View>
          <Text style={[styles.temperature, { color: theme.ink }]}>{weather.temp}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate('explorar')}
          style={[
            styles.search,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <Icon name="Search" size={18} color={theme.muted} />
          <Text style={[styles.searchText, { color: theme.muted }]}>
            {t('home.search')}
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionHead}>
          <View>
            <Text style={[styles.sectionKicker, { color: theme.kicker }]}>
              {t('home.startKicker')}
            </Text>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>
              {t('home.startTitle')}
            </Text>
          </View>
        </View>

        <View style={styles.quickRow}>
          {quickLinks.map((link) => (
            <TouchableOpacity
              key={link.labelKey}
              activeOpacity={0.85}
              onPress={() => onNavigate(link.tab)}
              style={[styles.quick, { backgroundColor: theme.surface, borderColor: theme.line }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: theme.sand }]}>
                <Icon name={link.icon} size={20} color={theme.forest} />
              </View>
              <Text style={[styles.quickLabel, { color: theme.ink }]}>
                {t(link.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <View>
            <Text style={[styles.sectionKicker, { color: theme.kicker }]}>
              {t('home.highlightsKicker')}
            </Text>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>
              {t('home.highlightsTitle')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onNavigate('explorar')} activeOpacity={0.7}>
            <Text style={[styles.link, { color: theme.forest }]}>{t('home.seeAll')}</Text>
          </TouchableOpacity>
        </View>

        {highlights.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cards}
          >
            {highlights.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                width={250}
                imageHeight={150}
                horizontal
                overlayCity
                saved={saved.includes(place.id)}
                onSave={() => onToggleSave(place)}
                onOpen={() => onOpenPlace(place)}
              />
            ))}
          </ScrollView>
        ) : (
          <View
            style={[
              styles.eventCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Icon name="Compass" size={20} color={theme.muted} />
            <Text style={[styles.eventMetaText, { color: theme.muted }]}>
              Nenhum atrativo cadastrado em {city} ainda.
            </Text>
          </View>
        )}

        <ContentCard
          image={cityTrails[0]?.image ?? images.environment}
          imageHeight={172}
          badge="Aventura"
          badgeIcon="Mountain"
          title="Trilhas para sentir o sertão"
          description="Rotas, dificuldade e segurança na palma da mão."
          actionLabel="Ver trilhas"
          onPress={() => onNavigate('trilhas')}
          style={{ marginTop: 16 }}
        />

        <View style={styles.sectionHead}>
          <View>
            <Text style={[styles.sectionKicker, { color: theme.kicker }]}>
              {t('home.eventsKicker')}
            </Text>
            <Text style={[styles.sectionTitle, { color: theme.ink }]}>
              {t('home.eventsTitle')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => onNavigate('agenda')} activeOpacity={0.7}>
            <Text style={[styles.link, { color: theme.forest }]}>{t('home.agenda')}</Text>
          </TouchableOpacity>
        </View>

        {nextEvent ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onNavigate('agenda')}
            style={[
              styles.eventCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <View style={[styles.eventDate, { backgroundColor: theme.lime }]}>
              <Text style={styles.eventDay}>{nextEvent.day}</Text>
              <Text style={styles.eventMonth}>{nextEvent.month}</Text>
            </View>
            <View style={styles.eventCopy}>
              <Text style={[styles.eventCategory, { color: theme.kicker }]}>
                {nextEvent.category} · {nextEvent.time}
              </Text>
              <Text style={[styles.eventTitle, { color: theme.ink }]}>{nextEvent.title}</Text>
              <View style={styles.eventMeta}>
                <Icon name="MapPin" size={13} color={theme.muted} />
                <Text style={[styles.eventMetaText, { color: theme.muted }]}>
                  {nextEvent.place} · {nextEvent.city}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.eventCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Icon name="CalendarDays" size={20} color={theme.muted} />
            <Text style={[styles.eventMetaText, { color: theme.muted }]}>
              Nenhum evento programado em {city} no momento.
            </Text>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onNavigate('servicos')}
          style={[styles.cta, { borderColor: theme.line, backgroundColor: theme.sand }]}
        >
          <View style={styles.ctaCopy}>
            <Text style={[styles.ctaKicker, { color: theme.kicker }]}>
              {t('home.planKicker')}
            </Text>
            <Text style={[styles.ctaTitle, { color: theme.ink }]}>
              {t('home.planTitle')}
            </Text>
            <Text style={[styles.ctaText, { color: theme.muted }]}>
              {t('home.planText')}
            </Text>
          </View>
          <View style={[styles.ctaIcon, { backgroundColor: theme.forest }]}>
            <Icon name="Route" size={22} color={theme.lime} />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <AppModal
        visible={cityPickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCityPickerOpen(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setCityPickerOpen(false)}
            accessibilityLabel="Fechar seleção de cidade"
          />
          <View style={[styles.modalSheet, { backgroundColor: theme.paper }]}>
            <View style={styles.modalHead}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalKicker, { color: theme.kicker }]}>
                  SERTÃO CENTRAL
                </Text>
                <Text style={[styles.modalTitle, { color: theme.ink }]}>
                  Escolha a cidade
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setCityPickerOpen(false)}
                activeOpacity={0.8}
                style={[styles.modalClose, { backgroundColor: theme.sand }]}
              >
                <Icon name="X" size={18} color={theme.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalListContent}
            >
              {cities.map((item) => {
                const active = item === city
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.85}
                    onPress={() => {
                      onChangeCity?.(item)
                      setCityPickerOpen(false)
                    }}
                    style={[
                      styles.cityOption,
                      {
                        backgroundColor: active ? theme.sand : theme.surface,
                        borderColor: active ? theme.forest : theme.line,
                      },
                    ]}
                  >
                    <Icon name="MapPin" size={18} color={theme.forest} />
                    <Text style={[styles.cityOptionText, { color: theme.ink }]}>
                      {item}
                    </Text>
                    {active ? <Icon name="Check" size={18} color={theme.forest} /> : null}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </AppModal>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 104,
  },
  headerSubtitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  weather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 16,
    padding: 12,
    marginTop: 13,
  },
  weatherIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherCopy: {
    flex: 1,
  },
  weatherTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  weatherText: {
    fontSize: 9,
    marginTop: 2,
  },
  temperature: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  searchText: {
    fontSize: 11,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  quick: {
    flexBasis: '47%',
    maxWidth: '49%',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  link: {
    fontSize: 10,
    fontWeight: '800',
  },
  cards: {
    paddingBottom: 6,
    paddingRight: 6,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
  },
  eventDate: {
    width: 56,
    height: 62,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDay: {
    color: '#3b120d',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  eventMonth: {
    color: '#3b120d',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  eventCopy: {
    flex: 1,
  },
  eventCategory: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginVertical: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 9,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
  },
  ctaCopy: {
    flex: 1,
  },
  ctaKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginBottom: 5,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  ctaText: {
    fontSize: 9,
    marginTop: 4,
    lineHeight: 14,
  },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 11,
    marginBottom: 13,
  },
  citySelectorIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  citySelectorCopy: {
    flex: 1,
  },
  citySelectorLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  citySelectorName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  citySelectorAction: {
    fontSize: 9,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 8,
  },
  modalList: {
    maxHeight: 380,
  },
  modalListContent: {
    gap: 8,
    paddingBottom: 4,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  modalKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  cityOptionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
})
