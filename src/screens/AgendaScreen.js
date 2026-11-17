import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '../theme'
import { useTranslation } from '../i18n'
import { openUrl } from '../utils'
import Header from '../components/Header'
import Icon from '../components/Icon'

const tone = {
  orange: { bg: 'softOrange', fg: 'onOrange' },
  green: { bg: 'softGreen', fg: 'onGreen' },
  blue: { bg: 'softBlue', fg: 'onBlue' },
}

const months = ['Todos', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

export default function AgendaScreen({
  events,
  city,
  onNotifications,
  unread,
  onToast,
  onBack,
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const currentYear = String(new Date().getFullYear())
  const [category, setCategory] = useState('Todos')
  const [monthFilter, setMonthFilter] = useState('Todos')
  const [yearFilter, setYearFilter] = useState(currentYear)
  const cityEvents = useMemo(
    () => events.filter((event) => event.city === city),
    [events, city],
  )
  const categories = useMemo(
    () => ['Todos', ...new Set(cityEvents.map((event) => event.category).filter(Boolean))],
    [cityEvents],
  )
  const years = useMemo(
    () => [
      'Todos',
      ...new Set([
        currentYear,
        ...cityEvents.map((event) => String(event.year || currentYear)),
      ]),
    ],
    [cityEvents, currentYear],
  )
  const activeCategory = categories.includes(category) ? category : 'Todos'
  const filtered = cityEvents.filter((event) => {
    if (activeCategory !== 'Todos' && event.category !== activeCategory) return false
    if (monthFilter !== 'Todos' && event.month !== monthFilter) return false
    const eventYear = String(event.year || currentYear)
    if (yearFilter !== 'Todos' && eventYear !== yearFilter) return false
    return true
  })

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={t('agenda.title')}
        subtitle={t('agenda.subtitle')}
        onBack={onBack}
        onNotifications={onNotifications}
        unread={unread}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.intro, { borderColor: theme.line }]}>
          <Icon name="CalendarDays" size={17} color={theme.forest} />
          <Text style={[styles.introText, { color: theme.muted }]}>
            {t('agenda.intro')}
          </Text>
        </View>

        <View style={styles.monthRow}>
          <Text style={[styles.monthLabel, { color: theme.kicker }]}>
            {t('agenda.kicker')}
          </Text>
          <Text style={[styles.monthValue, { color: theme.ink }]}>
            {monthFilter === 'Todos' ? t('explore.all') : monthFilter} ·{' '}
            {yearFilter === 'Todos' ? t('explore.all') : yearFilter}
          </Text>
        </View>

        <Text style={[styles.filterLabel, { color: theme.muted }]}>MÊS</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {months.map((item) => {
            const active = monthFilter === item
            return (
              <TouchableOpacity
                key={`month-${item}`}
                activeOpacity={0.85}
                onPress={() => setMonthFilter(item)}
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
                  {item === 'Todos' ? t('explore.all') : item}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <Text style={[styles.filterLabel, { color: theme.muted }]}>ANO</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {years.map((item) => {
            const active = yearFilter === item
            return (
              <TouchableOpacity
                key={`year-${item}`}
                activeOpacity={0.85}
                onPress={() => setYearFilter(item)}
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
                  {item === 'Todos' ? t('explore.all') : item}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {categories.map((item) => {
            const active = activeCategory === item
            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.85}
                onPress={() => setCategory(item)}
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
                  {item === 'Todos' ? t('explore.all') : item}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {filtered.length === 0 ? (
          <View
            style={[
              styles.empty,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Icon name="CalendarDays" size={20} color={theme.muted} />
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Nenhum evento programado em {city} no momento.
            </Text>
          </View>
        ) : null}

        {filtered.map((event) => {
          const colors = tone[event.color] ?? tone.orange
          return (
            <View
              key={event.id ?? event.title}
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <View style={styles.head}>
                <View style={[styles.date, { backgroundColor: theme[colors.bg] }]}>
                  <Text style={[styles.day, { color: theme[colors.fg] }]}>{event.day}</Text>
                  <Text style={[styles.month, { color: theme[colors.fg] }]}>{event.month}</Text>
                </View>
                <View style={styles.headCopy}>
                  <Text style={[styles.category, { color: theme.kicker }]}>
                    {event.category} · {event.time}
                  </Text>
                  <Text style={[styles.title, { color: theme.ink }]}>{event.title}</Text>
                </View>
              </View>

              <View style={[styles.place, { backgroundColor: theme.sand }]}>
                <Icon name="MapPin" size={15} color={theme.forest} />
                <View style={styles.placeCopy}>
                  <Text style={[styles.placeName, { color: theme.ink }]}>{event.place}</Text>
                  <Text style={[styles.placeCity, { color: theme.muted }]}>{event.city}</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  onToast?.(t('agenda.interestToast', { title: event.title }))
                }
                style={[styles.interest, { backgroundColor: theme.forest }]}
              >
                <Icon name="Heart" size={15} color={theme.lime} />
                <Text style={[styles.interestText, { color: theme.lime }]}>
                  {t('agenda.interest')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  openUrl(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${event.place} ${event.city}`,
                    )}`,
                  )
                }
                style={[styles.action, { borderColor: theme.line }]}
              >
                <Icon name="Navigation" size={15} color={theme.forest} />
                <Text style={[styles.actionText, { color: theme.forest }]}>
                  {t('agenda.directions')}
                </Text>
              </TouchableOpacity>
            </View>
          )
        })}

        <View style={[styles.footer, { backgroundColor: theme.sand }]}>
          <Icon name="Bell" size={18} color={theme.forest} />
          <Text style={[styles.footerText, { color: theme.muted }]}>
            {t('agenda.footer')}
          </Text>
        </View>
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
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  introText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  monthLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  monthValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  filterLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginTop: -4,
  },
  filters: {
    gap: 7,
    paddingRight: 6,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '800',
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
  date: {
    width: 54,
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  month: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headCopy: {
    flex: 1,
  },
  category: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  place: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 12,
    padding: 11,
    marginTop: 13,
  },
  placeCopy: {
    flex: 1,
  },
  placeName: {
    fontSize: 10,
    fontWeight: '700',
  },
  placeCity: {
    fontSize: 8,
    marginTop: 2,
  },
  interest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 11,
    paddingVertical: 10,
    marginTop: 11,
  },
  interestText: {
    fontSize: 10,
    fontWeight: '800',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 9,
    marginTop: 11,
  },
  actionText: {
    fontSize: 9,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 13,
  },
  footerText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
})
