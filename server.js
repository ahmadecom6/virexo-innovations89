import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import multer from 'multer'
import { fallbackReply, generateAiReply } from './api/ai.js'

const app = express()
const port = Number(process.env.PORT || 3001)
const authTokens = new Map()
const analyticsFile = path.resolve('uploads', 'analytics.json')

const emptyAnalytics = () => ({ totalVisits: 0, pageViews: 0, sessions: {}, pages: {}, minuteViews: {} })
const loadAnalytics = () => {
  try {
    return { ...emptyAnalytics(), ...JSON.parse(fs.readFileSync(analyticsFile, 'utf8')) }
  } catch {
    return emptyAnalytics()
  }
}
let analytics = loadAnalytics()
const analyticsClients = new Set()
let persistTimer

const analyticsSnapshot = () => {
  const now = Date.now()
  const activeVisitors = Object.values(analytics.sessions).filter((lastSeen) => now - lastSeen < 90_000).length
  const currentMinute = Math.floor(now / 60_000)
  const activity = Array.from({ length: 12 }, (_value, index) => {
    const minute = currentMinute - 11 + index
    return { label: index === 11 ? 'Now' : `${11 - index}m`, value: analytics.minuteViews[minute] || 0 }
  })
  return {
    activeVisitors,
    totalVisits: analytics.totalVisits,
    pageViews: analytics.pageViews,
    pages: Object.entries(analytics.pages).sort(([, countA], [, countB]) => countB - countA).slice(0, 5),
    activity,
    updatedAt: new Date().toISOString(),
  }
}
const broadcastAnalytics = () => {
  const message = `data: ${JSON.stringify(analyticsSnapshot())}\n\n`
  analyticsClients.forEach((client) => client.write(message))
}
const saveAnalytics = () => {
  clearTimeout(persistTimer)
  persistTimer = setTimeout(() => fs.writeFileSync(analyticsFile, JSON.stringify(analytics)), 250)
}

if (!process.env.GEMINI_API_KEY) {
  console.warn('No Gemini API key is set. Add GEMINI_API_KEY to your .env file before using the AI assistant.')
}

app.use(express.json({ limit: '20kb' }))

const applicationsDirectory = path.resolve('uploads', 'applications')
fs.mkdirSync(applicationsDirectory, { recursive: true })

app.get('/api/health', (_request, response) => response.json({
  status: 'ok',
  aiConfigured: Boolean(process.env.OPENAI_API_KEY),
  portalConfigured: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.PORTAL_SESSION_SECRET),
  analyticsConfigured: Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
}))

app.post('/api/analytics/track', (request, response) => {
  const { sessionId, page } = request.body ?? {}
  if (typeof sessionId !== 'string' || !/^[a-zA-Z0-9-]{12,80}$/.test(sessionId) || typeof page !== 'string' || !page.startsWith('/') || page.length > 120) {
    return response.status(400).json({ error: 'A valid anonymous session and page are required.' })
  }
  const isNewVisitor = !analytics.sessions[sessionId]
  analytics.sessions[sessionId] = Date.now()
  analytics.pageViews += 1
  analytics.pages[page] = (analytics.pages[page] || 0) + 1
  const currentMinute = Math.floor(Date.now() / 60_000)
  analytics.minuteViews[currentMinute] = (analytics.minuteViews[currentMinute] || 0) + 1
  Object.keys(analytics.minuteViews).filter((minute) => Number(minute) < currentMinute - 60).forEach((minute) => delete analytics.minuteViews[minute])
  if (isNewVisitor) analytics.totalVisits += 1
  saveAnalytics()
  broadcastAnalytics()
  return response.status(202).json(analyticsSnapshot())
})

app.get('/api/analytics', (_request, response) => response.json(analyticsSnapshot()))

app.get('/api/analytics/stream', (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  })
  response.write(`data: ${JSON.stringify(analyticsSnapshot())}\n\n`)
  analyticsClients.add(response)
  request.on('close', () => analyticsClients.delete(response))
})

const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const configuredAdminPassword = process.env.ADMIN_PASSWORD
const getBearerToken = (request) => request.headers.authorization?.replace(/^Bearer\s+/i, '')

app.post('/api/auth/login', (request, response) => {
  const { email, password } = request.body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string') {
    return response.status(400).json({ error: 'Enter your email and password.' })
  }
  if (!configuredAdminEmail || !configuredAdminPassword) {
    return response.status(503).json({ error: 'Client portal access is not configured yet.' })
  }
  if (email.trim().toLowerCase() !== configuredAdminEmail || password !== configuredAdminPassword) {
    return response.status(401).json({ error: 'The email or password is incorrect.' })
  }
  const token = crypto.randomUUID()
  authTokens.set(token, { email: configuredAdminEmail, expiresAt: Date.now() + 8 * 60 * 60 * 1000 })
  return response.json({ token, email: configuredAdminEmail })
})

app.get('/api/auth/session', (request, response) => {
  const token = getBearerToken(request)
  const session = authTokens.get(token)
  if (!session || session.expiresAt < Date.now()) {
    authTokens.delete(token)
    return response.status(401).json({ error: 'Your session has expired.' })
  }
  return response.json({ email: session.email })
})

app.post('/api/auth/logout', (request, response) => {
  authTokens.delete(getBearerToken(request))
  return response.status(204).end()
})

const candidatesFile = path.resolve('uploads', 'candidates.json')
const seedCandidates = [
  { id: 'cand-001', name: 'Amara Johnson', email: 'amara.johnson@example.com', role: 'Product Designer', experience: '4–6 years', score: 96, status: 'Interview', location: 'London, UK', notes: 'Strong systems thinking and exceptional portfolio depth.' },
  { id: 'cand-002', name: 'Rayan Malik', email: 'rayan.malik@example.com', role: 'Full-Stack Engineer', experience: '7+ years', score: 93, status: 'Offer', location: 'Lahore, PK', notes: 'Leads complex product builds with calm execution.' },
  { id: 'cand-003', name: 'Sofia Chen', email: 'sofia.chen@example.com', role: 'Growth Strategist', experience: '4–6 years', score: 89, status: 'Screening', location: 'Singapore', notes: 'Data-led operator with strong lifecycle instincts.' },
  { id: 'cand-004', name: 'Daniel Okafor', email: 'daniel.okafor@example.com', role: 'Frontend Developer', experience: '1–3 years', score: 86, status: 'Interview', location: 'Lagos, NG', notes: 'Thoughtful frontend craft and strong communication.' },
]
const loadCandidates = () => { try { return JSON.parse(fs.readFileSync(candidatesFile, 'utf8')) } catch { fs.writeFileSync(candidatesFile, JSON.stringify(seedCandidates, null, 2)); return seedCandidates } }
const saveCandidates = (records) => fs.writeFileSync(candidatesFile, JSON.stringify(records, null, 2))
const requirePortalSession = (request, response) => { const token = getBearerToken(request); const session = authTokens.get(token); if (!session || session.expiresAt < Date.now()) { authTokens.delete(token); response.status(401).json({ error: 'Your session has expired.' }); return null } return session }
const validateCandidate = (candidate) => { const required = ['name', 'email', 'role', 'experience', 'status', 'location']; if (!required.every((key) => typeof candidate[key] === 'string' && candidate[key].trim())) return 'Complete all candidate fields.'; if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(candidate.email)) return 'Enter a valid candidate email.'; if (!Number.isInteger(candidate.score) || candidate.score < 0 || candidate.score > 100) return 'Match score must be between 0 and 100.'; return '' }
app.get('/api/candidates', (request, response) => { if (!requirePortalSession(request, response)) return; return response.json(loadCandidates()) })
app.post('/api/candidates', (request, response) => { if (!requirePortalSession(request, response)) return; const candidate = { ...request.body, score: Number(request.body?.score), notes: typeof request.body?.notes === 'string' ? request.body.notes.trim() : '' }; const error = validateCandidate(candidate); if (error) return response.status(400).json({ error }); const record = { ...candidate, id: `cand-${crypto.randomUUID()}` }; const records = loadCandidates(); records.unshift(record); saveCandidates(records); return response.status(201).json(record) })
app.get('/api/candidates/:id', (request, response) => { if (!requirePortalSession(request, response)) return; const candidate = loadCandidates().find((record) => record.id === request.params.id); if (!candidate) return response.status(404).json({ error: 'Candidate not found.' }); return response.json(candidate) })

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: applicationsDirectory,
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase()
      callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`)
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    const acceptedTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])
    callback(null, acceptedTypes.has(file.mimetype))
  },
})

app.post('/api/applications', resumeUpload.single('resume'), (request, response) => {
  const { name, email, specialization, experience } = request.body
  if (![name, email, specialization, experience].every((value) => typeof value === 'string' && value.trim())) {
    return response.status(400).json({ error: 'Please complete every application field.' })
  }
  if (!request.file) {
    return response.status(400).json({ error: 'A PDF, DOC, or DOCX resume is required.' })
  }

  return response.status(201).json({ message: 'Application received.' })
})

app.post('/api/chat', async (request, response) => {
  const messages = request.body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return response.status(400).json({ error: 'A chat message is required.' })
  }
  try {
    const message = await generateAiReply(messages)
    return response.json({ message })
  } catch (error) {
    console.error('Gemini request failed:', error.message)
    if (error.status === 400 || error.status === 401 || error.status === 403) return response.status(503).json({ error: 'Gemini rejected its configuration. Update GEMINI_API_KEY, then restart the server.' })
    if (error.status === 404) return response.status(503).json({ error: 'The configured Gemini model is unavailable. Check GEMINI_MODEL, then restart the server.' })
    if (error.status === 429) return response.json({ message: fallbackReply(messages), fallback: true })
    return response.json({ message: fallbackReply(messages), fallback: true })
  }
})

app.listen(port, () => {
  console.log(`AI server is running at http://localhost:${port}`)
})
