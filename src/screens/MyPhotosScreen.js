import * as ImagePicker from 'expo-image-picker'
import { useRef, useState } from 'react'
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
import { useTheme } from '../theme'
import { imageSource } from '../utils'
import { api } from '../api'
import AppModal from '../components/AppModal'
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

export default function MyPhotosScreen({
  photos = [],
  places = [],
  city,
  onAddPhoto,
  onRemovePhoto,
  onBack,
  onNotifications,
  unread,
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [composerOpen, setComposerOpen] = useState(false)
  const [viewer, setViewer] = useState(null)
  const [draft, setDraft] = useState(null)
  const [placeId, setPlaceId] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const uploadLock = useRef(false)

  const cityPlaces = places.filter((place) => place.city === city)

  function openComposer() {
    setDraft(null)
    setPlaceId('')
    setCaption('')
    setError('')
    setUploading(false)
    setComposerOpen(true)
  }

  function closeComposer() {
    if (uploading) return
    setComposerOpen(false)
    setDraft(null)
    setCaption('')
    setPlaceId('')
    setError('')
  }

  async function pickImage(source) {
    if (uploading) return
    setError('')
    try {
      if (Platform.OS !== 'web') {
        const permission =
          source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (!permission.granted) {
          setError('Permita o acesso à câmera e às fotos para continuar.')
          return
        }
      }
      const options = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
        base64: true,
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options)
      if (result.canceled) return
      const asset = result.assets?.[0]
      if (!asset?.base64) {
        setError('Não foi possível ler a imagem selecionada.')
        return
      }
      setDraft({
        uri: asset.uri,
        base64: asset.base64,
        mimeType: asset.mimeType || 'image/jpeg',
      })
    } catch (pickError) {
      setError('Não foi possível abrir a câmera ou a galeria.')
    }
  }

  async function savePhoto() {
    if (!draft || uploadLock.current) return
    uploadLock.current = true
    setUploading(true)
    setError('')
    const selectedPlace = cityPlaces.find((place) => place.id === placeId)
    try {
      const uploaded = await api.uploadImage({
        data: draft.base64,
        mimeType: draft.mimeType,
      })
      if (!uploaded?.url) throw new Error('Falha ao enviar a imagem.')
      onAddPhoto?.({
        url: uploaded.url,
        city,
        placeId: selectedPlace?.id || '',
        placeName: selectedPlace?.name || '',
        caption: caption.trim(),
        createdAt: new Date().toISOString(),
      })
      setComposerOpen(false)
      setDraft(null)
      setCaption('')
      setPlaceId('')
    } catch (uploadError) {
      setError('Não foi possível enviar a foto. Verifique sua conexão e tente novamente.')
    } finally {
      uploadLock.current = false
      setUploading(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.paper }}>
      <Header
        title="Minhas fotos"
        subtitle="Sua galeria de viagem"
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
            <Icon name="Camera" size={22} color={theme.lime} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={[styles.summaryTitle, { color: theme.ink }]}>
              {photos.length
                ? `${photos.length} ${photos.length === 1 ? 'foto salva' : 'fotos salvas'}`
                : 'Nenhuma foto ainda'}
            </Text>
            <Text style={[styles.summaryText, { color: theme.muted }]}>
              Guarde os melhores momentos da sua viagem pelo Sertão Central.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={openComposer}
          style={[styles.addButton, { backgroundColor: theme.forest }]}
        >
          <Icon name="ImagePlus" size={18} color={theme.lime} />
          <Text style={[styles.addButtonText, { color: theme.lime }]}>
            Adicionar foto
          </Text>
        </TouchableOpacity>

        {photos.length ? (
          <View style={styles.grid}>
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                activeOpacity={0.85}
                onPress={() => setViewer(photo)}
                style={[
                  styles.photoCard,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <Image
                  source={imageSource(photo.url)}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <View style={styles.photoCopy}>
                  <Text
                    style={[styles.photoTitle, { color: theme.ink }]}
                    numberOfLines={1}
                  >
                    {photo.placeName || photo.city || city}
                  </Text>
                  <Text
                    style={[styles.photoMeta, { color: theme.muted }]}
                    numberOfLines={1}
                  >
                    {photo.caption || formatDate(photo.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.line }]}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.sand }]}>
              <Icon name="ImagePlus" size={24} color={theme.forest} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.ink }]}>
              Comece pela primeira foto
            </Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Escolha uma imagem da galeria ou tire uma foto durante o passeio.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openComposer}
              style={[styles.emptyButton, { borderColor: theme.line }]}
            >
              <Icon name="Plus" size={16} color={theme.forest} />
              <Text style={[styles.emptyButtonText, { color: theme.forest }]}>
                Adicionar agora
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AppModal
        visible={composerOpen}
        transparent
        animationType="slide"
        onRequestClose={closeComposer}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeComposer}
            accessibilityLabel="Fechar formulário de foto"
          />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.paper,
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <View style={styles.modalHead}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalKicker, { color: theme.kicker }]}>
                  SUA GALERIA
                </Text>
                <Text style={[styles.modalTitle, { color: theme.ink }]}>
                  Adicionar foto
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeComposer}
                activeOpacity={0.8}
                style={[styles.modalClose, { backgroundColor: theme.sand }]}
              >
                <Icon name="X" size={18} color={theme.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.preview, { borderColor: theme.line }]}>
                {draft ? (
                  <Image
                    source={{ uri: draft.uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.previewEmpty}>
                    <Icon name="ImagePlus" size={30} color={theme.forest} />
                    <Text style={[styles.previewEmptyText, { color: theme.muted }]}>
                      Escolha uma foto para começar
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.pickerRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => pickImage('gallery')}
                  style={[
                    styles.pickerButton,
                    { backgroundColor: theme.sand, borderColor: theme.line },
                  ]}
                >
                  <Icon name="ImagePlus" size={17} color={theme.forest} />
                  <Text style={[styles.pickerText, { color: theme.forest }]}>
                    Galeria
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => pickImage('camera')}
                  style={[
                    styles.pickerButton,
                    { backgroundColor: theme.sand, borderColor: theme.line },
                  ]}
                >
                  <Icon name="Camera" size={17} color={theme.forest} />
                  <Text style={[styles.pickerText, { color: theme.forest }]}>
                    Câmera
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: theme.muted }]}>
                LOCAL DA FOTO
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setPlaceId('')}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: placeId ? theme.surface : theme.forest,
                      borderColor: placeId ? theme.line : theme.forest,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: placeId ? theme.muted : theme.lime },
                    ]}
                  >
                    {city}
                  </Text>
                </TouchableOpacity>
                {cityPlaces.map((place) => {
                  const active = placeId === place.id
                  return (
                    <TouchableOpacity
                      key={place.id}
                      activeOpacity={0.85}
                      onPress={() => setPlaceId(place.id)}
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
                        {place.name}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>

              <Text style={[styles.label, { color: theme.muted }]}>LEGENDA</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Conte o que tornou esse momento especial..."
                placeholderTextColor={theme.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: theme.line,
                    color: theme.ink,
                  },
                ]}
                maxLength={120}
              />

              {error ? (
                <Text style={[styles.error, { color: theme.heart }]}>{error}</Text>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={savePhoto}
                disabled={!draft || uploading}
                style={[
                  styles.saveButton,
                  { backgroundColor: draft && !uploading ? theme.forest : theme.line },
                ]}
              >
                <Icon
                  name={uploading ? 'Clock3' : 'Check'}
                  size={17}
                  color={draft && !uploading ? theme.lime : theme.muted}
                />
                <Text
                  style={[
                    styles.saveButtonText,
                    { color: draft && !uploading ? theme.lime : theme.muted },
                  ]}
                >
                  {uploading ? 'Enviando foto...' : 'Salvar foto'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </AppModal>

      <AppModal
        visible={Boolean(viewer)}
        transparent
        animationType="slide"
        onRequestClose={() => setViewer(null)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setViewer(null)}
            accessibilityLabel="Fechar foto"
          />
          <View
            style={[
              styles.viewerSheet,
              {
                backgroundColor: theme.paper,
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            <View style={styles.modalHead}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalKicker, { color: theme.kicker }]}>
                  MINHA FOTO
                </Text>
                <Text style={[styles.modalTitle, { color: theme.ink }]} numberOfLines={1}>
                  {viewer?.placeName || viewer?.city || city}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setViewer(null)}
                activeOpacity={0.8}
                style={[styles.modalClose, { backgroundColor: theme.sand }]}
              >
                <Icon name="X" size={18} color={theme.ink} />
              </TouchableOpacity>
            </View>
            {viewer ? (
              <Image
                source={imageSource(viewer.url)}
                style={styles.viewerImage}
                resizeMode="cover"
              />
            ) : null}
            <Text style={[styles.viewerMeta, { color: theme.muted }]}>
              {[viewer?.city, formatDate(viewer?.createdAt)].filter(Boolean).join(' · ')}
            </Text>
            {viewer?.caption ? (
              <Text style={[styles.viewerCaption, { color: theme.ink }]}>
                {viewer.caption}
              </Text>
            ) : null}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (viewer) onRemovePhoto?.(viewer.id)
                setViewer(null)
              }}
              style={[styles.deleteButton, { borderColor: theme.line }]}
            >
              <Icon name="Trash2" size={17} color={theme.heart} />
              <Text style={[styles.deleteText, { color: theme.heart }]}>
                Excluir foto
              </Text>
            </TouchableOpacity>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoCard: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 118,
  },
  photoCopy: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 2,
  },
  photoTitle: {
    fontSize: 10,
    fontWeight: '800',
  },
  photoMeta: {
    fontSize: 8,
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginTop: 4,
  },
  emptyButtonText: {
    fontSize: 10,
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
    maxHeight: '92%',
  },
  viewerSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
    gap: 10,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
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
  preview: {
    height: 168,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewEmpty: {
    alignItems: 'center',
    gap: 8,
  },
  previewEmptyText: {
    fontSize: 9,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 10,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 16,
    marginBottom: 7,
  },
  chips: {
    gap: 7,
    paddingRight: 6,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 11,
  },
  error: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 13,
    paddingVertical: 13,
    marginTop: 16,
    marginBottom: 6,
  },
  saveButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  viewerImage: {
    width: '100%',
    height: 260,
    borderRadius: 16,
  },
  viewerMeta: {
    fontSize: 9,
    fontWeight: '700',
  },
  viewerCaption: {
    fontSize: 11,
    lineHeight: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 13,
    paddingVertical: 11,
    marginTop: 4,
  },
  deleteText: {
    fontSize: 10,
    fontWeight: '800',
  },
})

