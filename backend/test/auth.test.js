import assert from 'node:assert/strict'
import { after, beforeEach, test } from 'node:test'
import bcrypt from 'bcryptjs'
import { createApp } from '../src/app.js'

// Senha: ReserveMe123!

const password = 'correct-horse-battery'
const account = {
  id: '39b168c9-dfd6-4bfb-a0ec-950f857c887f',
  email: 'professora@escola.edu.br',
  name: 'Ana Costa',
  role: 'teacher',
  active: true,
  password_hash: await bcrypt.hash(password, 4),
}
const student = {
  id: '9988675f-0278-46a6-8a25-97234ac11d1f',
  email: 'aluno@escola.edu.br',
  name: 'Aluno',
  role: 'student',
  active: true,
  password_hash: await bcrypt.hash(password, 4),
}
const admin = {
  id: '034fbd2b-6e8d-4c6e-80ec-69a0bd2d0805',
  email: 'admin@escola.edu.br',
  name: 'Administrador',
  role: 'admin',
  active: true,
  password_hash: await bcrypt.hash(password, 4),
}
const accounts = [account, student, admin]
const sessions = new Map()

beforeEach(() => {
  sessions.clear()
})

const authRepository = {
  async findUserByEmail(email) {
    return accounts.find((user) => user.email === email && user.active) ?? null
  },
  async createSession(userId, tokenHash, expiresAt) {
    sessions.set(tokenHash, { userId, expiresAt })
  },
  async findActiveSession(tokenHash) {
    const session = sessions.get(tokenHash)
    const user = accounts.find((entry) => entry.id === session?.userId)
    if (!session || session.expiresAt <= new Date() || !user?.active) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  },
  async deleteSession(tokenHash) {
    sessions.delete(tokenHash)
  },
}

const app = createApp({
  authRepository,
  frontendOrigin: 'http://localhost:5173',
  cookieSecure: false,
})
const server = app.listen(0, '127.0.0.1')
await new Promise((resolve) => server.once('listening', resolve))
const baseUrl = `http://127.0.0.1:${server.address().port}`

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
})

/**
 * Envia uma requisição JSON para a API.
 *
 * @param {string} path Caminho da API.
 * @param {RequestInit} [options] Opções do fetch.
 * @returns {Promise<Response>} Resposta HTTP.
 */
function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
  })
}

test('rejects invalid login input without creating a session', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'invalido', password: '' }),
  })

  assert.equal(response.status, 400)
  assert.equal(sessions.size, 0)
})

test('rejects incorrect credentials with a generic error', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: account.email, password: 'wrong-password' }),
  })

  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { error: 'E-mail ou senha inválidos.' })
  assert.equal(response.headers.get('set-cookie'), null)
  assert.equal(sessions.size, 0)
})

test('does not disclose whether an email is registered', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nao-cadastrado@escola.edu.br', password }),
  })

  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { error: 'E-mail ou senha inválidos.' })
  assert.equal(sessions.size, 0)
})

test('creates an HttpOnly cookie and returns only public account data', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ` ${account.email.toUpperCase()} `, password }),
  })

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    user: {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
    },
  })
  const cookie = response.headers.get('set-cookie')
  assert.match(cookie, /HttpOnly/i)
  assert.match(cookie, /SameSite=Lax/i)
  assert.match(cookie, /Max-Age=28800/i)
  assert.doesNotMatch(cookie, /Secure/i)
  assert.equal(sessions.size, 1)
  return cookie.split(';', 1)[0]
})

test('requires a valid session to return the current account', async () => {
  const response = await request('/api/auth/me')
  assert.equal(response.status, 401)
})

test('returns the account for a valid session without exposing its password hash', async () => {
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: account.email, password }),
  })
  const cookie = login.headers.get('set-cookie').split(';', 1)[0]

  const response = await request('/api/auth/me', { headers: { cookie } })
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.deepEqual(result, {
    user: {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
    },
  })
  assert.equal(JSON.stringify(result).includes(account.password_hash), false)
})

test('revokes the server session when logging out', async () => {
  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: account.email, password }),
  })
  const cookie = login.headers.get('set-cookie').split(';', 1)[0]

  const logout = await request('/api/auth/logout', {
    method: 'POST',
    headers: { cookie },
  })
  assert.equal(logout.status, 204)
  assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970 00:00:00 GMT/i)

  const currentUser = await request('/api/auth/me', { headers: { cookie } })
  assert.equal(currentUser.status, 401)
  assert.equal(sessions.size, 0)
})

test('denies students access without creating a session', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: student.email, password }),
  })

  assert.equal(response.status, 403)
  assert.deepEqual(await response.json(), {
    error: 'Apenas professores e administradores podem acessar as reservas.',
  })
  assert.equal(response.headers.get('set-cookie'), null)
  assert.equal(sessions.size, 0)
})

test('allows an admin to log in', async () => {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: admin.email, password }),
  })

  assert.equal(response.status, 200)
  assert.equal((await response.json()).user.role, 'admin')
})
