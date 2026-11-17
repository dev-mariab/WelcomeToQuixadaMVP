import { useEffect, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../api'
import { images, sertaoCentralCities } from '../data'
import { imageSource } from '../utils'
import { useTheme } from '../theme'
import AppModal from './AppModal'
import Icon from './Icon'
import IconButton from './IconButton'

const typeOptions = [
  { id: 'place', label: 'Atrativo', icon: 'MapPin' },
  { id: 'lodging', label: 'Hospedagem', icon: 'BedDouble' },
  { id: 'restaurant', label: 'Gastronomia', icon: 'Utensils' },
  { id: 'event', label: 'Evento', icon: 'CalendarDays' },
  { id: 'guide', label: 'Guia', icon: 'UserRound' },
  { id: 'trail', label: 'Trilha', icon: 'Mountain' },
  { id: 'category', label: 'Categoria', icon: 'Tag' },
]

const imageOptions = [
  { key: 'hero', label: 'Monólito', source: images.hero },
  { key: 'urucum', label: 'Serra', source: images.urucum },
  { key: 'cedro', label: 'Açude', source: images.cedro },
  { key: 'sunset', label: 'Pôr do sol', source: images.sunset },
  { key: 'memorialSeca', label: 'Memorial da Seca', source: images.memorialSeca },
  { key: 'acudeUmari', label: 'Açude Umari', source: images.acudeUmari },
  { key: 'green', label: 'Catedral', source: images.green },
  { key: 'rock', label: 'Pedras', source: images.rock },
  { key: 'trail', label: 'Estação', source: images.trail },
  { key: 'cruzeiro', label: 'Mirante', source: images.cruzeiroQuixeramobim },
]

const configs = {
  place: {
    title: 'atrativo',
    subtitle: 'Cadastre um ponto turístico para aparecer na exploração.',
    nameLabel: 'NOME DO ATRATIVO',
    nameKey: 'name',
    namePlaceholder: 'Ex.: Mirante do Rio Sertão',
    fields: [
      { key: 'city', label: 'CIDADE', placeholder: 'Selecione a cidade', options: 'cities' },
      { key: 'category', label: 'CATEGORIA', placeholder: 'Monólitos', options: true },
    ],
    description: true,
    photo: true,
  },
  lodging: {
    title: 'hospedagem',
    subtitle: 'Adicione hotéis, pousadas ou ecopousadas parceiras.',
    nameLabel: 'NOME DA HOSPEDAGEM',
    nameKey: 'name',
    namePlaceholder: 'Ex.: Pousada do Sertão',
    fields: [
      { key: 'city', label: 'CIDADE', placeholder: 'Selecione a cidade', options: 'cities' },
      { key: 'priceFrom', label: 'DIÁRIA (R$)', placeholder: '250', numeric: true },
      { key: 'address', label: 'ENDEREÇO', placeholder: 'Rua, número — bairro' },
      { key: 'phone', label: 'TELEFONE', placeholder: '(88) 90000-0000' },
    ],
    description: true,
    photo: true,
  },
  restaurant: {
    title: 'restaurante',
    subtitle: 'Adicione restaurantes, cafés e sabores locais.',
    nameLabel: 'NOME DO RESTAURANTE',
    nameKey: 'name',
    namePlaceholder: 'Ex.: Sabores do Sertão',
    fields: [
      { key: 'city', label: 'CIDADE', placeholder: 'Selecione a cidade', options: 'cities' },
      { key: 'kind', label: 'TIPO DE COZINHA', placeholder: 'Culinária regional' },
      { key: 'rating', label: 'NOTA', placeholder: '4.8', numeric: true },
      { key: 'phone', label: 'TELEFONE', placeholder: '(88) 90000-0000' },
    ],
    description: true,
    photo: true,
  },
  event: {
    title: 'evento',
    subtitle: 'Divulgue a programação cultural da região.',
    nameLabel: 'TÍTULO DO EVENTO',
    nameKey: 'title',
    namePlaceholder: 'Ex.: Festival de Sanfona',
    fields: [
      { key: 'city', label: 'CIDADE', placeholder: 'Selecione a cidade', options: 'cities' },
      { key: 'place', label: 'LOCAL', placeholder: 'Praça Central' },
      { key: 'day', label: 'DIA', placeholder: '12' },
      { key: 'month', label: 'MÊS', placeholder: 'AGO' },
      { key: 'year', label: 'ANO', placeholder: '2026' },
      { key: 'time', label: 'HORÁRIO', placeholder: '19:00' },
    ],
    description: false,
    photo: false,
  },
  guide: {
    title: 'guia',
    subtitle: 'Credencie um profissional para a lista de guias.',
    nameLabel: 'NOME DO GUIA',
    nameKey: 'name',
    namePlaceholder: 'Ex.: Ana Beatriz',
    fields: [
      { key: 'city', label: 'CIDADE', placeholder: 'Selecione a cidade', options: 'cities' },
      { key: 'role', label: 'FUNÇÃO', placeholder: 'Guia de trilhas' },
      { key: 'specialties', label: 'ESPECIALIDADES', placeholder: 'Trilhas, Monólitos' },
      { key: 'phone', label: 'TELEFONE (WHATSAPP)', placeholder: '(88) 90000-0000' },
      { key: 'photo', label: 'URL DA FOTO', placeholder: 'https://...' },
      { key: 'cadastur', label: 'CADASTUR', placeholder: '23.456789.10-2' },
      { key: 'experience', label: 'EXPERIÊNCIA', placeholder: '5 anos' },
    ],
    description: false,
    photo: false,
  },
  trail: {
    title: 'trilha',
    subtitle: 'Cadastre um percurso com distância, duração e nível.',
    nameLabel: 'NOME DA TRILHA',
    nameKey: 'name',
    namePlaceholder: 'Ex.: Trilha do Mirante',
    fields: [
      { key: 'place', label: 'PONTO DE PARTIDA', placeholder: 'Início do percurso' },
      { key: 'city', label: 'CIDADE', placeholder: 'Selecione a cidade', options: 'cities' },
      { key: 'level', label: 'NÍVEL', placeholder: 'Fácil', options: ['Fácil', 'Moderada', 'Difícil'] },
      { key: 'distance', label: 'DISTÂNCIA', placeholder: '5,2 km' },
      { key: 'time', label: 'DURAÇÃO', placeholder: '2h' },
      { key: 'gain', label: 'ELEVAÇÃO', placeholder: '280 m' },
    ],
    description: false,
    photo: true,
  },
  category: {
    title: 'categoria',
    subtitle: 'Organize os atrativos por tipo de experiência.',
    nameLabel: 'NOME DA CATEGORIA',
    nameKey: 'name',
    namePlaceholder: 'Ex.: Mirantes',
    fields: [],
    description: false,
    photo: false,
  },
}

function initialValues(type, item, defaultCity) {
  const hasCityField = (configs[type]?.fields ?? []).some((field) => field.key === 'city')
  if (!item) {
    return hasCityField && defaultCity ? { city: defaultCity } : {}
  }
  if (type === 'category') return { name: item.name }
  const values = { ...item }
  if (type === 'guide' && item.image) values.photo = item.image
  delete values.id
  delete values.image
  delete values.initials
  delete values.color
  delete values.rating
  delete values.reviews
  if (configs[type]?.photo && item.image) values.image = item.image
  if (Array.isArray(values.specialties)) values.specialties = values.specialties.join(', ')
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === 'number') values[key] = String(value)
  })
  return values
}

export default function CreateContentModal({
  visible,
  initialType,
  initialItem,
  editing,
  defaultCity,
  categories = [],
  onClose,
  onCreate,
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [type, setType] = useState(initialType ?? 'place')
  const [values, setValues] = useState({})
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (visible) {
      const nextType = initialType ?? 'place'
      setType(nextType)
      setValues(initialValues(nextType, initialItem, defaultCity))
      setError('')
      setUploading(false)
    }
  }, [visible, initialType, initialItem, defaultCity])

  const config = configs[type] ?? configs.place
  const previewImage = imageSource(values.image) ?? imageSource(initialItem?.image) ?? images.hero

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }))
    setError('')
  }

  async function pickImage(target) {
    if (uploading) return
    setError('')
    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) {
          setError('Permita o acesso à galeria para enviar uma imagem.')
          return
        }
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 10],
        quality: 0.7,
        base64: true,
      })
      if (result.canceled) return
      const asset = result.assets?.[0]
      if (!asset?.base64) {
        setError('Não foi possível ler a imagem selecionada.')
        return
      }
      setUploading(true)
      const uploaded = await api.uploadImage({
        data: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      })
      if (!uploaded?.url) throw new Error('Falha ao enviar a imagem.')
      update(target, uploaded.url)
    } catch (uploadError) {
      const raw = String(uploadError?.message || '')
      let message = raw
      try {
        const parsed = JSON.parse(raw)
        if (parsed?.error) message = parsed.error
      } catch {}
      setError(message || 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit() {
    const name = (values[config.nameKey] ?? '').trim()
    if (name.length < 3) {
      setError('Preencha o nome com pelo menos 3 caracteres.')
      return
    }
    if (type === 'category' && !editing && categories.includes(name)) {
      setError('Esta categoria já existe.')
      return
    }
    onCreate(type, { ...values, [config.nameKey]: name })
    setValues({})
    setError('')
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.inputBg, borderColor: theme.line, color: theme.ink },
  ]

  return (
    <AppModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Fechar formulário"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.paper,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.head}>
              <View style={styles.headCopy}>
                <Text style={[styles.kicker, { color: theme.kicker }]}>
                  {editing ? 'EDITAR CONTEÚDO' : 'NOVO CADASTRO'}
                </Text>
                <Text style={[styles.title, { color: theme.ink }]}>
                  {editing ? 'Editar' : 'Novo'} {config.title}
                </Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>{config.subtitle}</Text>
              </View>
              <IconButton
                icon="X"
                label="Fechar formulário"
                onPress={onClose}
                background={theme.sand}
              />
            </View>

            {!editing ? (
              <View style={styles.types}>
                {typeOptions.map((option) => {
                  const active = option.id === type
                  return (
                    <TouchableOpacity
                      key={option.id}
                      activeOpacity={0.85}
                      onPress={() => {
                        setType(option.id)
                        setValues(initialValues(option.id, null, defaultCity))
                        setError('')
                      }}
                      style={[
                        styles.type,
                        {
                          backgroundColor: active ? theme.forest : theme.surface,
                          borderColor: active ? theme.forest : theme.line,
                        },
                      ]}
                    >
                      <Icon
                        name={option.icon}
                        size={16}
                        color={active ? theme.lime : theme.forest}
                      />
                      <Text
                        style={[
                          styles.typeText,
                          { color: active ? theme.lime : theme.muted },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            ) : null}

            <View style={styles.form}>
              <View>
                <Text style={[styles.label, { color: theme.muted }]}>{config.nameLabel}</Text>
                <TextInput
                  value={values[config.nameKey] ?? ''}
                  onChangeText={(value) => update(config.nameKey, value)}
                  placeholder={config.namePlaceholder}
                  placeholderTextColor={theme.muted}
                  style={inputStyle}
                />
              </View>

              {config.fields.map((field) => (
                <View key={field.key}>
                  <Text style={[styles.label, { color: theme.muted }]}>{field.label}</Text>
                  {field.options ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.options}
                    >
                      {(field.options === true
                        ? categories
                        : field.options === 'cities'
                          ? sertaoCentralCities
                          : field.options
                      ).map((option) => {
                        const active = values[field.key] === option
                        return (
                          <TouchableOpacity
                            key={option}
                            activeOpacity={0.85}
                            onPress={() => update(field.key, option)}
                            style={[
                              styles.option,
                              {
                                backgroundColor: active ? theme.forest : theme.surface,
                                borderColor: active ? theme.forest : theme.line,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                { color: active ? theme.lime : theme.muted },
                              ]}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </ScrollView>
                  ) : (
                    <TextInput
                      value={values[field.key] ?? ''}
                      onChangeText={(value) => update(field.key, value)}
                      placeholder={field.placeholder}
                      placeholderTextColor={theme.muted}
                      keyboardType={field.numeric ? 'numeric' : 'default'}
                      autoCapitalize={field.key === 'month' ? 'characters' : 'sentences'}
                      style={inputStyle}
                    />
                  )}
                </View>
              ))}

              {config.description ? (
                <View>
                  <Text style={[styles.label, { color: theme.muted }]}>DESCRIÇÃO</Text>
                  <TextInput
                    value={values.description ?? ''}
                    onChangeText={(value) => update('description', value)}
                    placeholder="Conte o que torna este lugar especial."
                    placeholderTextColor={theme.muted}
                    multiline
                    style={[inputStyle, styles.textarea]}
                  />
                </View>
              ) : null}

              {type === 'guide' ? (
                <View>
                  <Text style={[styles.label, { color: theme.muted }]}>FOTO DO GUIA</Text>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={uploading}
                    onPress={() => pickImage('photo')}
                    style={[
                      styles.upload,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.line,
                        opacity: uploading ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Icon name="ImagePlus" size={16} color={theme.forest} />
                    <Text style={[styles.uploadText, { color: theme.forest }]}>
                      {uploading ? 'Enviando imagem...' : 'Enviar foto do dispositivo'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.uploadHint, { color: theme.muted }]}>
                    JPG, PNG ou WebP até 8 MB
                  </Text>
                  {values.photo ? (
                    <View style={[styles.guidePreview, { borderColor: theme.line }]}>
                      <Image
                        source={imageSource(values.photo)}
                        style={styles.guidePreviewImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}
                </View>
              ) : null}

              {config.photo ? (
                <View>
                  <Text style={[styles.label, { color: theme.muted }]}>FOTO DE CAPA</Text>
                  <View style={styles.imageGrid}>
                    {imageOptions.map((option) => {
                      const active = values.image === option.key
                      return (
                        <TouchableOpacity
                          key={option.key}
                          activeOpacity={0.85}
                          onPress={() => update('image', option.key)}
                          style={[
                            styles.imageOption,
                            {
                              borderColor: active ? theme.forest : theme.line,
                              backgroundColor: theme.surface,
                            },
                          ]}
                        >
                          <Image
                            source={option.source}
                            style={styles.imageThumb}
                            resizeMode="cover"
                          />
                          <Text
                            style={[
                              styles.imageLabel,
                              { color: active ? theme.forest : theme.muted },
                            ]}
                            numberOfLines={1}
                          >
                            {option.label}
                          </Text>
                          {active ? (
                            <View style={[styles.imageCheck, { backgroundColor: theme.forest }]}>
                              <Icon name="Check" size={11} color={theme.lime} />
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      )
                    })}
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={uploading}
                    onPress={() => pickImage('image')}
                    style={[
                      styles.upload,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.line,
                        opacity: uploading ? 0.6 : 1,
                      },
                    ]}
                  >
                    <Icon name="ImagePlus" size={16} color={theme.forest} />
                    <Text style={[styles.uploadText, { color: theme.forest }]}>
                      {uploading ? 'Enviando imagem...' : 'Enviar imagem do dispositivo'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={[styles.uploadHint, { color: theme.muted }]}>
                    JPG, PNG ou WebP até 8 MB
                  </Text>
                  <View style={[styles.preview, { borderColor: theme.line }]}>
                    <Image
                      source={previewImage}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <Text
                      style={[
                        styles.previewText,
                        { backgroundColor: theme.surface, color: theme.ink },
                      ]}
                    >
                      Prévia da capa
                    </Text>
                  </View>
                </View>
              ) : null}

              {error ? (
                <Text style={[styles.error, { color: theme.onOrange }]}>{error}</Text>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSubmit}
                style={[styles.submit, { backgroundColor: theme.forest }]}
              >
                <Icon name={editing ? 'Check' : 'Plus'} size={16} color={theme.lime} />
                <Text style={[styles.submitText, { color: theme.lime }]}>
                  {editing ? 'Salvar alterações' : 'Publicar conteúdo'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </AppModal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  headCopy: {
    flex: 1,
  },
  kicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 16,
  },
  type: {
    flexBasis: '31%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 9,
  },
  typeText: {
    fontSize: 7,
    fontWeight: '800',
  },
  form: {
    gap: 11,
    marginTop: 16,
  },
  label: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  textarea: {
    height: 78,
    paddingTop: 11,
    textAlignVertical: 'top',
  },
  options: {
    gap: 6,
    paddingRight: 6,
  },
  option: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  optionText: {
    fontSize: 9,
    fontWeight: '800',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  imageOption: {
    width: '23%',
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageThumb: {
    width: '100%',
    height: 48,
  },
  imageLabel: {
    fontSize: 7,
    fontWeight: '700',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  imageCheck: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 11,
    paddingVertical: 11,
    marginTop: 8,
  },
  uploadText: {
    fontSize: 9,
    fontWeight: '800',
  },
  uploadHint: {
    fontSize: 7,
    lineHeight: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  guidePreview: {
    height: 110,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  guidePreviewImage: {
    width: '100%',
    height: '100%',
  },
  preview: {
    height: 92,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 9,
    justifyContent: 'flex-end',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  previewText: {
    alignSelf: 'flex-start',
    margin: 8,
    borderRadius: 8,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  error: {
    fontSize: 9,
    fontWeight: '600',
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 2,
  },
  submitText: {
    fontSize: 11,
    fontWeight: '800',
  },
})
