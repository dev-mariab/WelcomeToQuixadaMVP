import { useMemo, useState } from 'react'
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { adminNavItems } from '../data'
import { useTranslation } from '../i18n'
import { useTheme } from '../theme'
import { imageSource } from '../utils'
import BottomNav from '../components/BottomNav'
import Icon from '../components/Icon'
import IconButton from '../components/IconButton'

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'place', label: 'Atrativos' },
  { id: 'lodging', label: 'Hospedagens' },
  { id: 'restaurant', label: 'Gastronomia' },
  { id: 'event', label: 'Eventos' },
  { id: 'guide', label: 'Guias' },
  { id: 'trail', label: 'Trilhas' },
  { id: 'category', label: 'Categorias' },
]

const quickActions = [
  { type: 'place', label: 'Atrativo', icon: 'MapPin' },
  { type: 'lodging', label: 'Hospedagem', icon: 'BedDouble' },
  { type: 'restaurant', label: 'Gastronomia', icon: 'Utensils' },
  { type: 'event', label: 'Evento', icon: 'CalendarDays' },
  { type: 'guide', label: 'Guia', icon: 'UserRound' },
  { type: 'trail', label: 'Trilha', icon: 'Mountain' },
  { type: 'category', label: 'Categoria', icon: 'Tag' },
]

function confirmAction({ title, message, confirmLabel = 'Remover', onConfirm }) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) {
      onConfirm()
    }
    return
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ])
}

export default function AdminScreen({
  events,
  guides,
  places,
  lodgings,
  restaurants = [],
  trails = [],
  categories = [],
  accesses,
  onInviteAccess,
  onRemoveAccess,
  onCreateContent,
  onEditContent,
  onDeleteContent,
  onExit,
  onToast,
  adminName,
  dark,
  onToggleDark,
}) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [section, setSection] = useState('painel')
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Administrador')
  const [error, setError] = useState('')

  const content = useMemo(() => {
    return [
      ...places.map((place) => ({
        key: `place-${place.id}`,
        id: place.id,
        type: 'place',
        typeLabel: 'Atrativo',
        title: place.name,
        meta: `${place.category} · ${place.city}`,
        image: place.image,
        raw: place,
      })),
      ...lodgings.map((lodging) => ({
        key: `lodging-${lodging.id}`,
        id: lodging.id,
        type: 'lodging',
        typeLabel: 'Hospedagem',
        title: lodging.name,
        meta: `${lodging.city} · R$ ${lodging.priceFrom}`,
        image: lodging.image,
        raw: lodging,
      })),
      ...restaurants.map((restaurant) => ({
        key: `restaurant-${restaurant.id}`,
        id: restaurant.id,
        type: 'restaurant',
        typeLabel: 'Gastronomia',
        title: restaurant.name,
        meta: `${restaurant.kind} · ${restaurant.city}`,
        image: restaurant.image,
        raw: restaurant,
      })),
      ...events.map((event) => ({
        key: `event-${event.id}`,
        id: event.id,
        type: 'event',
        typeLabel: 'Evento',
        title: event.title,
        meta: `${event.day} ${event.month}${event.year ? ` ${event.year}` : ''} · ${event.city}`,
        icon: 'CalendarDays',
        raw: event,
      })),
      ...guides.map((guide) => ({
        key: `guide-${guide.id}`,
        id: guide.id,
        type: 'guide',
        typeLabel: 'Guia',
        title: guide.name,
        meta: `${guide.role} · ${guide.city || 'Sem cidade'}`,
        icon: 'UserRound',
        raw: guide,
      })),
      ...trails.map((trail) => ({
        key: `trail-${trail.id}`,
        id: trail.id,
        type: 'trail',
        typeLabel: 'Trilha',
        title: trail.name,
        meta: `${trail.level} · ${trail.distance} · ${trail.city}`,
        image: trail.image,
        raw: trail,
      })),
      ...categories.map((category) => ({
        key: `category-${category}`,
        id: category,
        type: 'category',
        typeLabel: 'Categoria',
        title: category,
        meta: 'Categoria de atrativo',
        icon: 'Tag',
        raw: { name: category },
      })),
    ]
  }, [places, lodgings, restaurants, events, guides, trails, categories])

  const filtered = content.filter((item) => {
    const matchesType = filter === 'all' || item.type === filter
    const term = query.trim().toLowerCase()
    const matchesQuery = !term || item.title.toLowerCase().includes(term)
    return matchesType && matchesQuery
  })

  const stats = [
    { label: 'Atrativos', value: places.length, icon: 'MapPin' },
    { label: 'Hospedagens', value: lodgings.length, icon: 'BedDouble' },
    { label: 'Gastronomia', value: restaurants.length, icon: 'Utensils' },
    { label: 'Guias', value: guides.length, icon: 'UserRound' },
    { label: 'Eventos', value: events.length, icon: 'CalendarDays' },
    { label: 'Trilhas', value: trails.length, icon: 'Mountain' },
    { label: 'Categorias', value: categories.length, icon: 'Tag' },
  ]

  function handleInvite() {
    const clean = email.trim().toLowerCase()
    if (!clean.includes('@') || clean.length < 5) {
      setError('Informe um e-mail válido para convidar.')
      return
    }
    if (accesses.some((item) => item.email.toLowerCase() === clean)) {
      setError('Este e-mail já possui acesso ao painel.')
      return
    }
    setError('')
    onInviteAccess(clean, role)
    setEmail('')
    setRole('Administrador')
    onToast('Convite registrado para ' + clean)
  }

  function confirmDelete(item) {
    confirmAction({
      title: 'Remover conteúdo',
      message: `Deseja remover "${item.title}" do aplicativo?`,
      onConfirm: () => {
        onDeleteContent(item.type, item.id)
        onToast(`${item.typeLabel} removido`)
      },
    })
  }

  function confirmRemoveAccess(item) {
    confirmAction({
      title: 'Remover acesso',
      message: `Remover o acesso de ${item.email}?`,
      onConfirm: () => {
        onRemoveAccess(item.id)
        onToast('Acesso removido')
      },
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.paper }}>
      <View style={[styles.topbar, { borderBottomColor: theme.line }]}>
        <View style={styles.topbarCopy}>
          <Text style={[styles.topbarKicker, { color: theme.kicker }]}>
            {t('admin.kicker')}
          </Text>
          <Text style={[styles.topbarTitle, { color: theme.ink }]}>
            {adminName || 'Administrador'}
          </Text>
        </View>
        <IconButton
          icon={dark ? 'Sun' : 'Moon'}
          label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          onPress={onToggleDark}
          background={theme.sand}
        />
        <IconButton
          icon="LogOut"
          label="Sair da conta"
          onPress={onExit}
          background={theme.forest}
          color={theme.lime}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {section === 'painel' ? (
          <View>
            <Text style={[styles.greeting, { color: theme.ink }]}>
              Olá, {adminName || 'equipe'}
            </Text>
            <Text style={[styles.greetingText, { color: theme.muted }]}>
              Guia turística e administrador do aplicativo.
            </Text>

            <View style={styles.stats}>
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  style={[
                    styles.stat,
                    { backgroundColor: theme.surface, borderColor: theme.line },
                  ]}
                >
                  <View style={[styles.statIcon, { backgroundColor: theme.sand }]}>
                    <Icon name={stat.icon} size={17} color={theme.forest} />
                  </View>
                  <Text style={[styles.statValue, { color: theme.ink }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: theme.muted }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: theme.kicker }]}>AÇÕES RÁPIDAS</Text>
            <View style={styles.quickGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.type}
                  activeOpacity={0.85}
                  onPress={() => onCreateContent(action.type)}
                  style={[styles.quick, { borderColor: theme.line }]}
                >
                  <View style={[styles.quickIcon, { backgroundColor: theme.sand }]}>
                    <Icon name={action.icon} size={17} color={theme.forest} />
                  </View>
                  <View style={styles.quickCopy}>
                    <Text style={[styles.quickText, { color: theme.ink }]}>Novo cadastro</Text>
                    <Text style={[styles.quickMeta, { color: theme.muted }]}>
                      {action.label}
                    </Text>
                  </View>
                  <Icon name="Plus" size={15} color={theme.forest} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionHead}>
              <View>
                <Text style={[styles.sectionLabel, { color: theme.kicker, marginTop: 0, marginBottom: 2 }]}>
                  ATIVIDADE RECENTE
                </Text>
                <Text style={[styles.sectionSub, { color: theme.muted }]}>
                  Últimas atualizações
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSection('conteudo')} activeOpacity={0.7}>
                <Text style={[styles.link, { color: theme.forest }]}>Ver tudo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.list}>
              {content.slice(0, 4).map((item) => (
                <View
                  key={item.key}
                  style={[
                    styles.row,
                    { backgroundColor: theme.surface, borderColor: theme.line },
                  ]}
                >
                  {item.image ? (
                    <Image
                      source={imageSource(item.image)}
                      style={styles.rowImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
                      <Icon name={item.icon} size={18} color={theme.forest} />
                    </View>
                  )}
                  <View style={styles.rowCopy}>
                    <Text style={[styles.rowType, { color: theme.kicker }]}>
                      {item.typeLabel}
                    </Text>
                    <Text style={[styles.rowTitle, { color: theme.ink }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.rowMeta, { color: theme.muted }]} numberOfLines={1}>
                      {item.meta}
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      onPress={() => onEditContent(item.type, item.raw)}
                      style={[styles.edit, { backgroundColor: theme.sand }]}
                      accessibilityLabel={`Editar ${item.title}`}
                    >
                      <Icon name="Pencil" size={14} color={theme.forest} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => confirmDelete(item)}
                      style={[styles.delete, { backgroundColor: theme.softOrange }]}
                      accessibilityLabel={`Remover ${item.title}`}
                    >
                      <Icon name="Trash2" size={15} color={theme.onOrange} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {section === 'conteudo' ? (
          <View>
            <Text style={[styles.sectionLabel, { color: theme.kicker, marginTop: 0 }]}>
              CATÁLOGO
            </Text>
            <Text style={[styles.catalogText, { color: theme.muted }]}>
              Todos os conteúdos do aplicativo
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => onCreateContent(filter === 'all' ? 'place' : filter)}
              style={[styles.add, { backgroundColor: theme.forest }]}
            >
              <Icon name="Plus" size={17} color={theme.lime} />
              <Text style={[styles.addText, { color: theme.lime }]}>Novo conteúdo</Text>
            </TouchableOpacity>

            <View
              style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.line }]}
            >
              <Icon name="Search" size={16} color={theme.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar conteúdo..."
                placeholderTextColor={theme.muted}
                style={[styles.searchInput, { color: theme.ink }]}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filters}
            >
              {filters.map((item) => {
                const active = filter === item.id
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => setFilter(item.id)}
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
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            <Text style={[styles.resultCount, { color: theme.muted }]}>
              {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
            </Text>

            <View style={styles.list}>
              {filtered.map((item) => (
                <View
                  key={item.key}
                  style={[
                    styles.row,
                    { backgroundColor: theme.surface, borderColor: theme.line },
                  ]}
                >
                  {item.image ? (
                    <Image
                      source={imageSource(item.image)}
                      style={styles.rowImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
                      <Icon name={item.icon} size={18} color={theme.forest} />
                    </View>
                  )}
                  <View style={styles.rowCopy}>
                    <Text style={[styles.rowType, { color: theme.kicker }]}>
                      {item.typeLabel}
                    </Text>
                    <Text style={[styles.rowTitle, { color: theme.ink }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={[styles.rowMeta, { color: theme.muted }]} numberOfLines={1}>
                      {item.meta}
                    </Text>
                  </View>
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      onPress={() => onEditContent(item.type, item.raw)}
                      style={[styles.edit, { backgroundColor: theme.sand }]}
                      accessibilityLabel={`Editar ${item.title}`}
                    >
                      <Icon name="Pencil" size={14} color={theme.forest} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => confirmDelete(item)}
                      style={[styles.delete, { backgroundColor: theme.softOrange }]}
                      accessibilityLabel={`Remover ${item.title}`}
                    >
                      <Icon name="Trash2" size={15} color={theme.onOrange} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {filtered.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: theme.sand }]}>
                <Icon name="ImagePlus" size={24} color={theme.forest} />
                <Text style={[styles.emptyText, { color: theme.muted }]}>
                  Nenhum item nesta categoria. Use “Novo conteúdo” para adicionar.
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {section === 'acessos' ? (
          <View>
            <Text style={[styles.sectionLabel, { color: theme.kicker, marginTop: 0 }]}>
              ACESSOS ADMINISTRATIVOS
            </Text>
            <Text style={[styles.catalogText, { color: theme.muted }]}>
              Usuários com acesso e edição no aplicativo.
            </Text>

            <View style={[styles.invite, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <Text style={[styles.inviteTitle, { color: theme.ink }]}>Convidar acesso</Text>
              <Text style={[styles.inviteText, { color: theme.muted }]}>
                Adicione um membro da equipe de turismo ao painel administrativo.
              </Text>

              <Text style={[styles.label, { color: theme.muted }]}>E-MAIL</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value)
                  setError('')
                }}
                placeholder="joao.pereira@exemplo.com"
                placeholderTextColor={theme.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, borderColor: theme.line, color: theme.ink },
                ]}
              />

              <Text style={[styles.label, { color: theme.muted }]}>PERFIL DE ACESSO</Text>
              <View style={styles.roles}>
                {['Administrador', 'Editor'].map((item) => {
                  const active = role === item
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.85}
                      onPress={() => setRole(item)}
                      style={[
                        styles.roleChip,
                        {
                          backgroundColor: active ? theme.forest : theme.sand,
                          borderColor: active ? theme.forest : theme.line,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          { color: active ? theme.lime : theme.muted },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              {error ? (
                <Text style={[styles.error, { color: theme.onOrange }]}>{error}</Text>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleInvite}
                style={[styles.inviteButton, { backgroundColor: theme.forest }]}
              >
                <Icon name="Send" size={15} color={theme.lime} />
                <Text style={[styles.inviteButtonText, { color: theme.lime }]}>
                  Enviar convite
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: theme.kicker }]}>
              MEMBROS DA EQUIPE
            </Text>

            <View style={styles.list}>
              <View
                style={[
                  styles.row,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: theme.forest }]}>
                  <Text style={[styles.avatarText, { color: theme.lime }]}>EQ</Text>
                </View>
                <View style={styles.rowCopy}>
                  <Text style={[styles.rowTitle, { color: theme.ink }]}>
                    {adminName || 'Equipe Sertão Central'}
                  </Text>
                  <Text style={[styles.rowMeta, { color: theme.muted }]}>
                    Proprietário · acesso total
                  </Text>
                </View>
                <View style={[styles.tag, { backgroundColor: theme.softGreen }]}>
                  <Text style={[styles.tagText, { color: theme.onGreen }]}>ATIVO</Text>
                </View>
              </View>

              {accesses.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.row,
                    { backgroundColor: theme.surface, borderColor: theme.line },
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: theme.sand }]}>
                    <Text style={[styles.avatarText, { color: theme.forest }]}>
                      {item.email.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={[styles.rowTitle, { color: theme.ink }]} numberOfLines={1}>
                      {item.email}
                    </Text>
                    <Text style={[styles.rowMeta, { color: theme.muted }]}>
                      {item.role} · convite pendente
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => confirmRemoveAccess(item)}
                    style={[styles.delete, { backgroundColor: theme.softOrange }]}
                    accessibilityLabel={`Remover acesso de ${item.email}`}
                  >
                    <Icon name="Trash2" size={15} color={theme.onOrange} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={[styles.security, { backgroundColor: theme.sand }]}>
              <Icon name="ShieldCheck" size={18} color={theme.forest} />
              <Text style={[styles.securityText, { color: theme.muted }]}>
                Todos os acessos administrativos são registrados e podem ser revisados pela
                equipe responsável.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
      <BottomNav tab={section} onChange={setSection} items={adminNavItems} />
    </View>
  )
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  topbarCopy: {
    flex: 1,
  },
  topbarKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  topbarTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 3,
  },
  tabs: {
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 9,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 108,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  greetingText: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
  },
  stat: {
    flexGrow: 1,
    flexBasis: '47%',
    maxWidth: '49%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 1,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 9,
  },
  quickGrid: {
    gap: 8,
  },
  quick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 13,
    padding: 10,
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickCopy: {
    flex: 1,
  },
  quickText: {
    fontSize: 10,
    fontWeight: '800',
  },
  quickMeta: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 1,
  },
  catalogText: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: -4,
    marginBottom: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 9,
  },
  sectionSub: {
    fontSize: 9,
    fontWeight: '600',
  },
  link: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 9,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 13,
    padding: 9,
  },
  rowImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowType: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rowTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  rowMeta: {
    fontSize: 8,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  edit: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delete: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 13,
    paddingVertical: 13,
  },
  addText: {
    fontSize: 11,
    fontWeight: '800',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    paddingVertical: 9,
  },
  filters: {
    gap: 7,
    paddingVertical: 13,
    paddingRight: 6,
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
  resultCount: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 9,
  },
  empty: {
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 20,
    marginTop: 10,
  },
  emptyText: {
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 14,
  },
  invite: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  inviteText: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  label: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    fontSize: 12,
    marginBottom: 6,
  },
  roles: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 6,
  },
  roleChip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
  },
  roleChipText: {
    fontSize: 9,
    fontWeight: '800',
  },
  error: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 11,
    paddingVertical: 12,
    marginTop: 12,
  },
  inviteButtonText: {
    fontSize: 10,
    fontWeight: '800',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  security: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 13,
    padding: 12,
    marginTop: 14,
  },
  securityText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 13,
  },
})
