const crypto = require('crypto')

const presetUsers = [
  {
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
  {
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
]

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const categories = [
  'Monólitos',
  'Aventura',
  'História',
  'Religioso',
  'Ecoturismo',
  'Cultura',
  'Gastronomia',
  'Negócios',
]

const places = [
  {
    id: '1',
    name: 'Pedra da Galinha Choca',
    city: 'Quixadá',
    category: 'Monólitos',
    image: 'hero',
    rating: 4.9,
    distance: '5,2 km',
    description:
      'O cartão-postal mais querido de Quixadá, cercado por trilhas, açudes e uma paisagem inesquecível.',
    tags: ['Natureza', 'Fotografia', 'Trilha'],
  },
  {
    id: '2',
    name: 'Serra do Urucum',
    city: 'Quixadá',
    category: 'Aventura',
    image: 'urucum',
    rating: 4.8,
    distance: '8,7 km',
    description:
      'Um dos principais pontos de voo livre do Brasil, com vista ampla do sertão e pôr do sol privilegiado.',
    tags: ['Voo livre', 'Mirante', 'Aventura'],
  },
  {
    id: '3',
    name: 'Açude Cedro',
    city: 'Quixadá',
    category: 'História',
    image: 'cedro',
    rating: 4.7,
    distance: '6,4 km',
    description:
      'Obra histórica entre monólitos, ideal para caminhar e conhecer um capítulo importante da região.',
    tags: ['História', 'Caminhada', 'Família'],
  },
  {
    id: '4',
    name: 'Catedral Jesus, Maria e José',
    city: 'Quixadá',
    category: 'Religioso',
    image: 'green',
    rating: 4.6,
    distance: '1,2 km',
    description:
      'Um marco da fé e da arquitetura no centro de Quixadá, ponto de encontro da comunidade local.',
    tags: ['Fé', 'Arquitetura', 'Cultura'],
  },
  {
    id: '5',
    name: 'Memorial da Seca',
    city: 'Senador Pompeu',
    category: 'História',
    image: 'memorialSeca',
    rating: 4.7,
    distance: '42 km',
    description:
      'Patrimônio de memória do Sertão Central, com narrativas sobre resistência, fé e a história do povo sertanejo.',
    tags: ['Memória', 'Cultura', 'História'],
  },
  {
    id: '6',
    name: 'Pedra do Cruzeiro',
    city: 'Quixeramobim',
    category: 'Religioso',
    image: 'cruzeiroQuixeramobim',
    rating: 4.8,
    distance: '39 km',
    description:
      'Mirante natural e espaço de devoção com uma vista privilegiada da paisagem de Quixeramobim.',
    tags: ['Fé', 'Mirante', 'Caminhada'],
  },
  {
    id: '7',
    name: 'Açude Umari',
    city: 'Madalena',
    category: 'Ecoturismo',
    image: 'acudeUmari',
    rating: 4.6,
    distance: '58 km',
    description:
      'Reservatório próximo à comunidade de Salgadinho, a cerca de 5 km da sede de Madalena, cercado pela paisagem do Sertão Central e ideal para contemplação e registro fotográfico.',
    tags: ['Natureza', 'Água', 'Pôr do sol'],
  },
  {
    id: '8',
    name: 'Pedra do Cruzeiro',
    city: 'Quixadá',
    category: 'Religioso',
    image: 'cruzeiroQuixada',
    rating: 4.5,
    distance: '140 m',
    description:
      'Inselbergue de cerca de 70 m no centro de Quixadá, com cruzeiro no topo, mirante e vista panorâmica da cidade e dos monólitos.',
    tags: ['Fé', 'Mirante', 'Geologia'],
  },
]

const lodgings = [
  {
    id: 'hotel-monolitos',
    name: 'Hotel Monólitos',
    city: 'Quixadá',
    kind: 'hotel',
    description: 'Conforto no centro da cidade, a poucos minutos dos principais atrativos.',
    address: 'Av. Plácido Castelo, 1599 — Centro, Quixadá',
    phone: '(88) 3412-8080',
    priceFrom: 210,
    image: 'hotelMonolitos',
  },
  {
    id: 'hotel-rainha-do-sertao',
    name: 'Hotel Rainha do Sertão',
    city: 'Quixadá',
    kind: 'hotel',
    description:
      'Hospedagem ao lado do Santuário Nossa Senhora Imaculada Rainha do Sertão, com restaurante e vista para a serra.',
    address: 'Santuário Nossa Senhora Imaculada Rainha do Sertão — Quixadá',
    phone: '(88) 99968-1400',
    priceFrom: 320,
    image: 'hotelSantuario',
  },
  {
    id: 'ecopousada-recanto-sao-jose',
    name: 'Ecopousada Recanto São José',
    city: 'Quixadá',
    kind: 'ecopousada',
    description:
      'Pousada ecológica na subida para o Santuário, com alimentação, trilhas e contato com a natureza.',
    address: 'Estrada da Juatama, s/n — Quixadá',
    phone: '(88) 98800-8723',
    priceFrom: 280,
    image: 'ecopousadaSaoJose',
  },
]

const retiredRestaurantIds = [
  'sabores-de-quixada',
  'casa-do-sertao',
  'cafe-dos-monolitos',
  'cantinho-da-serra',
]

const restaurants = [
  {
    id: 'ponto-da-panelada-quixada',
    name: 'Ponto da Panelada I em Quixadá',
    city: 'Quixadá',
    kind: 'Lanchonete',
    description:
      'Panelada, buchada, carneiro e almoço regional na Rua Epitácio Pessoa, 1039 - Centro. R$ 20–40 por pessoa.',
    rating: 4.9,
    phone: '(88) 99912-0872',
    image: 'panelada',
  },
  {
    id: 'galinha-de-quintal-centro',
    name: 'Galinha de Quintal Centro',
    city: 'Quixadá',
    kind: 'Restaurante',
    description:
      'Galinha de quintal, carne de sol e pratos regionais na Rua Oscar Barbosa, 533 - Centro. R$ 20–40 por pessoa.',
    rating: 4.6,
    phone: '(88) 98161-0690',
    image: 'galinhaQuintal',
  },
  {
    id: 'restaurante-pe-de-serra-quixada',
    name: 'Restaurante Pé de Serra',
    city: 'Quixadá',
    kind: 'Restaurante',
    description:
      'Picanha, carne de sol e culinária regional na BR-122, com ambiente rural e vista do sertão. R$ 40–120 por pessoa.',
    rating: 4.6,
    phone: '(88) 98155-1414',
    image: 'peDeSerra',
  },
]

const events = [
  {
    id: 'evt-1',
    day: '18',
    month: 'JUL',
    year: '2026',
    title: 'Festival de Quadrilhas do Sertão',
    city: 'Quixadá',
    place: 'Praça José de Barros',
    category: 'Cultura',
    time: '19:00',
    color: 'orange',
  },
  {
    id: 'evt-2',
    day: '23',
    month: 'JUL',
    year: '2026',
    title: 'Voo Livre — Encontro Regional',
    city: 'Quixadá',
    place: 'Serra do Urucum',
    category: 'Esporte',
    time: '06:30',
    color: 'green',
  },
  {
    id: 'evt-3',
    day: '27',
    month: 'JUL',
    year: '2026',
    title: 'Feira de Artesanato e Sabores',
    city: 'Quixeramobim',
    place: 'Centro Cultural',
    category: 'Gastronomia',
    time: '17:00',
    color: 'blue',
  },
]

const guides = [
  {
    id: 'guide-1',
    name: 'Carlos Andrade',
    initials: 'CA',
    city: 'Quixadá',
    phone: '(88) 99911-2030',
    image: '',
    role: 'Guia de ecoturismo',
    specialties: ['Trilhas', 'Monólitos'],
    rating: 4.9,
    reviews: 48,
    cadastur: '23.456789.10-2',
    experience: '8 anos',
    color: 'green',
  },
  {
    id: 'guide-2',
    name: 'Mariana Alves',
    initials: 'MA',
    city: 'Quixeramobim',
    phone: '(88) 99822-4010',
    image: '',
    role: 'Condutora cultural',
    specialties: ['Cultura', 'História'],
    rating: 4.8,
    reviews: 36,
    cadastur: '23.781245.09-6',
    experience: '6 anos',
    color: 'orange',
  },
  {
    id: 'guide-3',
    name: 'Rafael Nogueira',
    initials: 'RN',
    city: 'Quixadá',
    phone: '(88) 99733-1188',
    image: '',
    role: 'Guia de aventura',
    specialties: ['Voo livre', 'Trilhas'],
    rating: 4.9,
    reviews: 61,
    cadastur: '23.918273.11-4',
    experience: '10 anos',
    color: 'blue',
  },
]

const trails = [
  {
    id: 'trail-1',
    name: 'Trilha da Galinha Choca',
    place: 'Açude Cedro, Quixadá',
    city: 'Quixadá',
    level: 'Moderada',
    distance: '6,4 km',
    time: '2h 30min',
    gain: '280 m',
    image: 'trailGalinhaChoca',
    latitude: -4.954,
    longitude: -39.023,
  },
  {
    id: 'trail-2',
    name: 'Travessia do Urucum',
    place: 'Serra do Urucum, Quixadá',
    city: 'Quixadá',
    level: 'Difícil',
    distance: '9,8 km',
    time: '4h',
    gain: '520 m',
    image: 'urucum',
    latitude: -4.949,
    longitude: -38.952,
  },
  {
    id: 'trail-3',
    name: 'Circuito Pedra do Cruzeiro',
    place: 'Quixeramobim',
    city: 'Quixeramobim',
    level: 'Fácil',
    distance: '3,2 km',
    time: '1h 20min',
    gain: '120 m',
    image: 'cruzeiroQuixeramobim',
    latitude: -5.197,
    longitude: -39.293,
  },
]

async function seed(client) {
  for (const name of categories) {
    await client.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING', [
      name,
    ])
  }

  for (const place of places) {
    await client.query(
      `INSERT INTO places (id, name, city, category, image, rating, distance, description, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [
        place.id,
        place.name,
        place.city,
        place.category,
        place.image,
        place.rating,
        place.distance,
        place.description,
        JSON.stringify(place.tags),
      ],
    )
  }

  await client.query(
    `UPDATE places SET image = 'memorialSeca'
     WHERE id = '5' AND image IN ('', 'sunset')`,
  )

  const umari = places.find((place) => place.id === '7')
  if (umari) {
    await client.query(
      `UPDATE places
       SET name = $1, category = $2, image = $3, rating = $4, distance = $5,
           description = $6, tags = $7::jsonb
       WHERE id = '7' AND name = 'Serra de Santa Rita'`,
      [
        umari.name,
        umari.category,
        umari.image,
        umari.rating,
        umari.distance,
        umari.description,
        JSON.stringify(umari.tags),
      ],
    )
    await client.query(
      `UPDATE places SET description = $1
       WHERE id = '7' AND description LIKE 'Reservatório no%Salgadinho%' AND description <> $1`,
      [umari.description],
    )
  }

  for (const lodging of lodgings) {
    await client.query(
      `INSERT INTO lodgings (id, name, city, kind, description, address, phone, price_from, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         image = CASE
           WHEN lodgings.image IS NULL OR lodgings.image IN ('', 'cedro', 'urucum', 'sunset')
           THEN EXCLUDED.image
           ELSE lodgings.image
         END`,
      [
        lodging.id,
        lodging.name,
        lodging.city,
        lodging.kind,
        lodging.description,
        lodging.address,
        lodging.phone,
        lodging.priceFrom,
        lodging.image,
      ],
    )
  }

  await client.query('DELETE FROM restaurants WHERE id = ANY($1::text[])', [
    retiredRestaurantIds,
  ])

  for (const restaurant of restaurants) {
    await client.query(
      `INSERT INTO restaurants (id, name, city, kind, description, rating, phone, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        restaurant.id,
        restaurant.name,
        restaurant.city,
        restaurant.kind,
        restaurant.description,
        restaurant.rating,
        restaurant.phone,
        restaurant.image,
      ],
    )
  }

  for (const event of events) {
    await client.query(
      `INSERT INTO events (id, day, month, year, title, city, place, category, time, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO NOTHING`,
      [
        event.id,
        event.day,
        event.month,
        event.year,
        event.title,
        event.city,
        event.place,
        event.category,
        event.time,
        event.color,
      ],
    )
  }

  for (const guide of guides) {
    await client.query(
      `INSERT INTO guides
         (id, name, initials, city, phone, image, role, specialties, rating, reviews, cadastur, experience, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         city = COALESCE(NULLIF(guides.city, ''), EXCLUDED.city),
         phone = COALESCE(NULLIF(guides.phone, ''), EXCLUDED.phone),
         image = COALESCE(guides.image, EXCLUDED.image)`,
      [
        guide.id,
        guide.name,
        guide.initials,
        guide.city,
        guide.phone,
        guide.image,
        guide.role,
        JSON.stringify(guide.specialties),
        guide.rating,
        guide.reviews,
        guide.cadastur,
        guide.experience,
        guide.color,
      ],
    )
  }

  for (const trail of trails) {
    await client.query(
      `INSERT INTO trails
         (id, name, place, city, level, distance, time, gain, image, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         image = CASE
           WHEN trails.image IS NULL OR trails.image IN ('', 'hero')
           THEN EXCLUDED.image
           ELSE trails.image
         END,
         latitude = COALESCE(trails.latitude, EXCLUDED.latitude),
         longitude = COALESCE(trails.longitude, EXCLUDED.longitude)`,
      [
        trail.id,
        trail.name,
        trail.place,
        trail.city,
        trail.level,
        trail.distance,
        trail.time,
        trail.gain,
        trail.image,
        trail.latitude,
        trail.longitude,
      ],
    )
  }

  for (const user of presetUsers) {
    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [
      user.email.toLowerCase(),
    ])
    const id = existing.rows[0]?.id || user.id
    await client.query(
      `INSERT INTO users
         (id, name, email, password_hash, phone, gender, age, city, role, profession)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         phone = EXCLUDED.phone,
         gender = EXCLUDED.gender,
         age = EXCLUDED.age,
         city = EXCLUDED.city,
         role = EXCLUDED.role,
         profession = EXCLUDED.profession`,
      [
        id,
        user.name,
        user.email,
        hashPassword(user.password),
        user.phone,
        user.gender,
        user.age,
        user.city,
        user.role,
        user.profession,
      ],
    )
  }
}

module.exports = { seed }
