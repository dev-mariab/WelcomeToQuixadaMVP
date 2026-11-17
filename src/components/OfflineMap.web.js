import { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../theme'
import { cityCoordinates } from '../data'
import Icon from './Icon'
import PrimaryButton from './PrimaryButton'

const CACHE_DB = 'quixada-offline-tiles'
const CACHE_STORE = 'tiles'
const REGION_FLAG = 'quixada:offline-region-downloaded'
const TILE_URL = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors'

const REGION = {
  west: -39.4,
  south: -5.4,
  east: -38.5,
  north: -4.5,
  zooms: [9, 10, 11, 12, 13],
}

const MARKERS = [
  { name: 'Quixadá', city: 'Quixadá', coords: [-39.0153, -4.9667] },
  { name: 'Pedra da Galinha Choca', city: 'Quixadá', coords: [-39.023, -4.954] },
  { name: 'Serra do Urucum', city: 'Quixadá', coords: [-38.952, -4.949] },
  { name: 'Açude Cedro', city: 'Quixadá', coords: [-39.036, -4.998] },
  { name: 'Pedra do Cruzeiro', city: 'Quixadá', coords: [-39.014, -4.9666] },
  { name: 'Pedra do Cruzeiro', city: 'Quixeramobim', coords: [-39.293, -5.197] },
  { name: 'Memorial da Seca', city: 'Senador Pompeu', coords: [-39.627, -5.588] },
  { name: 'Açude Umari', city: 'Madalena', coords: [-39.5522, -4.8093] },
]

let databasePromise = null

function hasDownloadedRegion() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(REGION_FLAG) === '1'
  } catch (error) {
    return false
  }
}

function markRegionDownloaded() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(REGION_FLAG, '1')
  } catch (error) {
    // Sem localStorage, o cache de tiles continua disponível nesta sessão.
  }
}

function openDatabase() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_DB, 1)
      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(CACHE_STORE)) db.createObjectStore(CACHE_STORE)
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return databasePromise
}

async function readTile(key) {
  try {
    const db = await openDatabase()
    if (!db) return null
    return await new Promise((resolve) => {
      const request = db.transaction(CACHE_STORE, 'readonly').objectStore(CACHE_STORE).get(key)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  } catch (error) {
    return null
  }
}

async function writeTile(key, buffer) {
  try {
    const db = await openDatabase()
    if (!db) return
    await new Promise((resolve) => {
      const request = db.transaction(CACHE_STORE, 'readwrite').objectStore(CACHE_STORE).put(buffer, key)
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
    })
  } catch (error) {
    // Ignora falhas de cache; o mapa continua online.
  }
}

async function fetchTile(z, x, y) {
  const response = await fetch(TILE_URL(z, x, y))
  if (!response.ok) throw new Error(`Tile ${z}/${x}/${y} indisponível`)
  return response.arrayBuffer()
}

async function loadTile(z, x, y) {
  const key = `${z}/${x}/${y}`
  const cached = await readTile(key)
  if (cached) return cached
  const buffer = await fetchTile(z, x, y)
  await writeTile(key, buffer)
  return buffer
}

function lonToTile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * 2 ** zoom)
}

function latToTile(lat, zoom) {
  const rad = (lat * Math.PI) / 180
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom,
  )
}

async function cacheRegion(onProgress) {
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

  const total = tiles.length
  let done = 0
  let success = 0
  let failed = 0
  const workers = Array.from({ length: 6 }, async () => {
    while (tiles.length) {
      const tile = tiles.shift()
      try {
        await loadTile(tile.z, tile.x, tile.y)
        success += 1
      } catch (error) {
        failed += 1
      }
      done += 1
      if (onProgress) onProgress(Math.round((done / total) * 100))
    }
  })
  await Promise.all(workers)
  return { total, success, failed }
}

const CachedTileLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const tile = document.createElement('img')
    tile.alt = ''
    tile.setAttribute('role', 'presentation')
    const key = `${coords.z}/${coords.x}/${coords.y}`
    let objectUrl = null

    const attach = (buffer) => {
      objectUrl = URL.createObjectURL(new Blob([buffer], { type: 'image/png' }))
      tile.onload = () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        done(null, tile)
      }
      tile.onerror = (error) => {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        done(error, tile)
      }
      tile.src = objectUrl
    }

    readTile(key)
      .then((cached) => {
        if (cached) return attach(cached)
        return fetchTile(coords.z, coords.x, coords.y)
          .then((buffer) => {
            writeTile(key, buffer)
            attach(buffer)
          })
          .catch((error) => done(error, tile))
      })
      .catch((error) => done(error, tile))

    return tile
  },
})

function buildTileLayer() {
  return new CachedTileLayer('', {
    minZoom: 9,
    maxZoom: 19,
    tileSize: 256,
    attribution: TILE_ATTRIBUTION,
  })
}

export default function OfflineMap({ city, focus, onMapDownloaded, onToast }) {
  const theme = useTheme()
  const containerRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [installed, setInstalled] = useState(hasDownloadedRegion)
  const center = cityCoordinates[city]
  const cityMarkers = MARKERS.filter((marker) => marker.city === city)
  const focusLatitude = Number(focus?.latitude)
  const focusLongitude = Number(focus?.longitude)
  const hasFocusCoords =
    Number.isFinite(focusLatitude) && Number.isFinite(focusLongitude)
  const focusMarker = hasFocusCoords
    ? {
        name: focus?.name || 'Trilha',
        coords: [focusLongitude, focusLatitude],
      }
    : focus?.name
      ? cityMarkers.find((marker) => marker.name === focus.name)
      : null
  const markers = focusMarker
    ? [focusMarker]
    : cityMarkers.length || !center
      ? cityMarkers
      : [{ name: city, coords: [center.longitude, center.latitude] }]
  const centerLngLat = focusMarker
    ? focusMarker.coords
    : center
      ? [center.longitude, center.latitude]
      : [-39.05, -5]
  const focusKey = focusMarker
    ? `${focusMarker.name}:${focusMarker.coords[0]}:${focusMarker.coords[1]}`
    : ''

  useEffect(() => {
    if (!containerRef.current) return
    const map = L.map(containerRef.current, {
      center: [centerLngLat[1], centerLngLat[0]],
      zoom: focusMarker ? 14 : center ? 12 : 10,
      zoomControl: false,
      attributionControl: true,
    })

    buildTileLayer().addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)

    markers.forEach((marker) => {
      L.circleMarker([marker.coords[1], marker.coords[0]], {
        radius: 7,
        color: '#30130f',
        weight: 2,
        fillColor: '#bd5c25',
        fillOpacity: 1,
      })
        .bindPopup(marker.name)
        .addTo(map)
    })

    const timer = setTimeout(() => map.invalidateSize(), 0)
    let observer = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => map.invalidateSize())
      observer.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timer)
      if (observer) observer.disconnect()
      map.remove()
    }
  }, [city, focusKey])

  async function startDownload() {
    if (downloading) return
    if (installed) {
      if (onToast) onToast('O mapa offline já está instalado')
      return
    }
    setDownloading(true)
    setProgress(0)
    try {
      const result = await cacheRegion(setProgress)
      if (result.success < result.total) {
        if (onToast) {
          onToast(
            `Download incompleto: ${result.success}/${result.total} tiles. Tente novamente.`,
          )
        }
        return
      }
      markRegionDownloaded()
      setInstalled(true)
      if (onMapDownloaded) onMapDownloaded()
      if (onToast) onToast(`Mapa offline instalado (${result.total} tiles em cache)`)
    } catch (error) {
      if (onToast) onToast('Não foi possível baixar todos os tiles offline')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.mapFrame, { borderColor: theme.line }]}>
        <View ref={containerRef} style={styles.map} />
        <View style={[styles.badge, { borderColor: theme.line }]}>
          <Icon name="Map" size={12} color={theme.forest} />
          <Text style={[styles.badgeText, { color: theme.forest }]}>MAPA</Text>
        </View>
      </View>

      <Text style={[styles.caption, { color: theme.muted }]}>
        {focusMarker
          ? `Mapa focado apenas em ${focusMarker.name}.`
          : `Toque nos marcadores para ver os atrativos de ${city}.`}
      </Text>

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
              ? 'Mapa offline instalado neste navegador'
              : `Baixando tiles offline… ${progress}%`}
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label={installed ? 'Mapa instalado' : 'Baixar mapa offline'}
        onPress={startDownload}
        disabled={downloading || installed}
        icon="Map"
        style={styles.button}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    gap: 8,
  },
  mapFrame: {
    height: 320,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 500,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.94)',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  caption: {
    fontSize: 8,
    lineHeight: 12,
  },
  progress: {
    marginTop: 2,
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
    marginTop: 2,
  },
})
