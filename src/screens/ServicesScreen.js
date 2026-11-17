import { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { api } from '../api'
import { serviceItems } from '../data'
import { languages, useTranslation } from '../i18n'
import { useTheme } from '../theme'
import { formatPrice, openUrl } from '../utils'
import ContentCard from '../components/ContentCard'
import Header from '../components/Header'
import Icon from '../components/Icon'
import OfflineMap from '../components/OfflineMap'
import PrimaryButton from '../components/PrimaryButton'

const kindLabel = {
  hotel: 'Hotel',
  pousada: 'Pousada',
  ecopousada: 'Ecopousada',
}

const phrases = [
  {
    pt: 'Onde fica o centro da cidade?',
    en: 'Where is the city center?',
    es: '¿Dónde está el centro de la ciudad?',
  },
  {
    pt: 'Quanto custa a trilha?',
    en: 'How much is the trail?',
    es: '¿Cuánto cuesta la ruta?',
  },
  {
    pt: 'Vocês aceitam cartão?',
    en: 'Do you accept cards?',
    es: '¿Aceptan tarjetas?',
  },
  {
    pt: 'Preciso de um guia?',
    en: 'Do I need a guide?',
    es: '¿Necesito un guía?',
  },
  {
    pt: 'Onde posso comer?',
    en: 'Where can I eat?',
    es: '¿Dónde puedo comer?',
  },
  {
    pt: 'Onde fica o banheiro?',
    en: 'Where is the restroom?',
    es: '¿Dónde está el baño?',
  },
]

const tripStyles = ['Aventura', 'Cultura', 'Natureza', 'Família']

const styleCategories = {
  Aventura: ['Aventura', 'Monólitos', 'Ecoturismo'],
  Cultura: ['História', 'Religioso', 'Cultura'],
  Natureza: ['Ecoturismo', 'Monólitos', 'Aventura'],
  Família: ['Monólitos', 'História', 'Religioso', 'Ecoturismo'],
}

const exchangeRate = 5.75

function googleMapsUrl(name, city, address) {
  const query = [name, address, city].filter(Boolean).join(' ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

const phraseBook = phrases.reduce((acc, item) => {
  acc[item.pt.trim().toLowerCase().replace(/[?!.]+$/g, '')] = {
    en: item.en,
    es: item.es,
  }
  return acc
}, {})

const wordBook = {
  onde: 'where',
  fica: 'is',
  o: 'the',
  a: 'the',
  os: 'the',
  as: 'the',
  'açude': 'reservoir',
  trilha: 'trail',
  quanto: 'how much',
  custa: 'costs',
  'vocês': 'you',
  aceitam: 'accept',
  'cartão': 'card',
  preciso: 'need',
  de: 'of',
  um: 'a',
  guia: 'guide',
  posso: 'can I',
  comer: 'eat',
  'água': 'water',
  banheiro: 'restroom',
  hotel: 'hotel',
  pousada: 'inn',
  cidade: 'city',
  centro: 'downtown',
  obrigado: 'thank you',
  'obrigada': 'thank you',
  'olá': 'hello',
  oi: 'hi',
  sim: 'yes',
  'não': 'no',
  por: 'for',
  favor: 'please',
  bom: 'good',
  dia: 'day',
  boa: 'good',
  noite: 'night',
  tarde: 'afternoon',
}

function localTranslate(input, target = 'en') {
  const normalized = input.trim().toLowerCase().replace(/[?!.]+$/g, '')
  if (!normalized || target === 'pt') return input
  if (phraseBook[normalized]) return phraseBook[normalized][target] ?? phraseBook[normalized].en
  if (target !== 'en') return input
  return normalized
    .split(/\s+/)
    .map((word) => wordBook[word] ?? word)
    .join(' ')
}

const reports = [
  {
    name: 'Polícia Militar',
    description: 'Emergências e ocorrências em geral.',
    phone: '190',
  },
  {
    name: 'IBAMA — Linha Verde',
    description: 'Crimes e infrações ambientais.',
    phone: '0800 61 8080',
  },
  {
    name: 'Secretaria de Turismo',
    description: 'Atendimento e serviços turísticos locais.',
    phone: '(88) 3412-1000',
  },
]

const tips = [
  'Leve seu lixo de volta e preserve a caatinga.',
  'Não alimente animais silvestres nas trilhas.',
  'Contrate guias cadastrados no Cadastur.',
  'Prefira horários mais frescos e leve água.',
]

const environmentCards = [
  {
    icon: 'Sun',
    title: 'Melhor horário',
    text: 'Comece cedo ou saia no fim da tarde para evitar o calor forte e aproveitar a luz dourada.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Segurança primeiro',
    text: 'Avise onde vai, leve água, use calçado fechado e não saia das trilhas sinalizadas.',
  },
  {
    icon: 'MapPin',
    title: 'Respeite o território',
    text: 'Peça autorização em propriedades privadas e valorize o conhecimento dos guias locais.',
  },
]

export default function ServicesScreen({
  lodgings,
  places = [],
  restaurants = [],
  city,
  initialSection,
  onNavigate,
  onBack,
  onToast,
  onNotifications,
  unread,
  supportMessages = [],
  onSendSupport,
  currentUserName,
  mapDownloaded = false,
  onMapDownloaded,
  mapFocus = null,
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(initialSection ?? null)
  const [tripDays, setTripDays] = useState(2)
  const [tripStyle, setTripStyle] = useState('Aventura')
  const [tripResult, setTripResult] = useState(null)
  const [phraseInput, setPhraseInput] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [translating, setTranslating] = useState(false)
  const [sourceLang, setSourceLang] = useState('pt')
  const [targetLang, setTargetLang] = useState('en')
  const [supportText, setSupportText] = useState('')
  const [communityRating, setCommunityRating] = useState(5)
  const [brlValue, setBrlValue] = useState('')
  const [usdValue, setUsdValue] = useState('')

  const active = serviceItems.find((item) => item.id === activeId)
  const cityPlaces = places.filter((place) => place.city === city)
  const cityLodgings = lodgings.filter((lodging) => lodging.city === city)
  const cityRestaurants = restaurants.filter((restaurant) => restaurant.city === city)
  const citySupportMessages = supportMessages.filter((message) => message.city === city)
  const cityReports = reports.map((report) =>
    report.name === 'Secretaria de Turismo'
      ? { ...report, description: `Atendimento e serviços turísticos de ${city}.` }
      : report,
  )
  const cityFaqs = [
    {
      question: `Preciso de guia para conhecer os atrativos de ${city}?`,
      answer:
        'Recomendamos guias credenciados para maior segurança e contexto histórico, especialmente em trilhas e áreas naturais.',
    },
    {
      question: `Qual a melhor época para visitar ${city}?`,
      answer:
        'Entre junho e setembro, quando as chuvas diminuem e as trilhas ficam mais secas.',
    },
  ]

  function swapLanguages() {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setTranslatedText('')
  }

  function sendSupport() {
    const text = supportText.trim()
    if (!text) return
    if (onSendSupport) onSendSupport(text, communityRating)
    setSupportText('')
    setCommunityRating(5)
  }

  function generateItinerary() {
    const preferredCategories = styleCategories[tripStyle] ?? []
    const preferred = cityPlaces.filter((place) =>
      preferredCategories.includes(place.category),
    )
    const pool = preferred.length
      ? [...preferred, ...cityPlaces.filter((place) => !preferred.includes(place))]
      : cityPlaces

    if (!pool.length) {
      onToast(`Nenhum atrativo disponível em ${city} para montar o roteiro`)
      return
    }

    let cursor = 0
    const nextStop = () => {
      const place = pool[cursor % pool.length]
      cursor += 1
      return place ? place.name : `Centro de ${city}`
    }

    const stops = []
    for (let day = 1; day <= tripDays; day += 1) {
      stops.push(`Dia ${day} · ${nextStop()}`)
      stops.push(`Dia ${day} · ${nextStop()}`)
    }

    setTripResult({
      title: `${tripStyle} em ${city} — ${tripDays} ${tripDays === 1 ? 'dia' : 'dias'}`,
      stops,
    })
    onToast('Roteiro criado com Gemini')
  }

  async function handleTranslate() {
    const term = phraseInput.trim()
    if (!term) return
    if (sourceLang === targetLang) {
      setTranslatedText(term)
      return
    }
    setTranslating(true)
    try {
      const result = await api.translate(term, sourceLang, targetLang)
      if (result?.translatedText) {
        setTranslatedText(result.translatedText)
        return
      }
      throw new Error('Tradução vazia')
    } catch (error) {
      try {
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
            term,
          )}&langpair=${sourceLang}|${targetLang}`,
        )
        const data = await response.json()
        const value = data?.responseData?.translatedText
        if (Number(data?.responseStatus) === 200 && typeof value === 'string' && value.trim()) {
          setTranslatedText(value.trim())
          return
        }
      } catch (fallbackError) {
        // Usa a tradução local abaixo.
      }
      const fallback = localTranslate(term, targetLang)
      setTranslatedText(fallback)
      if (fallback === term) {
        onToast?.('Não foi possível traduzir agora. Tente novamente.')
      }
    } finally {
      setTranslating(false)
    }
  }

  function handleBrlChange(value) {
    setBrlValue(value)
    const number = parseFloat(value.replace(',', '.'))
    setUsdValue(Number.isFinite(number) ? (number / exchangeRate).toFixed(2) : '')
  }

  function handleUsdChange(value) {
    setUsdValue(value)
    const number = parseFloat(value.replace(',', '.'))
    setBrlValue(Number.isFinite(number) ? (number * exchangeRate).toFixed(2) : '')
  }

  function renderLodging(lodging) {
    return (
      <ContentCard
        key={lodging.id}
        showImage={false}
        badge={kindLabel[lodging.kind] ?? lodging.kind}
        badgeIcon="BedDouble"
        title={lodging.name}
        description={lodging.description}
        meta={[{ icon: 'MapPin', text: lodging.city }]}
      >
        <View style={styles.address}>
          <Icon name="MapPin" size={13} color={theme.muted} />
          <Text style={[styles.addressText, { color: theme.muted }]}>
            {lodging.address}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openUrl(googleMapsUrl(lodging.name, lodging.city, lodging.address))}
          style={styles.mapsLink}
        >
          <Icon name="Camera" size={14} color={theme.forest} />
          <Text style={[styles.mapsLinkText, { color: theme.forest }]}>
            Ver fotos no Google Maps
          </Text>
        </TouchableOpacity>

        <View style={styles.lodgingFooter}>
          <View>
            <Text style={[styles.from, { color: theme.muted }]}>A PARTIR DE</Text>
            <Text style={[styles.price, { color: theme.ink }]}>
              R$ {formatPrice(lodging.priceFrom)}
              <Text style={[styles.perNight, { color: theme.muted }]}> / noite</Text>
            </Text>
          </View>
          <View style={styles.lodgingActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openUrl(`tel:${String(lodging.phone).replace(/\D/g, '')}`)}
              style={[
                styles.roundAction,
                { backgroundColor: theme.sand, borderColor: theme.forest },
              ]}
              accessibilityLabel={`Ligar para ${lodging.name}`}
            >
              <Icon name="Phone" size={14} color={theme.forest} />
              <Text style={[styles.roundActionText, { color: theme.forest }]}>Ligar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                openUrl(
                  `https://wa.me/55${String(lodging.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá! Vi a ${lodging.name} no aplicativo e gostaria de consultar disponibilidade.`,
                  )}`,
                )
              }
              style={[styles.reserve, { backgroundColor: theme.forest }]}
            >
              <Text style={[styles.reserveText, { color: theme.lime }]}>Reservar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ContentCard>
    )
  }

  function renderHeaderCard(title, text) {
    return (
      <View style={[styles.detailIntro, { backgroundColor: theme.sand }]}>
        <Text style={[styles.detailIntroTitle, { color: theme.ink }]}>{title}</Text>
        <Text style={[styles.detailIntroText, { color: theme.muted }]}>{text}</Text>
      </View>
    )
  }

  function renderDetail() {
    if (activeId === 'hospedagens') {
      return (
        <View style={styles.detailList}>
          {renderHeaderCard(
            'Hospedagens verificadas',
            `Opções para todos os estilos de viagem em ${city}.`,
          )}
          {cityLodgings.length === 0 ? (
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <Text style={[styles.infoText, { color: theme.muted }]}>
                Nenhuma hospedagem cadastrada em {city} no momento.
              </Text>
            </View>
          ) : (
            cityLodgings.map(renderLodging)
          )}
        </View>
      )
    }

    if (activeId === 'gastronomia') {
      return (
        <View style={styles.detailList}>
          {cityRestaurants.length === 0 ? (
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <Text style={[styles.infoText, { color: theme.muted }]}>
                Nenhum restaurante cadastrado em {city} no momento.
              </Text>
            </View>
          ) : null}
          {cityRestaurants.map((restaurant) => (
            <ContentCard
              key={restaurant.id ?? restaurant.name}
              showImage={false}
              badge={restaurant.kind || 'Gastronomia'}
              badgeIcon="Utensils"
              title={restaurant.name}
              description={restaurant.description}
              meta={[
                restaurant.city
                  ? { icon: 'MapPin', text: restaurant.city }
                  : null,
                restaurant.rating
                  ? {
                      icon: 'Star',
                      text: String(restaurant.rating),
                      color: theme.star,
                      filled: true,
                    }
                  : null,
              ].filter(Boolean)}
            >
              {restaurant.phone ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => openUrl(`tel:${restaurant.phone.replace(/\D/g, '')}`)}
                  style={[styles.infoAction, { borderColor: theme.line }]}
                >
                  <Icon name="Phone" size={14} color={theme.forest} />
                  <Text style={[styles.infoActionText, { color: theme.forest }]}>
                    {restaurant.phone}
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openUrl(googleMapsUrl(restaurant.name, restaurant.city))}
                style={styles.mapsLink}
              >
                <Icon name="Camera" size={14} color={theme.forest} />
                <Text style={[styles.mapsLinkText, { color: theme.forest }]}>
                  Ver fotos no Google Maps
                </Text>
              </TouchableOpacity>
            </ContentCard>
          ))}
        </View>
      )
    }

    if (activeId === 'roteiros') {
      return (
        <View style={styles.detailList}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.sand, borderColor: theme.line },
            ]}
          >
            <View style={styles.infoHead}>
              <View style={[styles.infoIcon, { backgroundColor: theme.softBlue }]}>
                <Icon name="Sparkles" size={19} color={theme.onBlue} />
              </View>
              <View style={styles.infoCopy}>
                <Text style={[styles.infoTitle, { color: theme.ink }]}>
                  Criar roteiro com Gemini
                </Text>
                <Text style={[styles.infoMeta, { color: theme.muted }]}>
                  Monte um roteiro personalizado em segundos
                </Text>
              </View>
            </View>

            <Text style={[styles.tripLabel, { color: theme.muted }]}>DIAS DE VIAGEM</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3].map((day) => {
                const active = tripDays === day
                return (
                  <TouchableOpacity
                    key={day}
                    activeOpacity={0.85}
                    onPress={() => setTripDays(day)}
                    style={[
                      styles.tripChip,
                      {
                        backgroundColor: active ? theme.forest : theme.surface,
                        borderColor: active ? theme.forest : theme.line,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tripChipText,
                        { color: active ? theme.lime : theme.muted },
                      ]}
                    >
                      {day} {day === 1 ? 'dia' : 'dias'}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <Text style={[styles.tripLabel, { color: theme.muted }]}>ESTILO DA VIAGEM</Text>
            <View style={styles.chipRow}>
              {tripStyles.map((style) => {
                const active = tripStyle === style
                return (
                  <TouchableOpacity
                    key={style}
                    activeOpacity={0.85}
                    onPress={() => setTripStyle(style)}
                    style={[
                      styles.tripChip,
                      {
                        backgroundColor: active ? theme.forest : theme.surface,
                        borderColor: active ? theme.forest : theme.line,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tripChipText,
                        { color: active ? theme.lime : theme.muted },
                      ]}
                    >
                      {style}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <PrimaryButton
              label="Gerar roteiro com Gemini"
              onPress={generateItinerary}
              icon="Sparkles"
              style={styles.detailButton}
            />
          </View>

          {tripResult ? (
            <>
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: theme.surface, borderColor: theme.forest },
                ]}
              >
                <View style={styles.infoHead}>
                  <View style={[styles.infoIcon, { backgroundColor: theme.softGreen }]}>
                    <Icon name="Sparkles" size={19} color={theme.onGreen} />
                  </View>
                  <Text style={[styles.infoTitle, { color: theme.ink, flex: 1 }]}>
                    {tripResult.title}
                  </Text>
                </View>
                <View style={styles.stops}>
                  {tripResult.stops.map((stop, index) => (
                    <View key={`${stop}-${index}`} style={styles.stop}>
                      <View style={[styles.stopDot, { backgroundColor: theme.forest }]} />
                      <Text style={[styles.stopText, { color: theme.muted }]}>{stop}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <PrimaryButton
                label="Salvar roteiro no perfil"
                onPress={() => onToast('Roteiro salvo no seu perfil')}
              />

              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Apagar roteiro criado pela IA"
                onPress={() => {
                  setTripResult(null)
                  onToast('Roteiro descartado')
                }}
                style={[
                  styles.tripDiscard,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <Icon name="Trash2" size={16} color={theme.heart} />
                <Text style={[styles.tripDiscardText, { color: theme.heart }]}>
                  Apagar roteiro
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      )
    }

    if (activeId === 'utilidades') {
      return (
        <View style={styles.detailList}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <View style={styles.infoHead}>
              <View style={[styles.infoIcon, { backgroundColor: theme.softBlue }]}>
                <Icon name="Languages" size={19} color={theme.onBlue} />
              </View>
              <Text style={[styles.infoTitle, { color: theme.ink, flex: 1 }]}>
                {t('services.translator')}
              </Text>
            </View>

            <View style={styles.languageRow}>
              <View style={styles.languageColumn}>
                <Text style={[styles.tripLabel, { color: theme.muted }]}>
                  {t('services.source')}
                </Text>
                <View style={styles.languageChips}>
                  {languages.map((item) => {
                    const active = sourceLang === item.code
                    return (
                      <TouchableOpacity
                        key={`source-${item.code}`}
                        activeOpacity={0.85}
                        onPress={() => {
                          setSourceLang(item.code)
                          setTranslatedText('')
                        }}
                        style={[
                          styles.languageChip,
                          {
                            backgroundColor: active ? theme.forest : theme.surface,
                            borderColor: active ? theme.forest : theme.line,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.languageChipText,
                            { color: active ? theme.lime : theme.muted },
                          ]}
                        >
                          {item.short}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={swapLanguages}
                style={[styles.swap, { backgroundColor: theme.sand }]}
                accessibilityLabel="Inverter idiomas"
              >
                <Icon name="ArrowLeftRight" size={16} color={theme.forest} />
              </TouchableOpacity>

              <View style={styles.languageColumn}>
                <Text style={[styles.tripLabel, { color: theme.muted }]}>
                  {t('services.target')}
                </Text>
                <View style={styles.languageChips}>
                  {languages.map((item) => {
                    const active = targetLang === item.code
                    return (
                      <TouchableOpacity
                        key={`target-${item.code}`}
                        activeOpacity={0.85}
                        onPress={() => {
                          setTargetLang(item.code)
                          setTranslatedText('')
                        }}
                        style={[
                          styles.languageChip,
                          {
                            backgroundColor: active ? theme.forest : theme.surface,
                            borderColor: active ? theme.forest : theme.line,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.languageChipText,
                            { color: active ? theme.lime : theme.muted },
                          ]}
                        >
                          {item.short}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            </View>

            <TextInput
              value={phraseInput}
              onChangeText={setPhraseInput}
              placeholder={t('services.phrasePlaceholder')}
              placeholderTextColor={theme.muted}
              multiline
              style={[
                styles.tripInput,
                { backgroundColor: theme.inputBg, borderColor: theme.line, color: theme.ink },
              ]}
            />

            <PrimaryButton
              label={translating ? t('services.translating') : t('services.translate')}
              onPress={handleTranslate}
              disabled={translating || !phraseInput.trim()}
              icon="Languages"
              style={styles.detailButton}
            />

            {translatedText ? (
              <View style={[styles.translationResult, { backgroundColor: theme.sand }]}>
                <Text style={[styles.tripLabel, { color: theme.muted }]}>
                  {t('services.translation')}
                </Text>
                <Text style={[styles.translationText, { color: theme.ink }]}>
                  {translatedText}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.tripLabel, { color: theme.muted, marginTop: 12 }]}>
              {t('services.usefulPhrases')}
            </Text>
            {phrases.map((phrase) => (
              <TouchableOpacity
                key={phrase.pt}
                activeOpacity={0.8}
                onPress={() => {
                  setSourceLang('pt')
                  setPhraseInput(phrase.pt)
                  setTranslatedText(
                    targetLang === 'pt' ? phrase.pt : phrase[targetLang] ?? phrase.en,
                  )
                }}
                style={[styles.phrase, { borderTopColor: theme.line }]}
              >
                <Text style={[styles.phrasePt, { color: theme.muted }]}>{phrase.pt}</Text>
                <Text style={[styles.phraseEn, { color: theme.ink }]}>
                  {targetLang === 'pt' ? phrase.pt : phrase[targetLang] ?? phrase.en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <View style={styles.infoHead}>
              <View style={[styles.infoIcon, { backgroundColor: theme.softYellow }]}>
                <Icon name="ThermometerSun" size={19} color={theme.onYellow} />
              </View>
              <Text style={[styles.infoTitle, { color: theme.ink, flex: 1 }]}>
                Conversor de moedas
              </Text>
            </View>

            <Text style={[styles.tripLabel, { color: theme.muted }]}>REAIS (R$)</Text>
            <TextInput
              value={brlValue}
              onChangeText={handleBrlChange}
              placeholder="0,00"
              placeholderTextColor={theme.muted}
              keyboardType="decimal-pad"
              style={[
                styles.tripInput,
                styles.tripInputSingle,
                { backgroundColor: theme.inputBg, borderColor: theme.line, color: theme.ink },
              ]}
            />

            <Text style={[styles.tripLabel, { color: theme.muted, marginTop: 10 }]}>
              DÓLARES (US$)
            </Text>
            <TextInput
              value={usdValue}
              onChangeText={handleUsdChange}
              placeholder="0,00"
              placeholderTextColor={theme.muted}
              keyboardType="decimal-pad"
              style={[
                styles.tripInput,
                styles.tripInputSingle,
                { backgroundColor: theme.inputBg, borderColor: theme.line, color: theme.ink },
              ]}
            />

            <Text style={[styles.infoText, { color: theme.muted, marginTop: 10 }]}>
              Cotação usada: US$ 1 = R$ 5,75
            </Text>
          </View>
        </View>
      )
    }

    if (activeId === 'offline') {
      return (
        <View style={styles.detailList}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <View style={styles.infoHead}>
              <View style={[styles.infoIcon, { backgroundColor: theme.softGreen }]}>
                <Icon name="Map" size={19} color={theme.onGreen} />
              </View>
              <Text style={[styles.infoTitle, { color: theme.ink, flex: 1 }]}>
                {t('services.offlineTitle')}
              </Text>
            </View>
            <Text style={[styles.infoText, { color: theme.muted }]}>
              {t('services.offlineText', { city })}
            </Text>

            <OfflineMap
              city={city}
              focus={mapFocus}
              mapDownloaded={mapDownloaded}
              onMapDownloaded={onMapDownloaded}
              onToast={onToast}
            />
          </View>
        </View>
      )
    }

    if (activeId === 'ambiente') {
      return (
        <View style={styles.detailList}>
          {renderHeaderCard(
            'Turismo responsável',
            'Pequenas atitudes ajudam a preservar os monólitos e a caatinga para as próximas gerações.',
          )}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            {tips.map((tip) => (
              <View key={tip} style={styles.tip}>
                <Icon name="Leaf" size={16} color={theme.forest} />
                <Text style={[styles.tipText, { color: theme.muted }]}>{tip}</Text>
              </View>
            ))}
          </View>
          {environmentCards.map((item) => (
            <View
              key={item.title}
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <View style={styles.infoHead}>
                <View style={[styles.infoIcon, { backgroundColor: theme.softGreen }]}>
                  <Icon name={item.icon} size={19} color={theme.onGreen} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoTitle, { color: theme.ink }]}>{item.title}</Text>
                  <Text style={[styles.infoMeta, { color: theme.muted }]}>{item.text}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )
    }

    if (activeId === 'denuncias') {
      return (
        <View style={styles.detailList}>
          {renderHeaderCard(
            'Canais de denúncia',
            'Use os contatos abaixo para emergências, infrações ambientais ou apoio turístico.',
          )}
          {cityReports.map((report) => (
            <View
              key={report.name}
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <View style={styles.infoHead}>
                <View style={[styles.infoIcon, { backgroundColor: theme.softOrange }]}>
                  <Icon name="ShieldCheck" size={19} color={theme.onOrange} />
                </View>
                <View style={styles.infoCopy}>
                  <Text style={[styles.infoTitle, { color: theme.ink }]}>{report.name}</Text>
                  <Text style={[styles.infoMeta, { color: theme.muted }]}>
                    {report.description}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => openUrl(`tel:${report.phone.replace(/\D/g, '')}`)}
                style={[styles.call, { backgroundColor: theme.forest }]}
              >
                <Icon name="Phone" size={15} color={theme.lime} />
                <Text style={[styles.callText, { color: theme.lime }]}>{report.phone}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )
    }

    return (
      <View style={styles.detailList}>
        <View
          style={[
            styles.ratingCard,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <Text style={[styles.ratingBig, { color: theme.ink }]}>4,8</Text>
          <View style={styles.ratingCopy}>
            <View style={styles.ratingStars}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Icon key={index} name="Star" size={15} color={theme.star} filled />
              ))}
            </View>
            <Text style={[styles.infoMeta, { color: theme.muted }]}>
              Média de 128 avaliações da comunidade
            </Text>
          </View>
        </View>

        {cityFaqs.map((faq) => (
          <View
            key={faq.question}
            style={[
              styles.infoCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Text style={[styles.infoTitle, { color: theme.ink }]}>{faq.question}</Text>
            <Text style={[styles.infoText, { color: theme.muted, marginTop: 6 }]}>
              {faq.answer}
            </Text>
          </View>
        ))}

        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <Text style={[styles.infoTitle, { color: theme.ink }]}>
            {t('services.communityTitle')}
          </Text>
          <Text style={[styles.infoText, { color: theme.muted, marginTop: 4 }]}>
            Deixe uma dúvida ou conte como foi sua experiência pelo Sertão Central.
          </Text>

          <Text style={[styles.tripLabel, { color: theme.muted, marginTop: 12 }]}>
            SUA NOTA
          </Text>
          <View style={styles.ratingPicker}>
            {Array.from({ length: 5 }).map((_, index) => {
              const active = index < communityRating
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.75}
                  onPress={() => setCommunityRating(index + 1)}
                  accessibilityLabel={`${index + 1} estrelas`}
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
            value={supportText}
            onChangeText={setSupportText}
            placeholder={t('services.messagePlaceholder')}
            placeholderTextColor={theme.muted}
            multiline
            style={[
              styles.tripInput,
              { backgroundColor: theme.inputBg, borderColor: theme.line, color: theme.ink },
            ]}
          />

          <PrimaryButton
            label={t('services.send')}
            onPress={() => {
              if (!supportText.trim()) {
                onToast('Escreva sua dúvida ou avaliação antes de enviar.')
                return
              }
              sendSupport()
            }}
            icon="Send"
            style={styles.detailButton}
          />
        </View>

        <View style={styles.list}>
          <Text style={[styles.tripLabel, { color: theme.muted }]}>
            MENSAGENS RECENTES
          </Text>
          {citySupportMessages.length === 0 ? (
            <View style={[styles.emptyCommunity, { backgroundColor: theme.sand }]}>
              <Icon name="MessagesSquare" size={20} color={theme.forest} />
              <Text style={[styles.emptyCommunityText, { color: theme.muted }]}>
                Ainda não há mensagens. Seja a primeira pessoa a participar.
              </Text>
            </View>
          ) : (
            citySupportMessages
              .slice(-8)
              .reverse()
              .map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.message,
                    { backgroundColor: theme.surface, borderColor: theme.line },
                  ]}
                >
                  <View style={styles.messageHead}>
                    <View style={[styles.messageAvatar, { backgroundColor: theme.sand }]}>
                      <Icon name="UserRound" size={15} color={theme.forest} />
                    </View>
                    <Text style={[styles.messageAuthor, { color: theme.ink }]}>
                      {message.author || currentUserName || 'Visitante'}
                    </Text>
                    <Text style={[styles.messageTime, { color: theme.muted }]}>
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleDateString('pt-BR')
                        : 'agora'}
                    </Text>
                  </View>
                  {message.rating ? (
                    <View style={styles.messageStars}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Icon
                          key={index}
                          name="Star"
                          size={10}
                          color={index < message.rating ? theme.star : theme.line}
                          filled={index < message.rating}
                        />
                      ))}
                    </View>
                  ) : null}
                  <Text style={[styles.messageText, { color: theme.muted }]}>
                    {message.text}
                  </Text>
                </View>
              ))
          )}
        </View>
      </View>
    )
  }

  if (active) {
    return (
      <View style={{ flex: 1 }}>
        <Header
          title={active.title}
          subtitle={active.description}
          onBack={() => setActiveId(null)}
          onNotifications={onNotifications}
          unread={unread}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailContent}
        >
          {renderDetail()}
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={t('services.title')}
        subtitle={t('services.subtitle')}
        onBack={onBack}
        onNotifications={onNotifications}
        unread={unread}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.sectionHead}>
          <Text style={[styles.sectionKicker, { color: theme.kicker }]}>
            {t('services.experienceKicker')}
          </Text>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>
            {t('services.experienceTitle')}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.experienceFilters}
        >
          {['Religioso', 'Aventura', 'Cultura', 'Gastronomia', 'Negócios'].map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.85}
              onPress={() => onNavigate?.('explorar')}
              style={[
                styles.experienceChip,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <Text style={[styles.experienceChipText, { color: theme.muted }]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHead}>
          <Text style={[styles.sectionKicker, { color: theme.kicker }]}>
            {t('services.guideKicker')}
          </Text>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>
            {t('services.guideTitle')}
          </Text>
        </View>

        <View style={styles.grid}>
          {serviceItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => setActiveId(item.id)}
              style={[
                styles.service,
                { backgroundColor: theme.surface, borderColor: theme.line },
              ]}
            >
              <View style={[styles.serviceIcon, { backgroundColor: theme.sand }]}>
                <Icon name={item.icon} size={20} color={theme.forest} />
              </View>
              <Text style={[styles.serviceTitle, { color: theme.ink }]}>{item.title}</Text>
              <Text style={[styles.serviceText, { color: theme.muted }]} numberOfLines={2}>
                {item.description}
              </Text>
              <Icon name="ChevronRight" size={16} color={theme.muted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHead}>
          <Text style={[styles.sectionKicker, { color: theme.kicker }]}>
            {t('services.stayKicker')}
          </Text>
          <Text style={[styles.sectionTitle, { color: theme.ink }]}>
            {t('services.stayTitle')}
          </Text>
        </View>

        {cityLodgings.length === 0 ? (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: theme.surface, borderColor: theme.line },
            ]}
          >
            <Text style={[styles.infoText, { color: theme.muted }]}>
              Nenhuma hospedagem cadastrada em {city} no momento.
            </Text>
          </View>
        ) : (
          cityLodgings.map(renderLodging)
        )}

        <View style={[styles.help, { backgroundColor: theme.sand }]}>
          <View style={[styles.helpIcon, { backgroundColor: theme.forest }]}>
            <Icon name="MessagesSquare" size={20} color={theme.lime} />
          </View>
          <View style={styles.helpCopy}>
            <Text style={[styles.helpTitle, { color: theme.ink }]}>
              {t('services.helpTitle')}
            </Text>
            <Text style={[styles.helpText, { color: theme.muted }]}>
              {t('services.helpText', { city })}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openUrl('https://wa.me/558834121000')}
            style={[styles.helpButton, { borderColor: theme.forest }]}
          >
            <Text style={[styles.helpButtonText, { color: theme.forest }]}>
              {t('services.helpAction')}
            </Text>
          </TouchableOpacity>
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
  },
  detailContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 104,
  },
  detailList: {
    gap: 12,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  introText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  service: {
    flexGrow: 1,
    flexBasis: '47%',
    maxWidth: '49%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 128,
  },
  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  serviceTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },
  serviceText: {
    fontSize: 8,
    lineHeight: 12,
    marginBottom: 6,
  },
  experienceFilters: {
    gap: 7,
    paddingRight: 6,
    marginBottom: 6,
  },
  experienceChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  experienceChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  sectionHead: {
    marginTop: 22,
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
  address: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 8,
  },
  mapsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
  },
  mapsLinkText: {
    fontSize: 9,
    fontWeight: '800',
  },
  lodgingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  from: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  perNight: {
    fontSize: 8,
    fontWeight: '600',
  },
  lodgingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  roundAction: {
    minWidth: 62,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },
  roundActionText: {
    fontSize: 9,
    fontWeight: '800',
  },
  reserve: {
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reserveText: {
    fontSize: 9,
    fontWeight: '800',
  },
  help: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 16,
    padding: 13,
    marginTop: 4,
  },
  helpIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpCopy: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  helpText: {
    fontSize: 8,
    marginTop: 2,
  },
  helpButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  helpButtonText: {
    fontSize: 9,
    fontWeight: '800',
  },
  detailIntro: {
    borderRadius: 16,
    padding: 14,
  },
  detailIntroTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  detailIntroText: {
    fontSize: 9,
    lineHeight: 14,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  infoHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCopy: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  infoMeta: {
    fontSize: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 9,
    lineHeight: 14,
  },
  infoAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    marginTop: 11,
  },
  infoActionText: {
    fontSize: 9,
    fontWeight: '800',
  },
  stops: {
    gap: 8,
    marginTop: 2,
  },
  stop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stopDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  stopText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  phrase: {
    borderTopWidth: 1,
    paddingTop: 9,
    marginTop: 9,
  },
  phrasePt: {
    fontSize: 9,
  },
  phraseEn: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  progress: {
    marginTop: 12,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 6,
  },
  detailButton: {
    marginTop: 13,
  },
  tripDiscard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
  },
  tripDiscardText: {
    fontSize: 10,
    fontWeight: '800',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  call: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 11,
  },
  callText: {
    fontSize: 10,
    fontWeight: '800',
  },
  ratingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  ratingBig: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
  },
  ratingCopy: {
    flex: 1,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 4,
  },
  tripLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 7,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 12,
  },
  tripChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tripChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  tripInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 12,
    minHeight: 74,
    textAlignVertical: 'top',
  },
  tripInputSingle: {
    minHeight: 0,
    textAlignVertical: 'center',
  },
  translationResult: {
    borderRadius: 12,
    padding: 12,
    marginTop: 11,
  },
  translationText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  languageColumn: {
    flex: 1,
  },
  languageChips: {
    flexDirection: 'row',
    gap: 5,
  },
  languageChip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 7,
  },
  languageChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  swap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  ratingPicker: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  list: {
    gap: 8,
  },
  emptyCommunity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 13,
    padding: 12,
  },
  emptyCommunityText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  message: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 11,
  },
  messageHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAuthor: {
    flex: 1,
    fontSize: 10,
    fontWeight: '800',
  },
  messageTime: {
    fontSize: 8,
  },
  messageStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 6,
  },
  messageText: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 7,
  },
})
