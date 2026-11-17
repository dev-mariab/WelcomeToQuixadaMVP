const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')
const { seed } = require('./seed')

const PORT = Number(process.env.PORT || 4000)
const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://quixada:quixada@localhost:5432/quixada'

const pool = new Pool({
  connectionString: DATABASE_URL,
  ...(process.env.PGSSLMODE === 'require' ? { ssl: { rejectUnauthorized: false } } : {}),
})
const app = express()
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '12mb' }))
app.use('/uploads', express.static(UPLOAD_DIR))

function mapPlace(row) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    category: row.category,
    image: row.image,
    rating: Number(row.rating),
    distance: row.distance,
    description: row.description,
    tags: row.tags || [],
  }
}

function mapLodging(row) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    kind: row.kind,
    description: row.description,
    address: row.address,
    phone: row.phone,
    priceFrom: Number(row.price_from),
    image: row.image,
  }
}

function mapRestaurant(row) {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    kind: row.kind,
    description: row.description,
    rating: Number(row.rating),
    phone: row.phone,
    image: row.image,
  }
}

function mapEvent(row) {
  return {
    id: row.id,
    day: row.day,
    month: row.month,
    year: row.year || '2026',
    title: row.title,
    city: row.city,
    place: row.place,
    category: row.category,
    time: row.time,
    color: row.color,
  }
}

function mapGuide(row) {
  return {
    id: row.id,
    name: row.name,
    initials: row.initials,
    city: row.city || '',
    phone: row.phone || '',
    image: row.image || '',
    role: row.role,
    specialties: row.specialties || [],
    rating: Number(row.rating),
    reviews: Number(row.reviews),
    cadastur: row.cadastur,
    experience: row.experience,
    color: row.color,
  }
}

function mapTrail(row) {
  return {
    id: row.id,
    name: row.name,
    place: row.place,
    city: row.city,
    level: row.level,
    distance: row.distance,
    time: row.time,
    gain: row.gain,
    image: row.image,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
  }
}

function mapReview(row) {
  return {
    id: row.id,
    placeId: row.place_id,
    author: row.user_name,
    rating: Number(row.rating),
    text: row.text,
    createdAt: row.created_at,
  }
}

function mapSupport(row) {
  return {
    id: row.id,
    author: row.author,
    city: row.city || '',
    text: row.text,
    rating: Number(row.rating),
    createdAt: row.created_at,
  }
}

function mapAccess(row) {
  return { id: row.id, email: row.email, role: row.role }
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    gender: row.gender || '',
    age: row.age === null || row.age === undefined ? null : Number(row.age),
    city: row.city || '',
    role: row.role,
    profession: row.profession || '',
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const expected = Buffer.from(hash, 'hex')
  const actual = crypto.scryptSync(password, salt, 64)
  if (expected.length !== actual.length) return false
  return crypto.timingSafeEqual(expected, actual)
}

const resources = {
  places: {
    table: 'places',
    map: mapPlace,
    fields: [
      ['name', 'text'],
      ['city', 'text'],
      ['category', 'text'],
      ['image', 'text'],
      ['rating', 'number'],
      ['distance', 'text'],
      ['description', 'text'],
      ['tags', 'json'],
    ],
  },
  lodgings: {
    table: 'lodgings',
    map: mapLodging,
    fields: [
      ['name', 'text'],
      ['city', 'text'],
      ['kind', 'text'],
      ['description', 'text'],
      ['address', 'text'],
      ['phone', 'text'],
      ['priceFrom', 'number', 'price_from'],
      ['image', 'text'],
    ],
  },
  restaurants: {
    table: 'restaurants',
    map: mapRestaurant,
    fields: [
      ['name', 'text'],
      ['city', 'text'],
      ['kind', 'text'],
      ['description', 'text'],
      ['rating', 'number'],
      ['phone', 'text'],
      ['image', 'text'],
    ],
  },
  events: {
    table: 'events',
    map: mapEvent,
    fields: [
      ['day', 'text'],
      ['month', 'text'],
      ['year', 'text'],
      ['title', 'text'],
      ['city', 'text'],
      ['place', 'text'],
      ['category', 'text'],
      ['time', 'text'],
      ['color', 'text'],
    ],
  },
  guides: {
    table: 'guides',
    map: mapGuide,
    fields: [
      ['name', 'text'],
      ['initials', 'text'],
      ['city', 'text'],
      ['phone', 'text'],
      ['image', 'text'],
      ['role', 'text'],
      ['specialties', 'json'],
      ['rating', 'number'],
      ['reviews', 'number'],
      ['cadastur', 'text'],
      ['experience', 'text'],
      ['color', 'text'],
    ],
  },
  trails: {
    table: 'trails',
    map: mapTrail,
    fields: [
      ['name', 'text'],
      ['place', 'text'],
      ['city', 'text'],
      ['level', 'text'],
      ['distance', 'text'],
      ['time', 'text'],
      ['gain', 'text'],
      ['image', 'text'],
      ['latitude', 'coord', 'latitude'],
      ['longitude', 'coord', 'longitude'],
    ],
  },
}

function valueFor(type, value) {
  if (type === 'json') return JSON.stringify(value ?? [])
  if (type === 'coord') {
    if (value === null || value === undefined || value === '') return null
    const number = Number(value)
    return Number.isFinite(number) ? number : null
  }
  if (type === 'number') return Number(value) || 0
  return value ?? ''
}

async function initDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await seed(client)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'unavailable' })
  }
})

app.post('/api/uploads', async (req, res) => {
  try {
    const { data, mimeType } = req.body || {}
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ error: 'Imagem obrigatória' })
    }

    const match = /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i.exec(data)
    const mime = String(match?.[1] || mimeType || 'image/jpeg').toLowerCase()
    const base64 = (match?.[2] || data).replace(/\s/g, '')
    const extensions = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    }
    const extension = extensions[mime]
    if (!extension) return res.status(400).json({ error: 'Formato de imagem não suportado' })

    const buffer = Buffer.from(base64, 'base64')
    if (!buffer.length) return res.status(400).json({ error: 'Imagem inválida' })
    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ error: 'A imagem deve ter no máximo 8 MB' })
    }

    const filename = `upload-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extension}`
    await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), buffer)
    res.status(201).json({
      url: `/uploads/${filename}`,
    })
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível salvar a imagem' })
  }
})

app.get('/api/bootstrap', async (req, res, next) => {
  try {
    const [places, lodgings, restaurants, events, guides, trails, categories, reviews, support, accesses] =
      await Promise.all([
        pool.query('SELECT * FROM places ORDER BY created_at ASC'),
        pool.query('SELECT * FROM lodgings ORDER BY created_at ASC'),
        pool.query('SELECT * FROM restaurants ORDER BY created_at ASC'),
        pool.query('SELECT * FROM events ORDER BY created_at ASC'),
        pool.query('SELECT * FROM guides ORDER BY created_at ASC'),
        pool.query('SELECT * FROM trails ORDER BY created_at ASC'),
        pool.query('SELECT name FROM categories ORDER BY name ASC'),
        pool.query('SELECT * FROM reviews ORDER BY created_at DESC'),
        pool.query('SELECT * FROM support_messages ORDER BY created_at ASC'),
        pool.query('SELECT * FROM accesses ORDER BY created_at ASC'),
      ])

    res.json({
      places: places.rows.map(mapPlace),
      lodgings: lodgings.rows.map(mapLodging),
      restaurants: restaurants.rows.map(mapRestaurant),
      events: events.rows.map(mapEvent),
      guides: guides.rows.map(mapGuide),
      trails: trails.rows.map(mapTrail),
      categories: categories.rows.map((row) => row.name),
      reviews: reviews.rows.map(mapReview),
      supportMessages: support.rows.map(mapSupport),
      accesses: accesses.rows.map(mapAccess),
    })
  } catch (error) {
    next(error)
  }
})

for (const [name, config] of Object.entries(resources)) {
  app.get(`/api/${name}`, async (req, res, next) => {
    try {
      const result = await pool.query(`SELECT * FROM ${config.table} ORDER BY created_at ASC`)
      res.json(result.rows.map(config.map))
    } catch (error) {
      next(error)
    }
  })

  app.post(`/api/${name}`, async (req, res, next) => {
    try {
      const body = req.body || {}
      const id = body.id || `${name}-${Date.now()}`
      const columns = config.fields.map(([field, , column]) => column || field)
      const placeholders = config.fields.map(([, type], index) => {
        return type === 'json' ? `$${index + 2}::jsonb` : `$${index + 2}`
      })
      const values = config.fields.map(([field, type]) => valueFor(type, body[field]))
      const updates = columns
        .map((column) => `${column} = EXCLUDED.${column}`)
        .join(', ')

      const result = await pool.query(
        `INSERT INTO ${config.table} (id, ${columns.join(', ')})
         VALUES ($1, ${placeholders.join(', ')})
         ON CONFLICT (id) DO UPDATE SET ${updates}
         RETURNING *`,
        [id, ...values],
      )
      res.status(201).json(config.map(result.rows[0]))
    } catch (error) {
      next(error)
    }
  })

  app.put(`/api/${name}/:id`, async (req, res, next) => {
    try {
      const body = { ...req.body, id: req.params.id }
      const columns = config.fields.map(([field, , column]) => column || field)
      const assignments = config.fields.map(([, type], index) => {
        const placeholder = type === 'json' ? `$${index + 2}::jsonb` : `$${index + 2}`
        return `${columns[index]} = ${placeholder}`
      })
      const values = config.fields.map(([field, type]) => valueFor(type, body[field]))
      const result = await pool.query(
        `UPDATE ${config.table} SET ${assignments.join(', ')} WHERE id = $1 RETURNING *`,
        [req.params.id, ...values],
      )
      if (!result.rows[0]) return res.status(404).json({ error: 'Registro não encontrado' })
      res.json(config.map(result.rows[0]))
    } catch (error) {
      next(error)
    }
  })

  app.delete(`/api/${name}/:id`, async (req, res, next) => {
    try {
      await pool.query(`DELETE FROM ${config.table} WHERE id = $1`, [req.params.id])
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  })
}

app.post('/api/categories', async (req, res, next) => {
  try {
    const { name, previousName } = req.body || {}
    if (!name || !name.trim()) return res.status(400).json({ error: 'Nome obrigatório' })
    const nextName = name.trim()
    const previous = previousName || nextName
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      if (previous !== nextName) {
        await client.query('DELETE FROM categories WHERE name = $1', [previous])
      }
      await client.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name',
        [nextName],
      )
      await client.query('UPDATE places SET category = $1 WHERE category = $2', [
        nextName,
        previous,
      ])
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
    res.status(201).json({ name: nextName })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/categories/:name', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM categories WHERE name = $1', [req.params.name])
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/api/reviews', async (req, res, next) => {
  try {
    const { placeId } = req.query
    const result = placeId
      ? await pool.query(
          'SELECT * FROM reviews WHERE place_id = $1 ORDER BY created_at DESC',
          [placeId],
        )
      : await pool.query('SELECT * FROM reviews ORDER BY created_at DESC')
    res.json(result.rows.map(mapReview))
  } catch (error) {
    next(error)
  }
})

app.post('/api/reviews', async (req, res, next) => {
  try {
    const { id, placeId, author, userName, rating, text } = req.body || {}
    if (!placeId) return res.status(400).json({ error: 'placeId obrigatório' })
    const result = await pool.query(
      `INSERT INTO reviews (id, place_id, user_name, rating, text, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         place_id = EXCLUDED.place_id,
         user_name = EXCLUDED.user_name,
         rating = EXCLUDED.rating,
         text = EXCLUDED.text
       RETURNING *`,
      [
        id || `review-${Date.now()}`,
        placeId,
        userName || author || 'Visitante',
        Number(rating) || 5,
        text || '',
        req.body.createdAt || new Date().toISOString(),
      ],
    )
    res.status(201).json(mapReview(result.rows[0]))
  } catch (error) {
    next(error)
  }
})

app.get('/api/support-messages', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM support_messages ORDER BY created_at ASC')
    res.json(result.rows.map(mapSupport))
  } catch (error) {
    next(error)
  }
})

app.post('/api/support-messages', async (req, res, next) => {
  try {
    const { id, author, city, text, rating, createdAt } = req.body || {}
    const result = await pool.query(
      `INSERT INTO support_messages (id, author, city, text, rating, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         author = EXCLUDED.author,
         city = EXCLUDED.city,
         text = EXCLUDED.text,
         rating = EXCLUDED.rating
       RETURNING *`,
      [
        id || `support-${Date.now()}`,
        author || 'Visitante',
        city || '',
        text || '',
        Number(rating) || 5,
        createdAt || new Date().toISOString(),
      ],
    )
    res.status(201).json(mapSupport(result.rows[0]))
  } catch (error) {
    next(error)
  }
})

app.get('/api/accesses', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM accesses ORDER BY created_at ASC')
    res.json(result.rows.map(mapAccess))
  } catch (error) {
    next(error)
  }
})

app.post('/api/accesses', async (req, res, next) => {
  try {
    const { id, email, role } = req.body || {}
    if (!email) return res.status(400).json({ error: 'E-mail obrigatório' })
    const result = await pool.query(
      `INSERT INTO accesses (id, email, role) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role
       RETURNING *`,
      [id || `access-${Date.now()}`, email, role || 'Editor'],
    )
    res.status(201).json(mapAccess(result.rows[0]))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/accesses/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM accesses WHERE id = $1', [req.params.id])
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/users/register', async (req, res, next) => {
  try {
    const body = req.body || {}
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const role = body.role === 'admin' ? 'admin' : 'visitor'

    if (!name) return res.status(400).json({ error: 'Nome obrigatório' })
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'E-mail inválido' })
    if (password.length < 4) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 4 caracteres' })
    }

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email])
    if (existing.rows[0]) {
      return res.status(409).json({ error: 'E-mail já cadastrado' })
    }

    const ageValue = Number(body.age)
    const result = await pool.query(
      `INSERT INTO users
         (id, name, email, password_hash, phone, gender, age, city, role, profession)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        `user-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
        name,
        email,
        hashPassword(password),
        String(body.phone || '').trim(),
        String(body.gender || '').trim(),
        Number.isFinite(ageValue) && ageValue > 0 ? Math.round(ageValue) : null,
        String(body.city || '').trim(),
        role,
        String(body.profession || '').trim(),
      ],
    )
    res.status(201).json(mapUser(result.rows[0]))
  } catch (error) {
    next(error)
  }
})

app.post('/api/users/login', async (req, res, next) => {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha' })
    }
    const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [email])
    const user = result.rows[0]
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' })
    }
    res.json(mapUser(user))
  } catch (error) {
    next(error)
  }
})

app.get('/api/favorites', async (req, res, next) => {
  try {
    const { email } = req.query
    if (!email) return res.status(400).json({ error: 'email obrigatório' })
    const result = await pool.query(
      'SELECT place_id FROM favorites WHERE user_email = $1 ORDER BY created_at ASC',
      [email],
    )
    res.json(result.rows.map((row) => row.place_id))
  } catch (error) {
    next(error)
  }
})

app.post('/api/favorites', async (req, res, next) => {
  try {
    const { email, placeId } = req.body || {}
    if (!email || !placeId) return res.status(400).json({ error: 'email e placeId obrigatórios' })
    await pool.query(
      'INSERT INTO favorites (user_email, place_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [email, placeId],
    )
    res.status(201).json({ email, placeId })
  } catch (error) {
    next(error)
  }
})

app.delete('/api/favorites/:placeId', async (req, res, next) => {
  try {
    const { email } = req.query
    if (!email) return res.status(400).json({ error: 'email obrigatório' })
    await pool.query('DELETE FROM favorites WHERE user_email = $1 AND place_id = $2', [
      email,
      req.params.placeId,
    ])
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.post('/api/translate', async (req, res, next) => {
  try {
    const text = String(req.body?.text ?? '').trim()
    if (!text) return res.status(400).json({ error: 'texto obrigatório' })
    const normalize = (value, fallback) => {
      const code = String(value ?? '').toLowerCase().slice(0, 2)
      return ['pt', 'en', 'es'].includes(code) ? code : fallback
    }
    const source = normalize(req.body?.source, 'pt')
    const target = normalize(req.body?.target, 'en')
    if (source === target) return res.json({ translatedText: text })

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text,
      )}&langpair=${source}|${target}`,
      { headers: { 'User-Agent': 'WelcomeToQuixada/1.0 (educational app)' } },
    )
    const data = await response.json()
    const translated = data?.responseData?.translatedText
    if (
      !response.ok ||
      Number(data?.responseStatus) !== 200 ||
      typeof translated !== 'string' ||
      !translated.trim() ||
      /MYMEMORY WARNING/i.test(translated)
    ) {
      return res.status(502).json({ error: 'Serviço de tradução indisponível' })
    }
    res.json({ translatedText: translated.trim() })
  } catch (error) {
    next(error)
  }
})

app.use((error, req, res, next) => {
  console.error(error)
  res.status(500).json({ error: 'Erro interno do servidor' })
})

async function start() {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      await initDatabase()
      app.listen(PORT, () => {
        console.log(`Welcome to Quixadá API disponível em http://localhost:${PORT}`)
      })
      return
    } catch (error) {
      console.error(`Falha ao conectar no banco (tentativa ${attempt}):`, error.message)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
  process.exit(1)
}

start()
