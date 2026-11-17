import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { images, sertaoCentralCities } from '../data'
import { useTheme } from '../theme'
import { api } from '../api'
import Icon from '../components/Icon'
import PrimaryButton from '../components/PrimaryButton'

const copy = {
  'visitor-login': {
    kicker: 'ÁREA DO VISITANTE',
    title: 'Bem-vindo',
    subtitle: 'Entre para salvar favoritos, acompanhar eventos e planejar sua viagem.',
    submit: 'Entrar',
  },
  'visitor-register': {
    kicker: 'NOVO VISITANTE',
    title: 'Crie seu perfil',
    subtitle: 'Leva menos de um minuto para começar a explorar o Sertão Central.',
    submit: 'Criar minha conta',
  },
  'admin-login': {
    kicker: 'ÁREA RESTRITA',
    title: 'Acesso administrativo',
    subtitle: 'Gerencie atrativos, eventos, guias e acessos do aplicativo.',
    submit: 'Entrar',
  },
  'admin-register': {
    kicker: 'NOVO ADMINISTRADOR',
    title: 'Cadastre sua equipe',
    subtitle: 'Crie uma conta administrativa com seus dados profissionais.',
    submit: 'Criar conta administrativa',
  },
}

const AUTH_VISUAL_HEIGHT = 340
const AUTH_IMAGE_ASPECT = 678 / 351
const AUTH_FOCAL_X = 0.37
const AUTH_FOCAL_Y = 0.66
const REMEMBER_KEY = 'welcome-quixada:remembered-login'
const PREFILL_VERSION_KEY = 'welcome-quixada:prefill-version'
const PREFILL_VERSION = '2'
const USERS_KEY = 'welcome-quixada:users'
const genderOptions = ['Feminino', 'Masculino', 'Outro', 'Prefiro não informar']
const PREFILLED_ACCOUNTS = {
  visitor: {
    id: 'visitor-preset',
    name: 'Visitante',
    email: 'visitante@quixada.com',
    password: 'quixada123',
    phone: '(88) 99999-0001',
    gender: '',
    age: null,
    city: 'Quixadá',
    role: 'visitor',
    profession: '',
  },
  admin: {
    id: 'admin-preset',
    name: 'Administrador',
    email: 'admin@quixada.com',
    password: 'quixada123',
    phone: '(88) 99999-0002',
    gender: '',
    age: null,
    city: 'Quixadá',
    role: 'admin',
    profession: 'Secretaria de Turismo',
  },
}

async function readLocalUsers() {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY)
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch (error) {
    return []
  }
}

async function saveLocalUser(user) {
  const users = await readLocalUsers()
  const next = users.filter(
    (entry) => String(entry.email || '').toLowerCase() !== String(user.email || '').toLowerCase(),
  )
  next.push(user)
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(next)).catch(() => {})
}

function readError(error) {
  const raw = String(error?.message || '')
  try {
    const parsed = JSON.parse(raw)
    if (parsed && parsed.error) return parsed.error
  } catch (parseError) {
    // keep raw message
  }
  return raw || 'Não foi possível concluir. Tente novamente.'
}

function isNetworkError(error) {
  const message = String(error?.message || '')
  return (
    error?.name === 'AbortError' ||
    /failed to fetch|network|aborted|timeout|load failed/i.test(message)
  )
}

export default function AuthScreen({ onDone, dark, onToggleTheme }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [visualWidth, setVisualWidth] = useState(0)
  const authImageWidth = visualWidth
    ? Math.max(visualWidth, AUTH_VISUAL_HEIGHT * AUTH_IMAGE_ASPECT)
    : 0
  const authImageHeight = authImageWidth / AUTH_IMAGE_ASPECT
  const authImageFrame = {
    width: authImageWidth,
    height: authImageHeight,
    left: (visualWidth - authImageWidth) * AUTH_FOCAL_X,
    top: (AUTH_VISUAL_HEIGHT - authImageHeight) * AUTH_FOCAL_Y,
  }
  const [mode, setMode] = useState('choice')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('')
  const [profession, setProfession] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [remember, setRemember] = useState(false)
  const [remembered, setRemembered] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const isRegister = mode.endsWith('register')
  const isAdmin = mode.startsWith('admin')
  const formCopy = copy[mode]

  useEffect(() => {
    let active = true
    Promise.all([
      AsyncStorage.getItem(REMEMBER_KEY),
      AsyncStorage.getItem(PREFILL_VERSION_KEY),
    ])
      .then(([raw, version]) => {
        if (!active) return
        if (version !== PREFILL_VERSION) {
          setRemembered({})
          AsyncStorage.multiRemove([REMEMBER_KEY]).catch(() => {})
          AsyncStorage.setItem(PREFILL_VERSION_KEY, PREFILL_VERSION).catch(() => {})
          return
        }
        if (!raw) return
        const data = JSON.parse(raw)
        if (data && typeof data === 'object') setRemembered(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  function go(next) {
    setMode(next)
    setMessage('')
    const saved = remembered[next]
    const prefilled =
      next === 'visitor-login'
        ? PREFILLED_ACCOUNTS.visitor
        : next === 'admin-login'
          ? PREFILLED_ACCOUNTS.admin
          : null
    setEmail(prefilled?.email ?? saved?.email ?? '')
    setPassword(prefilled?.password ?? saved?.password ?? '')
    setConfirmPassword('')
    setName('')
    setPhone('')
    setGender('')
    setAge('')
    setCity('')
    setProfession('')
    setRemember(Boolean(saved))
  }

  function persistRemembered() {
    if (isRegister) return
    const next = { ...remembered }
    if (remember) {
      next[mode] = { email: email.trim(), password }
    } else {
      delete next[mode]
    }
    setRemembered(next)
    AsyncStorage.setItem(REMEMBER_KEY, JSON.stringify(next)).catch(() => {})
  }

  async function handleSubmit() {
    if (isRegister && name.trim().length < 2) {
      setMessage('Informe seu nome completo para criar a conta.')
      return
    }
    if (!email.includes('@') || email.trim().length < 5) {
      setMessage('Informe um e-mail válido.')
      return
    }
    if (password.trim().length < 4) {
      setMessage('A senha precisa ter pelo menos 4 caracteres.')
      return
    }
    if (isRegister && confirmPassword !== password) {
      setMessage('As senhas não conferem.')
      return
    }
    if (isRegister && phone.replace(/\D/g, '').length < 8) {
      setMessage('Informe um telefone válido com DDD.')
      return
    }
    if (isRegister && !city) {
      setMessage('Selecione a cidade da sua conta.')
      return
    }
    const numericAge = Number(age)
    if (isRegister && age.trim() && (!Number.isFinite(numericAge) || numericAge < 1 || numericAge > 120)) {
      setMessage('Informe uma idade válida.')
      return
    }

    setMessage('')
    setSubmitting(true)
    try {
      if (isRegister) {
        const payload = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim(),
          gender,
          age: age.trim() ? Math.round(numericAge) : null,
          city,
          role: isAdmin ? 'admin' : 'visitor',
          profession: isAdmin ? profession.trim() : '',
        }
        let account = null
        try {
          account = await api.registerUser(payload)
        } catch (error) {
          if (!isNetworkError(error)) {
            setMessage(readError(error))
            return
          }
        }
        if (!account) {
          const localUsers = await readLocalUsers()
          const duplicate =
            localUsers.some(
              (entry) => String(entry.email).toLowerCase() === payload.email,
            ) ||
            Object.values(PREFILLED_ACCOUNTS).some((entry) => entry.email === payload.email)
          if (duplicate) {
            setMessage('Este e-mail já está cadastrado neste dispositivo.')
            return
          }
          account = { ...payload, id: `local-user-${Date.now()}` }
        }
        await saveLocalUser({ ...account, password })
        onDone(isAdmin ? 'admin' : 'visitor', account.name, account.email, account.city || city)
        return
      }

      persistRemembered()
      let account = null
      try {
        account = await api.loginUser(email.trim().toLowerCase(), password)
      } catch (error) {
        if (!isNetworkError(error)) {
          setMessage(readError(error))
          return
        }
      }
      if (!account) {
        const localUsers = await readLocalUsers()
        const normalized = email.trim().toLowerCase()
        account = localUsers.find(
          (entry) =>
            String(entry.email).toLowerCase() === normalized && entry.password === password,
        )
        if (!account) {
          account = Object.values(PREFILLED_ACCOUNTS).find(
            (entry) => entry.email === normalized && entry.password === password,
          )
        }
      }
      if (!account) {
        setMessage('E-mail ou senha inválidos. Crie uma conta se ainda não tiver.')
        return
      }
      if (isAdmin && account.role !== 'admin') {
        setMessage('Esta conta não possui acesso administrativo.')
        return
      }
      await saveLocalUser({ ...account, password })
      onDone(
        account.role === 'admin' ? 'admin' : 'visitor',
        account.name || email.split('@')[0],
        account.email || email.trim(),
        account.city || '',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.visual, { paddingTop: insets.top + 12 }]}
          onLayout={(event) => setVisualWidth(event.nativeEvent.layout.width)}
        >
          {visualWidth ? (
            <Image
              source={images.authVisual}
              style={[styles.authImage, authImageFrame]}
              resizeMode="cover"
            />
          ) : null}
          <LinearGradient
            colors={['rgba(24, 10, 7, 0.25)', 'rgba(47, 16, 11, 0.55)', 'rgba(43, 14, 9, 0.97)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.topbar}>
            <View style={styles.brand}>
              <Image source={images.logo} style={styles.logo} resizeMode="cover" />
              <View>
                <Text style={styles.brandTitle}>Welcome to Quixadá</Text>
              </View>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              onPress={onToggleTheme}
              activeOpacity={0.85}
              style={styles.themeButton}
            >
              <Icon name={dark ? 'Sun' : 'Moon'} size={19} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.visualCopy}>
            <Text style={styles.visualKicker}>CONHEÇA. VIVA. PRESERVE.</Text>
            <Text style={styles.visualTitle}>
              O Sertão Central{'\n'}espera por você.
            </Text>
          </View>
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.paper }]}>
          {mode === 'choice' ? (
            <View>
              <Text style={[styles.kicker, { color: theme.kicker }]}>COMO DESEJA ENTRAR?</Text>
              <Text style={[styles.title, { color: theme.ink }]}>Bem-vindo ao Sertão Central</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                Escolha seu tipo de acesso para continuar.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => go('visitor-login')}
                style={[
                  styles.roleCard,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <View style={[styles.roleIcon, { backgroundColor: theme.softGreen }]}>
                  <Icon name="UserRound" size={21} color={theme.onGreen} />
                </View>
                <View style={styles.roleCopy}>
                  <Text style={[styles.roleTitle, { color: theme.ink }]}>
                    Entrar como visitante
                  </Text>
                  <Text style={[styles.roleText, { color: theme.muted }]}>
                    Explore atrativos, trilhas, eventos e serviços.
                  </Text>
                </View>
                <Icon name="ChevronRight" size={20} color={theme.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => go('admin-login')}
                style={[
                  styles.roleCard,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <View style={[styles.roleIcon, { backgroundColor: theme.softOrange }]}>
                  <Icon name="LayoutDashboard" size={21} color={theme.onOrange} />
                </View>
                <View style={styles.roleCopy}>
                  <Text style={[styles.roleTitle, { color: theme.ink }]}>
                    Entrar como administrador
                  </Text>
                  <Text style={[styles.roleText, { color: theme.muted }]}>
                    Gerencie conteúdo, atrativos e acessos.
                  </Text>
                </View>
                <Icon name="ChevronRight" size={20} color={theme.muted} />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity
                onPress={() => go(isRegister ? (isAdmin ? 'admin-login' : 'visitor-login') : 'choice')}
                activeOpacity={0.7}
                style={styles.backLink}
              >
                <Icon name="ChevronLeft" size={16} color={theme.forest} />
                <Text style={[styles.backText, { color: theme.forest }]}>
                  {isRegister ? 'Voltar para o login' : 'Voltar'}
                </Text>
              </TouchableOpacity>

              <Text style={[styles.kicker, { color: theme.kicker }]}>{formCopy.kicker}</Text>
              <Text style={[styles.title, { color: theme.ink }]}>{formCopy.title}</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>{formCopy.subtitle}</Text>

              <View style={styles.form}>
                {isRegister ? (
                  <View>
                    <Text style={[styles.label, { color: theme.muted }]}>NOME COMPLETO</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Como podemos te chamar?"
                      placeholderTextColor={theme.muted}
                      autoCapitalize="words"
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.inputBg,
                          borderColor: theme.line,
                          color: theme.ink,
                        },
                      ]}
                    />
                  </View>
                ) : null}

                <View>
                  <Text style={[styles.label, { color: theme.muted }]}>
                    {isAdmin ? 'E-MAIL DO ADMINISTRADOR' : 'E-MAIL'}
                  </Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={isAdmin ? 'equipe@exemplo.com' : 'maria@exemplo.com'}
                    placeholderTextColor={theme.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.line,
                        color: theme.ink,
                      },
                    ]}
                  />
                </View>

                {isRegister ? (
                  <>
                    <View>
                      <Text style={[styles.label, { color: theme.muted }]}>TELEFONE</Text>
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="(88) 99999-9999"
                        placeholderTextColor={theme.muted}
                        keyboardType="phone-pad"
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.inputBg,
                            borderColor: theme.line,
                            color: theme.ink,
                          },
                        ]}
                      />
                    </View>

                    <View>
                      <Text style={[styles.label, { color: theme.muted }]}>GÊNERO</Text>
                      <View style={styles.chipWrap}>
                        {genderOptions.map((option) => {
                          const active = gender === option
                          return (
                            <TouchableOpacity
                              key={option}
                              activeOpacity={0.8}
                              onPress={() => setGender(option)}
                              style={[
                                styles.chip,
                                {
                                  borderColor: active ? theme.forest : theme.line,
                                  backgroundColor: active ? theme.softGreen : theme.inputBg,
                                },
                              ]}
                            >
                              <Text style={[styles.chipText, { color: theme.ink }]}>{option}</Text>
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    </View>

                    <View>
                      <Text style={[styles.label, { color: theme.muted }]}>IDADE</Text>
                      <TextInput
                        value={age}
                        onChangeText={setAge}
                        placeholder="Ex.: 28"
                        placeholderTextColor={theme.muted}
                        keyboardType="number-pad"
                        maxLength={3}
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.inputBg,
                            borderColor: theme.line,
                            color: theme.ink,
                          },
                        ]}
                      />
                    </View>

                    <View>
                      <Text style={[styles.label, { color: theme.muted }]}>CIDADE</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cityRow}
                      >
                        {sertaoCentralCities.map((option) => {
                          const active = city === option
                          return (
                            <TouchableOpacity
                              key={option}
                              activeOpacity={0.8}
                              onPress={() => setCity(option)}
                              style={[
                                styles.chip,
                                {
                                  borderColor: active ? theme.forest : theme.line,
                                  backgroundColor: active ? theme.softGreen : theme.inputBg,
                                },
                              ]}
                            >
                              <Text style={[styles.chipText, { color: theme.ink }]}>{option}</Text>
                            </TouchableOpacity>
                          )
                        })}
                      </ScrollView>
                    </View>

                    {isAdmin ? (
                      <View>
                        <Text style={[styles.label, { color: theme.muted }]}>
                          CARGO / SETOR
                        </Text>
                        <TextInput
                          value={profession}
                          onChangeText={setProfession}
                          placeholder="Ex.: Secretaria de Turismo"
                          placeholderTextColor={theme.muted}
                          style={[
                            styles.input,
                            {
                              backgroundColor: theme.inputBg,
                              borderColor: theme.line,
                              color: theme.ink,
                            },
                          ]}
                        />
                      </View>
                    ) : null}
                  </>
                ) : null}

                <View>
                  <Text style={[styles.label, { color: theme.muted }]}>SENHA</Text>
                  <View
                    style={[
                      styles.passwordRow,
                      { backgroundColor: theme.inputBg, borderColor: theme.line },
                    ]}
                  >
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Sua senha de acesso"
                      placeholderTextColor={theme.muted}
                      secureTextEntry={!showPassword}
                      style={[styles.passwordInput, { color: theme.ink }]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((current) => !current)}
                      activeOpacity={0.7}
                      style={styles.showButton}
                    >
                      <Text style={[styles.showText, { color: theme.forest }]}>
                        {showPassword ? 'Ocultar' : 'Mostrar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {!isRegister ? (
                  <TouchableOpacity
                    onPress={() => setRemember((current) => !current)}
                    activeOpacity={0.7}
                    style={styles.rememberRow}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: remember }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: remember ? theme.forest : theme.line,
                          backgroundColor: remember ? theme.forest : 'transparent',
                        },
                      ]}
                    >
                      {remember ? <Icon name="Check" size={13} color={theme.lime} /> : null}
                    </View>
                    <Text style={[styles.rememberText, { color: theme.muted }]}>
                      Lembrar senha
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {isRegister ? (
                  <View>
                    <Text style={[styles.label, { color: theme.muted }]}>
                      CONFIRMAR SENHA
                    </Text>
                    <View
                      style={[
                        styles.passwordRow,
                        { backgroundColor: theme.inputBg, borderColor: theme.line },
                      ]}
                    >
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Digite a senha novamente"
                        placeholderTextColor={theme.muted}
                        secureTextEntry={!showPassword}
                        style={[styles.passwordInput, { color: theme.ink }]}
                      />
                    </View>
                  </View>
                ) : null}

                {message ? (
                  <Text style={[styles.error, { color: theme.onOrange }]}>{message}</Text>
                ) : null}

                <PrimaryButton
                  label={submitting ? 'Aguarde...' : formCopy.submit}
                  onPress={handleSubmit}
                  icon={isAdmin ? 'ShieldCheck' : undefined}
                  style={styles.submit}
                  disabled={submitting}
                />

                {isRegister ? (
                  <Text style={[styles.terms, { color: theme.muted }]}>
                    Ao criar sua conta você concorda com os Termos de Uso e a Política de
                    Privacidade.
                  </Text>
                ) : null}

                {isAdmin ? (
                  <>
                    <View style={[styles.notice, { borderColor: theme.line }]}>
                      <Icon name="ShieldCheck" size={16} color={theme.forest} />
                      <Text style={[styles.noticeText, { color: theme.muted }]}>
                        Acesso exclusivo para a equipe de turismo. Ações administrativas ficam
                        registradas no painel.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => go(isRegister ? 'admin-login' : 'admin-register')}
                      activeOpacity={0.7}
                      style={styles.switchLink}
                    >
                      <Text style={[styles.switchText, { color: theme.muted }]}>
                        {isRegister ? 'Já tem uma conta administrativa?' : 'Ainda não tem conta de administrador?'}{' '}
                        <Text style={{ color: theme.forest, fontWeight: '800' }}>
                          {isRegister ? 'Entrar' : 'Cadastrar administrador'}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => go(isRegister ? 'visitor-login' : 'visitor-register')}
                    activeOpacity={0.7}
                    style={styles.switchLink}
                  >
                    <Text style={[styles.switchText, { color: theme.muted }]}>
                      {isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'}{' '}
                      <Text style={{ color: theme.forest, fontWeight: '800' }}>
                        {isRegister ? 'Entrar' : 'Criar conta'}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: '#2b0e09',
  },
  visual: {
    height: AUTH_VISUAL_HEIGHT,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  authImage: {
    position: 'absolute',
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
  },
  brandTitle: {
    flexShrink: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  visualCopy: {
    paddingBottom: 42,
  },
  visualKicker: {
    color: '#f0d98c',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 9,
  },
  visualTitle: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 33,
    letterSpacing: -0.8,
  },
  sheet: {
    flex: 1,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 32,
  },
  kicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 20,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  roleIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCopy: {
    flex: 1,
    minWidth: 0,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 3,
  },
  roleText: {
    fontSize: 10,
    lineHeight: 15,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 16,
  },
  backText: {
    fontSize: 11,
    fontWeight: '700',
  },
  form: {
    gap: 13,
  },
  label: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 13,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cityRow: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  passwordRow: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 13,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
  },
  showButton: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  showText: {
    fontSize: 10,
    fontWeight: '800',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rememberText: {
    fontSize: 11,
    fontWeight: '600',
  },
  error: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
  submit: {
    marginTop: 3,
  },
  switchLink: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchText: {
    fontSize: 10,
    textAlign: 'center',
  },
  terms: {
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
})
