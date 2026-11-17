# Welcome to Quixadá — App React Native / Expo

Implementação mobile/web do **Welcome to Quixadá**, recriando a experiência do app
Figma Make em **React Native + Expo Go**, com backend Express/PostgreSQL em Docker
e mapa real MapLibre/OpenStreetMap com cache offline no navegador.

## Como executar no Expo Go

1. Instale o aplicativo **Expo Go** no celular (App Store ou Google Play).
2. Abra o terminal na pasta `expo-app`:
   ```bash
   cd expo-app
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npx expo start
   ```
5. Escaneie o **QR Code**:
   - Android: abra o Expo Go e escaneie.
   - iOS: aponte a câmera para o QR Code.

> O projeto usa Expo SDK 58. Mantenha o Expo Go atualizado (versão 58).

Se o celular não conseguir conectar ao servidor, confirme que ambos estão na
mesma rede Wi-Fi e libere o Expo no firewall do Windows. Como alternativa,
inicie com túnel:

```bash
npx expo start --tunnel
```

## Backend e banco de dados

O app funciona com fallback local, mas sincroniza com a API quando ela está ativa.

```bash
docker compose up -d --build
```

- API: `http://localhost:4000/api`
- Saúde: `http://localhost:4000/api/health`
- PostgreSQL: `localhost:5432` (usuário/senha/banco: `quixada`)
- Para sobrescrever a URL da API no app (PowerShell):
  ```powershell
  $env:EXPO_PUBLIC_API_URL="http://host:4000/api"; npx expo start --web
  ```
- No celular, use `npx expo start --lan` com celular e PC na mesma rede Wi-Fi e libere a porta `4000` no firewall.

## Contas pré-preenchidas

As telas de login já vêm preenchidas ao escolher o tipo de acesso. Basta clicar em **Entrar**.

- Visitante: `visitante@quixada.com` / `quixada123`
- Administrador: `admin@quixada.com` / `quixada123`

O cadastro e o login com outras contas continuam funcionando normalmente.

## Mapa offline

- **Web:** MapLibre com tiles do OpenStreetMap, gravados no IndexedDB do navegador.
- **Celular:** `react-native-maps` com `UrlTile` do OpenStreetMap, cache nativo em
  `tileCachePath` e download prévio da região zooms 9–13.
- Em ambos, o botão **Baixar mapa offline** grava os tiles para uso sem internet.

## Funcionalidades

- Autenticação com perfis de visitante e administrador; o admin acessa apenas o painel.
- Abas Início, Explorar, Trilhas, Serviços e Perfil.
- Agenda, Guias e detalhes de atrativos acessíveis pela navegação interna.
- Busca por nome/cidade/categoria e filtros de categoria.
- Favoritos, preferências, conteúdos, avaliações e mensagens persistidos localmente (AsyncStorage) e sincronizados com a API.
- Tema claro/escuro e idioma PT/EN/ES persistidos.
- Tradutor rápido PT/EN/ES com frases úteis e mapa real do Sertão Central com cache offline no navegador e no celular.
- Avaliações de atrativos e canal de mensagens com a comunidade.
- Central de notificações com marcação de leitura.
- Painel administrativo com métricas, CRUD de conteúdos/trilhas/categorias e convites de acesso.
- Integração com WhatsApp, telefone e mapas (Google Maps).

## Limitações atuais

- Sem API ativa, o app usa dados locais e não sincroniza entre dispositivos.
- No web, o mapa real usa MapLibre; no celular, usa `react-native-maps` com tiles OSM em cache nativo.
- Fotos de novos conteúdos usam uma galeria de imagens embarcadas.

## Observações

- Estrutura do código em `src/`: `screens/`, `components/`, `data.js`, `i18n.js`, `theme.js` e `App.js`.
