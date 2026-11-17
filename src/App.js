import AsyncStorage from '@react-native-async-storage/async-storage'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BackHandler, Platform, StyleSheet, View, useWindowDimensions } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LanguageProvider } from './i18n'
import { ThemeContext, palettes } from './theme'
import { api } from './api'
import {
  PHONE_FRAME_BORDER,
  PHONE_HEIGHT,
  PHONE_WIDTH,
  getWebPhoneScale,
} from './layout'
import {
  categories as seedCategories,
  events as seedEvents,
  fallbackLodgings,
  fallbackPlaces,
  guides as seedGuides,
  notifications as seedNotifications,
  seedRestaurants,
  trails as seedTrails,
} from './data'
import BottomNav from './components/BottomNav'
import CreateContentModal from './components/CreateContentModal'
import NotificationsPanel from './components/NotificationsPanel'
import Toast from './components/Toast'
import AuthScreen from './screens/AuthScreen'
import HomeScreen from './screens/HomeScreen'
import ExploreScreen from './screens/ExploreScreen'
import TrailsScreen from './screens/TrailsScreen'
import AgendaScreen from './screens/AgendaScreen'
import GuidesScreen from './screens/GuidesScreen'
import ServicesScreen from './screens/ServicesScreen'
import ProfileScreen from './screens/ProfileScreen'
import MyPhotosScreen from './screens/MyPhotosScreen'
import RecordsScreen from './screens/RecordsScreen'
import PlaceDetail from './screens/PlaceDetail'
import AdminScreen from './screens/AdminScreen'

const STORAGE_KEY = 'welcome-quixada:prefs'
const initialEvents = seedEvents.map((event, index) => ({
  ...event,
  id: `evt-${index + 1}`,
}))
const initialGuides = seedGuides.map((guide, index) => ({
  ...guide,
  id: `guide-${index + 1}`,
}))
const initialTrails = seedTrails.map((trail, index) => ({
  ...trail,
  id: `trail-${index + 1}`,
}))
const initialRestaurants = seedRestaurants.map((restaurant) => ({ ...restaurant }))

function initialsFor(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function AppShell() {
  const insets = useSafeAreaInsets()
  const [dark, setDark] = useState(false)
  const [language, setLanguage] = useState('pt')
  const [ready, setReady] = useState(false)
  const [saved, setSaved] = useState([])
  const [read, setRead] = useState([])
  const [role, setRole] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tab, setTab] = useState('inicio')
  const [city, setCity] = useState('Quixadá')
  const [places, setPlaces] = useState(fallbackPlaces)
  const [lodgings, setLodgings] = useState(fallbackLodgings)
  const [restaurants, setRestaurants] = useState(initialRestaurants)
  const [events, setEvents] = useState(initialEvents)
  const [guides, setGuides] = useState(initialGuides)
  const [trails, setTrails] = useState(initialTrails)
  const [categories, setCategories] = useState(seedCategories)
  const [accesses, setAccesses] = useState([])
  const [reviews, setReviews] = useState([])
  const [photos, setPhotos] = useState([])
  const [supportMessages, setSupportMessages] = useState([])
  const [mapDownloaded, setMapDownloaded] = useState(false)
  const [mapFocus, setMapFocus] = useState(null)
  const [selected, setSelected] = useState(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState('place')
  const [createEditing, setCreateEditing] = useState(null)
  const [servicesInitial, setServicesInitial] = useState(null)
  const [profileView, setProfileView] = useState(null)
  const toastTimer = useRef(null)
  const tabHistory = useRef([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw && active) {
          const prefs = JSON.parse(raw)
          if (prefs && typeof prefs === 'object') {
            setDark(Boolean(prefs.dark))
            if (typeof prefs.language === 'string') setLanguage(prefs.language)
            if (typeof prefs.city === 'string' && prefs.city) setCity(prefs.city)
            if (typeof prefs.mapDownloaded === 'boolean') {
              setMapDownloaded(prefs.mapDownloaded)
            }
            if (Array.isArray(prefs.saved)) setSaved(prefs.saved)
            if (Array.isArray(prefs.read)) setRead(prefs.read)
            if (Array.isArray(prefs.places)) setPlaces(prefs.places)
            if (Array.isArray(prefs.lodgings)) setLodgings(prefs.lodgings)
            if (Array.isArray(prefs.restaurants)) setRestaurants(prefs.restaurants)
            if (Array.isArray(prefs.events)) setEvents(prefs.events)
            if (Array.isArray(prefs.guides)) setGuides(prefs.guides)
            if (Array.isArray(prefs.trails)) setTrails(prefs.trails)
            if (Array.isArray(prefs.categories)) setCategories(prefs.categories)
            if (Array.isArray(prefs.accesses)) setAccesses(prefs.accesses)
            if (Array.isArray(prefs.reviews)) setReviews(prefs.reviews)
            if (Array.isArray(prefs.photos)) setPhotos(prefs.photos)
            if (Array.isArray(prefs.supportMessages)) {
              setSupportMessages(prefs.supportMessages)
            }
          }
        }
      } catch (error) {
        // Mantém os dados de exemplo quando o cache local não está disponível.
      }

      try {
        const data = await api.bootstrap()
        if (data && active) {
          if (Array.isArray(data.places)) setPlaces(data.places)
          if (Array.isArray(data.lodgings)) setLodgings(data.lodgings)
          if (Array.isArray(data.restaurants)) setRestaurants(data.restaurants)
          if (Array.isArray(data.events)) setEvents(data.events)
          if (Array.isArray(data.guides)) setGuides(data.guides)
          if (Array.isArray(data.trails)) setTrails(data.trails)
          if (Array.isArray(data.categories)) setCategories(data.categories)
          if (Array.isArray(data.reviews)) setReviews(data.reviews)
          if (Array.isArray(data.supportMessages)) {
            setSupportMessages(data.supportMessages)
          }
          if (Array.isArray(data.accesses)) setAccesses(data.accesses)
        }
      } catch (error) {
        // API indisponível: o app continua funcionando com cache local.
      }

      if (active) setReady(true)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dark,
        language,
        city,
        saved,
        read,
        places,
        lodgings,
        restaurants,
        events,
        guides,
        trails,
        categories,
        accesses,
        reviews,
        photos,
        supportMessages,
        mapDownloaded,
      }),
    ).catch(() => {})
  }, [
    dark,
    language,
    city,
    saved,
    read,
    places,
    lodgings,
    restaurants,
    events,
    guides,
    trails,
    categories,
    accesses,
    reviews,
    photos,
    supportMessages,
    mapDownloaded,
    ready,
  ])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selected) {
        setSelected(null)
        return true
      }
      if (profileView) {
        setProfileView(null)
        return true
      }
      if (notificationsOpen) {
        setNotificationsOpen(false)
        return true
      }
      if (createOpen) {
        setCreateOpen(false)
        setCreateEditing(null)
        return true
      }
      if (tab !== 'inicio') {
        goBack()
        return true
      }
      return false
    })
    return () => subscription.remove()
  }, [selected, profileView, notificationsOpen, createOpen, tab])

  const theme = dark ? palettes.dark : palettes.light

  const showToast = useCallback((text) => {
    setToast(text)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  const cityNotifications = useMemo(
    () =>
      seedNotifications.filter((item) => item.city === city),
    [city],
  )

  const unread = useMemo(
    () => cityNotifications.filter((item) => !read.includes(item.id)).length,
    [cityNotifications, read],
  )

  const savedPlaces = useMemo(
    () => places.filter((place) => saved.includes(place.id) && place.city === city),
    [places, saved, city],
  )

  const savedPlacesAll = useMemo(
    () => places.filter((place) => saved.includes(place.id)),
    [places, saved],
  )

  const photoOwner = email || name || 'visitante'
  const myPhotos = useMemo(
    () => photos.filter((photo) => (photo.owner || 'visitante') === photoOwner),
    [photos, photoOwner],
  )

  const recordsCount = useMemo(() => {
    const myReviews = reviews.filter(
      (review) =>
        String(review.author || '').trim().toLowerCase() ===
        String(name || '').trim().toLowerCase(),
    )
    return (
      savedPlacesAll.length +
      myPhotos.length +
      myReviews.length +
      (mapDownloaded ? 1 : 0)
    )
  }, [savedPlacesAll, myPhotos, reviews, name, mapDownloaded])

  function toggleDark() {
    setDark((current) => !current)
  }

  function toggleSave(place) {
    const isSaved = saved.includes(place.id)
    setSaved(isSaved ? saved.filter((id) => id !== place.id) : [...saved, place.id])
    showToast(isSaved ? 'Removido dos favoritos' : 'Salvo nos favoritos')
    if (email) {
      const request = isSaved
        ? api.removeFavorite(email, place.id)
        : api.addFavorite(email, place.id)
      request.catch(() => {})
    }
  }

  function addPhoto(photo) {
    const nextPhoto = {
      ...photo,
      id: `photo-${Date.now()}`,
      owner: photoOwner,
    }
    setPhotos((current) => [nextPhoto, ...current])
    showToast('Foto adicionada à sua viagem')
  }

  function removePhoto(id) {
    setPhotos((current) => current.filter((photo) => photo.id !== id))
    showToast('Foto removida da sua galeria')
  }

  function handleAuthDone(nextRole, nextName, nextEmail = '', nextCity = '') {
    tabHistory.current = []
    setEmail(nextEmail)
    setRole(nextRole)
    setName(nextName || (nextRole === 'admin' ? 'Administrador' : 'Visitante'))
    if (nextCity) setCity(nextCity)
    setTab('inicio')
    if (nextRole === 'visitor' && nextEmail) {
      api
        .getFavorites(nextEmail)
        .then((ids) => {
          if (Array.isArray(ids)) setSaved(ids)
        })
        .catch(() => {})
    }
    showToast(
      nextRole === 'admin' ? 'Acesso administrativo concedido' : `Bem-vindo(a), ${nextName}!`,
    )
  }

  function handleLogout() {
    tabHistory.current = []
    setRole(null)
    setEmail('')
    setName('')
    setSaved([])
    setSelected(null)
    setTab('inicio')
    setNotificationsOpen(false)
    setProfileView(null)
    setCreateOpen(false)
    setCreateEditing(null)
  }

  function markRead(id) {
    if (!read.includes(id)) setRead((current) => [...current, id])
  }

  function markAllRead() {
    setRead((current) => [...new Set([...current, ...cityNotifications.map((item) => item.id)])])
  }

  function openCreate(type, item = null) {
    setCreateType(type)
    setCreateEditing(
      item
        ? {
            type,
            item: type === 'category' && typeof item === 'string' ? { name: item } : item,
          }
        : null,
    )
    setCreateOpen(true)
  }

  function closeCreate() {
    setCreateOpen(false)
    setCreateEditing(null)
  }

  function handleTabChange(nextTab) {
    if (nextTab === tab) return
    tabHistory.current = [...tabHistory.current, tab]
    setServicesInitial(null)
    setProfileView(null)
    setTab(nextTab)
  }

  function goBack() {
    setServicesInitial(null)
    setProfileView(null)
    const previous = tabHistory.current.pop()
    setTab(previous ?? 'inicio')
  }

  function openOfflineMap(focus = null) {
    setMapFocus(focus)
    setProfileView(null)
    tabHistory.current = [...tabHistory.current, tab]
    setServicesInitial('offline')
    setTab('servicos')
  }

  function resolveImage(values) {
    if (values.image) return values.image
    return createEditing?.item?.image ?? 'hero'
  }

  function handleCreate(type, values) {
    const id = `${type}-${Date.now()}`
    const editing = createEditing

    if (type === 'place') {
      const changes = {
        name: values.name,
        city: values.city || city,
        category: values.category || seedCategories[0],
        image: resolveImage(values),
        description:
          values.description || 'Novo atrativo cadastrado pela equipe do aplicativo.',
      }
      if (editing) {
        setPlaces((current) =>
          current.map((item) =>
            item.id === editing.item.id ? { ...item, ...changes } : item,
          ),
        )
      } else {
        setPlaces((current) => [
          { id, rating: 4.8, distance: '—', tags: ['Novo'], ...changes },
          ...current,
        ])
      }
      api
        .saveContent(
          'place',
          editing
            ? { ...editing.item, ...changes }
            : { id, rating: 4.8, distance: '—', tags: ['Novo'], ...changes },
        )
        .catch(() => {})
    }

    if (type === 'lodging') {
      const changes = {
        name: values.name,
        city: values.city || city,
        kind: values.kind || editing?.item?.kind || 'hotel',
        description:
          values.description || 'Hospedagem cadastrada pela equipe do aplicativo.',
        address: values.address || `${values.city || city} — Ceará`,
        phone: values.phone || '(88) 90000-0000',
        priceFrom: Number(values.priceFrom) || 0,
        image: resolveImage(values),
      }
      if (editing) {
        setLodgings((current) =>
          current.map((item) =>
            item.id === editing.item.id ? { ...item, ...changes } : item,
          ),
        )
      } else {
        setLodgings((current) => [{ id, ...changes }, ...current])
      }
      api
        .saveContent('lodging', editing ? { ...editing.item, ...changes } : { id, ...changes })
        .catch(() => {})
    }

    if (type === 'restaurant') {
      const changes = {
        name: values.name,
        city: values.city || city,
        kind: values.kind || 'Culinária regional',
        description:
          values.description || 'Restaurante cadastrado pela equipe do aplicativo.',
        rating: Number(values.rating) || editing?.item?.rating || 4.8,
        phone: values.phone || '(88) 90000-0000',
        image: resolveImage(values),
      }
      if (editing) {
        setRestaurants((current) =>
          current.map((item) =>
            item.id === editing.item.id ? { ...item, ...changes } : item,
          ),
        )
      } else {
        setRestaurants((current) => [{ id, ...changes }, ...current])
      }
      api
        .saveContent(
          'restaurant',
          editing ? { ...editing.item, ...changes } : { id, ...changes },
        )
        .catch(() => {})
    }

    if (type === 'event') {
      const changes = {
        day: String(values.day || '01').slice(0, 2),
        month: String(values.month || 'JAN').toUpperCase().slice(0, 3),
        year: String(values.year || new Date().getFullYear()).slice(0, 4),
        title: values.title,
        city: values.city || city,
        place: values.place || 'Local a definir',
        category: values.category || 'Evento',
        time: values.time || '19:00',
        color: editing?.item?.color || 'green',
      }
      if (editing) {
        setEvents((current) =>
          current.map((item) =>
            item.id === editing.item.id ? { ...item, ...changes } : item,
          ),
        )
      } else {
        setEvents((current) => [{ id, ...changes }, ...current])
      }
      api
        .saveContent('event', editing ? { ...editing.item, ...changes } : { id, ...changes })
        .catch(() => {})
    }

    if (type === 'guide') {
      const changes = {
        name: values.name,
        initials: initialsFor(values.name),
        city: values.city || city,
        phone: values.phone || editing?.item?.phone || '',
        image: values.photo || editing?.item?.image || '',
        role: values.role || 'Guia local',
        specialties: values.specialties
          ? values.specialties.split(',').map((item) => item.trim()).filter(Boolean)
          : editing?.item?.specialties || ['Turismo local'],
        rating: editing?.item?.rating || 4.8,
        reviews: editing?.item?.reviews || 0,
        cadastur: values.cadastur || editing?.item?.cadastur || 'A confirmar',
        experience: values.experience || editing?.item?.experience || '—',
        color: editing?.item?.color || 'blue',
      }
      if (editing) {
        setGuides((current) =>
          current.map((item) =>
            item.id === editing.item.id ? { ...item, ...changes } : item,
          ),
        )
      } else {
        setGuides((current) => [{ id, ...changes }, ...current])
      }
      api
        .saveContent('guide', editing ? { ...editing.item, ...changes } : { id, ...changes })
        .catch(() => {})
    }

    if (type === 'trail') {
      const changes = {
        name: values.name,
        place: values.place || `${values.city || city} — Ceará`,
        city: values.city || city,
        level: values.level || 'Fácil',
        distance: values.distance || '—',
        time: values.time || '—',
        gain: values.gain || '—',
        image: resolveImage(values),
      }
      if (editing) {
        setTrails((current) =>
          current.map((item) =>
            item.id === editing.item.id ? { ...item, ...changes } : item,
          ),
        )
      } else {
        setTrails((current) => [{ id, ...changes }, ...current])
      }
      api
        .saveContent('trail', editing ? { ...editing.item, ...changes } : { id, ...changes })
        .catch(() => {})
    }

    if (type === 'category') {
      const nextName = values.name.trim()
      if (editing) {
        const previous = editing.item.name
        setCategories((current) =>
          current.map((item) => (item === previous ? nextName : item)),
        )
        setPlaces((current) =>
          current.map((item) =>
            item.category === previous ? { ...item, category: nextName } : item,
          ),
        )
      } else if (!categories.includes(nextName)) {
        setCategories((current) => [...current, nextName])
      }
      api
        .saveContent('category', { name: nextName }, editing ? editing.item.name : null)
        .catch(() => {})
    }

    closeCreate()
    showToast(editing ? 'Conteúdo atualizado com sucesso' : 'Conteúdo publicado com sucesso')
  }

  function handleDelete(type, id) {
    if (type === 'place') setPlaces((current) => current.filter((item) => item.id !== id))
    if (type === 'lodging') {
      setLodgings((current) => current.filter((item) => item.id !== id))
    }
    if (type === 'restaurant') {
      setRestaurants((current) => current.filter((item) => item.id !== id))
    }
    if (type === 'event') setEvents((current) => current.filter((item) => item.id !== id))
    if (type === 'guide') setGuides((current) => current.filter((item) => item.id !== id))
    if (type === 'trail') setTrails((current) => current.filter((item) => item.id !== id))
    if (type === 'category') {
      setCategories((current) => current.filter((item) => item !== id))
    }
    api.deleteContent(type, id).catch(() => {})
  }

  function handleEditContent(type, item) {
    openCreate(type, item)
  }

  function inviteAccess(accessEmail, accessRole) {
    const access = { id: `access-${Date.now()}`, email: accessEmail, role: accessRole }
    setAccesses((current) => [...current, access])
    api.createAccess(access).catch(() => {})
  }

  function removeAccess(id) {
    setAccesses((current) => current.filter((item) => item.id !== id))
    api.deleteAccess(id).catch(() => {})
  }

  function addReview(review) {
    const nextReview = {
      id: `review-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...review,
    }
    setReviews((current) => [nextReview, ...current])
    api.createReview(nextReview).catch(() => {})
    showToast('Avaliação publicada. Obrigado!')
  }

  function sendSupportMessage(text, rating = 5) {
    const message = {
      id: `support-${Date.now()}`,
      author: name || 'Visitante',
      city,
      text,
      rating,
      createdAt: new Date().toISOString(),
    }
    setSupportMessages((current) => [...current, message])
    api.createSupportMessage(message).catch(() => {})
    showToast('Mensagem enviada para a comunidade')
  }

  function renderTab() {
    const shared = {
      onNotifications: () => setNotificationsOpen(true),
      unread,
    }
    if (tab === 'inicio') {
      return (
        <HomeScreen
          {...shared}
          events={events}
          places={places}
          trails={trails}
          saved={saved}
          name={name}
          city={city}
          onChangeCity={setCity}
          onToggleSave={toggleSave}
          onOpenPlace={setSelected}
          onNavigate={handleTabChange}
        />
      )
    }
    if (tab === 'explorar') {
      return (
        <ExploreScreen
          {...shared}
          onBack={goBack}
          places={places}
          categories={categories}
          saved={saved}
          city={city}
          onChangeCity={setCity}
          onToggleSave={toggleSave}
          onOpenPlace={setSelected}
        />
      )
    }
    if (tab === 'trilhas') {
      return (
        <TrailsScreen
          {...shared}
          onBack={goBack}
          trails={trails}
          city={city}
          onChangeCity={setCity}
          onOpenOfflineMap={openOfflineMap}
        />
      )
    }
    if (tab === 'agenda') {
      return (
        <AgendaScreen
          {...shared}
          onBack={goBack}
          events={events}
          city={city}
          onToast={showToast}
        />
      )
    }
    if (tab === 'guias') {
      return <GuidesScreen {...shared} onBack={goBack} guides={guides} city={city} />
    }
    if (tab === 'servicos') {
      return (
        <ServicesScreen
          {...shared}
          onBack={goBack}
          lodgings={lodgings}
          restaurants={restaurants}
          places={places}
          city={city}
          initialSection={servicesInitial}
          onNavigate={handleTabChange}
          onToast={showToast}
          supportMessages={supportMessages}
          onSendSupport={sendSupportMessage}
          currentUserName={name}
          mapDownloaded={mapDownloaded}
          mapFocus={mapFocus}
          onMapDownloaded={() => setMapDownloaded(true)}
        />
      )
    }
    return (
      <ProfileScreen
        {...shared}
        onBack={goBack}
        name={name}
        role={role}
        dark={dark}
        onToggleDark={toggleDark}
        savedPlaces={savedPlaces.filter((place) => place.city === city)}
        onOpenPlace={setSelected}
        onToggleSave={toggleSave}
        onOpenOfflineMap={openOfflineMap}
        onLogout={handleLogout}
        onAdmin={() => {}}
        onToast={showToast}
        onOpenPhotos={() => setProfileView('photos')}
        onOpenRecords={() => setProfileView('records')}
        photosCount={myPhotos.length}
        recordsCount={recordsCount}
        city={city}
        trailsCount={trails.filter((trail) => trail.city === city).length}
        eventsCount={events.filter((event) => event.city === city).length}
      />
    )
  }

  const statusStyle = !role || selected ? 'light' : dark ? 'light' : 'dark'

  return (
    <LanguageProvider language={language} setLanguage={setLanguage}>
      <ThemeContext.Provider value={theme}>
        <StatusBar style={statusStyle} />
        <View style={[styles.root, { backgroundColor: theme.paper }]}>
          {!role ? (
            <AuthScreen onDone={handleAuthDone} dark={dark} onToggleTheme={toggleDark} />
          ) : role === 'admin' ? (
            <View style={{ flex: 1, paddingTop: insets.top }}>
              <AdminScreen
                events={events}
                guides={guides}
                places={places}
                lodgings={lodgings}
                restaurants={restaurants}
                trails={trails}
                categories={categories}
                accesses={accesses}
                onInviteAccess={inviteAccess}
                onRemoveAccess={removeAccess}
                onCreateContent={openCreate}
                onEditContent={handleEditContent}
                onDeleteContent={handleDelete}
                onExit={handleLogout}
                onToast={showToast}
                adminName={name}
                dark={dark}
                onToggleDark={toggleDark}
              />
            </View>
          ) : (
            <View style={{ flex: 1, paddingTop: insets.top }}>
              {renderTab()}
              {selected || profileView ? null : (
                <BottomNav tab={tab} onChange={handleTabChange} />
              )}
            </View>
          )}

          {selected ? (
            <View style={[StyleSheet.absoluteFill, { zIndex: 30 }]}>
              <PlaceDetail
                place={selected}
                saved={saved.includes(selected.id)}
                onSave={() => toggleSave(selected)}
                onClose={() => setSelected(null)}
                reviews={reviews.filter(
                  (review) => String(review.placeId) === String(selected.id),
                )}
                onAddReview={addReview}
                userName={name}
              />
            </View>
          ) : null}

          {profileView === 'photos' ? (
            <View style={[StyleSheet.absoluteFill, { zIndex: 32, paddingTop: insets.top }]}>
              <MyPhotosScreen
                photos={myPhotos}
                places={places}
                city={city}
                onAddPhoto={addPhoto}
                onRemovePhoto={removePhoto}
                onBack={() => setProfileView(null)}
                onNotifications={() => setNotificationsOpen(true)}
                unread={unread}
              />
            </View>
          ) : null}

          {profileView === 'records' ? (
            <View style={[StyleSheet.absoluteFill, { zIndex: 32, paddingTop: insets.top }]}>
              <RecordsScreen
                name={name}
                city={city}
                places={places}
                savedPlaces={savedPlacesAll}
                reviews={reviews}
                photos={myPhotos}
                mapDownloaded={mapDownloaded}
                onOpenPlace={(place) => {
                  setProfileView(null)
                  setSelected(place)
                }}
                onOpenPhotos={() => setProfileView('photos')}
                onOpenMap={openOfflineMap}
                onBack={() => setProfileView(null)}
                onNotifications={() => setNotificationsOpen(true)}
                unread={unread}
              />
            </View>
          ) : null}

          {toast ? <Toast text={toast} /> : null}

          <NotificationsPanel
            visible={notificationsOpen}
            items={cityNotifications}
            city={city}
            read={read}
            onRead={markRead}
            onReadAll={markAllRead}
            onClose={() => setNotificationsOpen(false)}
          />

          <CreateContentModal
            visible={createOpen}
            initialType={createType}
            initialItem={createEditing?.item ?? null}
            editing={Boolean(createEditing)}
            categories={categories}
            defaultCity={city}
            onClose={closeCreate}
            onCreate={handleCreate}
          />
        </View>
      </ThemeContext.Provider>
    </LanguageProvider>
  )
}

export default function App() {
  const isWeb = Platform.OS === 'web'
  const { width, height } = useWindowDimensions()
  const showPhoneFrame = isWeb && width > 600
  const phoneScale = showPhoneFrame ? getWebPhoneScale(width, height) : 1

  useEffect(() => {
    if (!isWeb || typeof document === 'undefined') return
    document.documentElement.style.height = '100%'
    document.body.style.height = '100%'
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#160907'
    const root = document.getElementById('root')
    if (root) {
      root.style.width = '100%'
      root.style.height = '100%'
      root.style.display = 'flex'
    }
  }, [isWeb])

  return (
    <SafeAreaProvider>
      <View style={[styles.host, showPhoneFrame && styles.webHost]}>
        <View
          style={
            showPhoneFrame
              ? [
                  styles.phoneFrame,
                  {
                    width: PHONE_WIDTH,
                    height: PHONE_HEIGHT,
                    transform: [{ scale: phoneScale }],
                  },
                ]
              : styles.appFrame
          }
        >
          <AppShell />
        </View>
      </View>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  webHost: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#160907',
  },
  appFrame: {
    flex: 1,
    width: '100%',
  },
  phoneFrame: {
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 34,
    borderWidth: PHONE_FRAME_BORDER,
    borderColor: '#1d0d0a',
    backgroundColor: '#160907',
    overflow: 'hidden',
    boxShadow: '0 30px 90px rgba(0, 0, 0, 0.55)',
  },
  root: {
    flex: 1,
  },
})
