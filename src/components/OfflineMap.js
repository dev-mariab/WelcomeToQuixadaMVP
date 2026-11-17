import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import * as FileSystem from 'expo-file-system/legacy'
import { useTheme } from '../theme'
import { cityCoordinates } from '../data'
import Icon from './Icon'
import PrimaryButton from './PrimaryButton'

const TILE_SIZE = 256
const TILE_CACHE_DIR = `${FileSystem.documentDirectory || ''}map-tiles/`
const COMPLETE_MARKER = `${TILE_CACHE_DIR}region-complete.json`
const TILE_URL = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`

const REGION = {
  west: -39.4,
  south: -5.4,
  east: -38.5,
  north: -4.5,
  zooms: [9, 10, 11, 12, 13],
}

const INITIAL_REGION = {
  latitude: -5,
  longitude: -39.05,
  latitudeDelta: 1.3,
  longitudeDelta: 1.1,
}

const PLACES = [
  {
    name: 'Quixadá',
    city: 'Quixadá',
    coords: { latitude: -4.9667, longitude: -39.0153 },
    description: 'Centro e principais pontos de Quixadá.',
  },
  {
    name: 'Pedra da Galinha Choca',
    city: 'Quixadá',
    coords: { latitude: -4.954, longitude: -39.023 },
    description: 'Monólito símbolo de Quixadá e principal cartão-postal do Sertão Central.',
  },
  {
    name: 'Serra do Urucum',
    city: 'Quixadá',
    coords: { latitude: -4.949, longitude: -38.952 },
    description: 'Trilhas, mirantes e paisagens de caatinga no entorno de Quixadá.',
  },
  {
    name: 'Açude Cedro',
    city: 'Quixadá',
    coords: { latitude: -4.998, longitude: -39.036 },
    description: 'Um dos primeiros açudes construídos no Ceará, ideal para contemplação.',
  },
  {
    name: 'Pedra do Cruzeiro',
    city: 'Quixadá',
    coords: { latitude: -4.9666, longitude: -39.014 },
    description: 'Inselbergue com cruzeiro no topo e mirante no centro de Quixadá.',
  },
  {
    name: 'Pedra do Cruzeiro',
    city: 'Quixeramobim',
    coords: { latitude: -5.197, longitude: -39.293 },
    description: 'Formação rochosa e mirante em Quixeramobim.',
  },
  {
    name: 'Memorial da Seca',
    city: 'Senador Pompeu',
    coords: { latitude: -5.588, longitude: -39.627 },
    description: 'Patrimônio de memória da seca e da história do Sertão Central.',
  },
  {
    name: 'Açude Umari',
    city: 'Madalena',
    coords: { latitude: -4.8093, longitude: -39.5522 },
    description: 'Reservatório próximo à comunidade de Salgadinho, a cerca de 5 km da sede de Madalena.',
  },
]

function lonToTile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom)
}

function latToTile(lat, zoom) {
  const rad = (lat * Math.PI) / 180
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom,
  )
}

function lonToPixel(lon, zoom) {
  return ((lon + 180) / 360) * TILE_SIZE * 2 ** zoom
}

function latToPixel(lat, zoom) {
  const radians = (lat * Math.PI) / 180
  const sin = Math.sin(radians)
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * TILE_SIZE * 2 ** zoom
}

function zoomForRegion(region) {
  const delta = Math.max(region.latitudeDelta, region.longitudeDelta)
  return Math.min(13, Math.max(9, Math.round(Math.log2(360 / delta)) + 1))
}

function tileSource(tile, installed) {
  if (installed && FileSystem.documentDirectory) {
    return { uri: `${TILE_CACHE_DIR}${tile.z}/${tile.x}/${tile.y}` }
  }
  return { uri: TILE_URL(tile.z, tile.x, tile.y) }
}

function buildTileList() {
  const tiles = []
  for (const zoom of REGION.zooms) {
    const xMin = lonToTile(REGION.west, zoom)
    const xMax = lonToTile(REGION.east, zoom)
    const yMin = latToTile(REGION.north, zoom)
    const yMax = latToTile(REGION.south, zoom)
    for (let x = xMin; x <= xMax; x += 1) {
      for (let y = yMin; y <= yMax; y += 1) {
        tiles.push({ z: zoom, x, y })
      }
    }
  }
  return tiles
}

export default function OfflineMap({ city, focus, onMapDownloaded, onToast }) {
  const theme = useTheme()
  const mountedRef = useRef(true)
  const scrollRef = useRef(null)
  const [installed, setInstalled] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selected, setSelected] = useState(null)
  const [zoomScale, setZoomScale] = useState(1)
  const cityPlaces = PLACES.filter((place) => place.city === city)
  const center = cityCoordinates[city]
  const focusLatitude = Number(focus?.latitude)
  const focusLongitude = Number(focus?.longitude)
  const hasFocusCoords = Number.isFinite(focusLatitude) && Number.isFinite(focusLongitude)
  const focusPlace = hasFocusCoords
    ? {
        name: focus?.name || 'Trilha',
        city,
        coords: { latitude: focusLatitude, longitude: focusLongitude },
        description: focus?.description || `Localização de ${focus?.name || 'trilha'} em ${city}.`,
      }
    : focus?.name
      ? cityPlaces.find((place) => place.name === focus.name)
      : null
  const visiblePlaces = focusPlace
    ? [focusPlace]
    : cityPlaces.length || !center
      ? cityPlaces
      : [
          {
            name: city,
            city,
            coords: center,
            description: `Centro e principais pontos de ${city}.`,
          },
        ]
  const initialRegion = focusPlace
    ? {
        latitude: focusPlace.coords.latitude,
        longitude: focusPlace.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.07,
      }
    : center
      ? {
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.35,
          longitudeDelta: 0.3,
        }
      : INITIAL_REGION
  const activePlace =
    selected && visiblePlaces.some((place) => place.name === selected.name)
      ? selected
      : visiblePlaces[0]

  const mapLayout = useMemo(() => {
    const zoom = zoomForRegion(initialRegion)
    const north = Math.min(85, initialRegion.latitude + initialRegion.latitudeDelta / 2)
    const south = Math.max(-85, initialRegion.latitude - initialRegion.latitudeDelta / 2)
    const west = initialRegion.longitude - initialRegion.longitudeDelta / 2
    const east = initialRegion.longitude + initialRegion.longitudeDelta / 2
    const xMin = lonToTile(west, zoom)
    const xMax = lonToTile(east, zoom)
    const yMin = latToTile(north, zoom)
    const yMax = latToTile(south, zoom)
    const tiles = []
    for (let x = xMin; x <= xMax; x += 1) {
      for (let y = yMin; y <= yMax; y += 1) {
        tiles.push({ z: zoom, x, y })
      }
    }
    return {
      zoom,
      xMin,
      yMin,
      tiles,
      width: (xMax - xMin + 1) * TILE_SIZE,
      height: (yMax - yMin + 1) * TILE_SIZE,
      centerX: lonToPixel(initialRegion.longitude, zoom) - xMin * TILE_SIZE,
      centerY: latToPixel(initialRegion.latitude, zoom) - yMin * TILE_SIZE,
      viewportWidth: Math.max(240, Dimensions.get('window').width - 40),
    }
  }, [
    initialRegion.latitude,
    initialRegion.longitude,
    initialRegion.latitudeDelta,
    initialRegion.longitudeDelta,
  ])

  useEffect(() => {
    mountedRef.current = true
    async function checkCache() {
      try {
        if (!FileSystem.documentDirectory) return
        const info = await FileSystem.getInfoAsync(COMPLETE_MARKER)
        if (!mountedRef.current) return
        if (info.exists) {
          setInstalled(true)
          if (onMapDownloaded) onMapDownloaded()
        }
      } catch (error) {
        if (mountedRef.current) setInstalled(false)
      }
    }
    checkCache()
    return () => {
      mountedRef.current = false
    }
  }, [])

  async function downloadRegion() {
    if (downloading) return
    if (installed) {
      if (onToast) onToast('O mapa offline já está instalado')
      return
    }
    if (!FileSystem.documentDirectory) {
      if (onToast) onToast('Armazenamento local indisponível neste dispositivo')
      return
    }

    const tiles = buildTileList()
    const total = tiles.length
    let done = 0
    let success = 0
    let failed = 0

    setDownloading(true)
    setProgress(0)

    const directories = [
      ...new Set(tiles.map((tile) => `${TILE_CACHE_DIR}${tile.z}/${tile.x}/`)),
    ]
    try {
      await FileSystem.makeDirectoryAsync(TILE_CACHE_DIR, { intermediates: true })
      for (const directory of directories) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true })
      }
    } catch (error) {
      if (mountedRef.current) setDownloading(false)
      if (onToast) onToast('Não foi possível preparar o cache do mapa')
      return
    }

    async function downloadTile(tile) {
      const directory = `${TILE_CACHE_DIR}${tile.z}/${tile.x}/`
      const destination = `${directory}${tile.y}`
      try {
        const existing = await FileSystem.getInfoAsync(destination)
        if (!existing.exists) {
          await FileSystem.downloadAsync(TILE_URL(tile.z, tile.x, tile.y), destination, {
            headers: { 'User-Agent': 'WelcomeToQuixada/1.0 (educational app)' },
          })
        }
        success += 1
      } catch (error) {
        failed += 1
      } finally {
        done += 1
        if (mountedRef.current) {
          setProgress(Math.round((done / total) * 100))
        }
      }
    }

    const queue = [...tiles]
    const workers = Array.from({ length: 6 }, async () => {
      while (queue.length) {
        await downloadTile(queue.shift())
      }
    })

    try {
      await Promise.all(workers)
      if (failed === 0) {
        await FileSystem.writeAsStringAsync(
          COMPLETE_MARKER,
          JSON.stringify({ downloadedAt: new Date().toISOString(), total }),
        )
        if (mountedRef.current) setInstalled(true)
        if (onMapDownloaded) onMapDownloaded()
        if (onToast) onToast(`Mapa offline instalado (${total} tiles em cache)`)
      } else if (onToast) {
        onToast(`Download incompleto: ${success}/${total} tiles. Tente novamente.`)
      }
    } catch (error) {
      if (onToast) onToast('Não foi possível baixar todos os tiles offline')
    } finally {
      if (mountedRef.current) setDownloading(false)
    }
  }

  function markerStyle(place) {
    return {
      left: lonToPixel(place.coords.longitude, mapLayout.zoom) - mapLayout.xMin * TILE_SIZE - 12,
      top: latToPixel(place.coords.latitude, mapLayout.zoom) - mapLayout.yMin * TILE_SIZE - 30,
    }
  }

  function centerMap() {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({
      x: Math.max(0, mapLayout.centerX - mapLayout.viewportWidth / 2),
      y: Math.max(0, mapLayout.centerY - 320 / 2),
      animated: false,
    })
  }

  function changeZoom(nextScale) {
    const scale = Math.min(4, Math.max(1, Math.round(nextScale * 10) / 10))
    setZoomScale(scale)
    if (scrollRef.current) scrollRef.current.zoomTo(scale, true)
  }

  function handleZoom(event) {
    const scale = event.nativeEvent.zoomScale
    if (Number.isFinite(scale) && Math.abs(scale - zoomScale) > 0.05) {
      setZoomScale(Math.round(scale * 10) / 10)
    }
  }

  return (
    <View style={[styles.wrap, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      <View style={styles.mapFrame}>
        <ScrollView
          key={`${city}-${focus?.name || 'all'}-${focus?.latitude || ''}`}
          ref={scrollRef}
          style={styles.map}
          contentContainerStyle={{ width: mapLayout.width, height: mapLayout.height }}
          contentOffset={{
            x: Math.max(0, mapLayout.centerX - mapLayout.viewportWidth / 2),
            y: Math.max(0, mapLayout.centerY - 320 / 2),
          }}
          onContentSizeChange={centerMap}
          onScroll={handleZoom}
          scrollEventThrottle={100}
          minimumZoomScale={1}
          maximumZoomScale={4}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: mapLayout.width, height: mapLayout.height }}>
            {mapLayout.tiles.map((tile) => (
              <Image
                key={`${tile.z}-${tile.x}-${tile.y}`}
                source={tileSource(tile, installed)}
                resizeMode="stretch"
                style={[
                  styles.tile,
                  {
                    left: (tile.x - mapLayout.xMin) * TILE_SIZE,
                    top: (tile.y - mapLayout.yMin) * TILE_SIZE,
                  },
                ]}
              />
            ))}
            {visiblePlaces.map((place) => (
              <Pressable
                key={place.name}
                onPress={() => setSelected(place)}
                style={[
                  styles.marker,
                  markerStyle(place),
                  { backgroundColor: theme.surface, borderColor: theme.forest },
                ]}
              >
                <Icon name="MapPin" size={18} color={theme.forest} />
                <Text style={[styles.markerLabel, { color: theme.ink }]} numberOfLines={1}>
                  {place.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.badge, { backgroundColor: theme.forest }]} pointerEvents="none">
          <Icon name="Map" size={12} color={theme.lime} />
          <Text style={[styles.badgeText, { color: theme.lime }]}>MAPA</Text>
        </View>

        <View style={styles.zoomControls}>
          <Pressable
            accessibilityLabel="Aproximar mapa"
            onPress={() => changeZoom(zoomScale + 0.5)}
            style={[styles.zoomButton, { backgroundColor: theme.surface, borderColor: theme.line }]}
          >
            <Text style={[styles.zoomText, { color: theme.ink }]}>+</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Afastar mapa"
            onPress={() => changeZoom(zoomScale - 0.5)}
            style={[styles.zoomButton, { backgroundColor: theme.surface, borderColor: theme.line }]}
          >
            <Text style={[styles.zoomText, { color: theme.ink }]}>−</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.detail}>
        <View style={styles.detailHead}>
          <Icon name="MapPin" size={15} color={theme.forest} />
          <Text style={[styles.detailTitle, { color: theme.ink }]}>
            {activePlace ? activePlace.name : city}
          </Text>
        </View>
        <Text style={[styles.detailText, { color: theme.muted }]}>
          {activePlace ? activePlace.description : `Pontos e serviços de ${city}.`}
        </Text>
        <Text style={[styles.legend, { color: theme.muted }]}>
          {focusPlace
            ? 'Mapa focado apenas neste ponto da trilha. Os tiles ficam salvos no aparelho para uso sem internet.'
            : 'Toque nos marcadores para explorar. Os tiles ficam salvos no aparelho para uso sem internet.'}
        </Text>
      </View>

      {downloading || installed ? (
        <View style={styles.progress}>
          <View style={[styles.progressTrack, { backgroundColor: theme.line }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.forest,
                  width: `${installed ? 100 : progress}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.muted }]}>
            {installed
              ? 'Mapa offline instalado neste aparelho'
              : `Baixando tiles offline… ${progress}%`}
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label={installed ? 'Mapa instalado' : 'Baixar mapa offline'}
        onPress={downloadRegion}
        disabled={downloading || installed}
        icon="Map"
        style={styles.button}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  mapFrame: {
    height: 320,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  marker: {
    position: 'absolute',
    width: 112,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  markerLabel: {
    fontSize: 8,
    fontWeight: '800',
    maxWidth: 104,
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    top: 10,
    gap: 6,
  },
  zoomButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
  },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  detail: {
    padding: 12,
  },
  detailHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  detailText: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  legend: {
    fontSize: 7,
    lineHeight: 11,
    marginTop: 6,
  },
  progress: {
    paddingHorizontal: 12,
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
  button: {
    marginHorizontal: 12,
    marginBottom: 12,
    marginTop: 8,
  },
})
