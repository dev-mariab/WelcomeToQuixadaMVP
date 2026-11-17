import { useMemo, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useTheme } from '../theme'
import { useTranslation } from '../i18n'
import { sertaoCentralCities } from '../data'
import CityPicker from '../components/CityPicker'
import Header from '../components/Header'
import Icon from '../components/Icon'
import PlaceCard from '../components/PlaceCard'

const baseCategories = ['Todos', 'Monólitos', 'Aventura', 'História', 'Religioso', 'Ecoturismo']

export default function ExploreScreen({
  places,
  saved,
  categories = [],
  city,
  onChangeCity,
  onToggleSave,
  onOpenPlace,
  onNotifications,
  unread,
  onBack,
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')

  const allCategories = useMemo(() => {
    const extra = [
      ...categories,
      ...places.map((place) => place.category),
    ].filter((value) => value && !baseCategories.includes(value))
    return [...baseCategories, ...new Set(extra)]
  }, [places, categories])

  const cities = useMemo(() => {
    const unique = [
      ...new Set([...sertaoCentralCities, ...places.map((place) => place.city)]),
    ]
    return unique.filter(Boolean).sort((a, b) => a.localeCompare(b))
  }, [places])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return places.filter((place) => {
      if (place.city !== city) return false
      const matchesCategory = category === 'Todos' || place.category === category
      if (!matchesCategory) return false
      if (!term) return true
      const haystack = [place.name, place.city, place.category, ...(place.tags ?? [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [places, query, category, city])

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={t('explore.title')}
        subtitle={t('explore.subtitle')}
        onBack={onBack}
        onNotifications={onNotifications}
        unread={unread}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.search,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <Icon name="Search" size={18} color={theme.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('explore.search')}
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.ink }]}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Limpar busca">
              <Icon name="X" size={17} color={theme.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <CityPicker cities={cities} city={city} onChangeCity={onChangeCity} />

        <Text style={[styles.filterLabel, { color: theme.muted }]}>
          {t('explore.category')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {allCategories.map((item) => {
            const active = category === item
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
                  style={[
                    styles.chipText,
                    { color: active ? theme.lime : theme.muted },
                  ]}
                >
                  {item === 'Todos' ? t('explore.all') : item}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        <View style={styles.results}>
          <Text style={[styles.resultsText, { color: theme.muted }]}>
            {filtered.length === 1
              ? t('explore.foundOne')
              : t('explore.found', { count: filtered.length })}
          </Text>
        </View>

        <View style={styles.list}>
          {filtered.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              imageHeight={172}
              overlayCity
              saved={saved.includes(place.id)}
              onSave={() => onToggleSave(place)}
              onOpen={() => onOpenPlace(place)}
            />
          ))}
        </View>

        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: theme.sand }]}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
              <Icon name="Compass" size={25} color={theme.forest} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.ink }]}>
              {t('explore.emptyTitle')}
            </Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              {t('explore.emptyText')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setQuery('')
                setCategory('Todos')
              }}
              activeOpacity={0.8}
              style={[styles.reset, { backgroundColor: theme.forest }]}
            >
              <Text style={[styles.resetText, { color: theme.lime }]}>
                {t('explore.reset')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 104,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 0,
  },
  filterLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 6,
  },
  categories: {
    gap: 8,
    paddingVertical: 8,
    paddingRight: 6,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  results: {
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  list: {
    gap: 13,
  },
  empty: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 26,
    marginTop: 10,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 14,
  },
  reset: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resetText: {
    fontSize: 10,
    fontWeight: '800',
  },
})
