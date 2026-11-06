import { randomBytes, createHash } from 'node:crypto'
import { Router } from 'express'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE = 'reserve_me_session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('reserve-me-invalid-login-check', 12)

/**
 * @typedef {Object} AuthRouterOptions
 * @property {Object} authRepository Métodos de persistência de contas e sessões.
 * @property {boolean} cookieSecure Define se os cookies exigem HTTPS.
 */

/**
 * Cria endpoints de autenticação com usuários e sessões persistidos no MySQL.
 *
 * @param {AuthRouterOptions} options Dependências de autenticação e opções do cookie.
 * @returns {Object} Roteador montado em `/api/auth`.
 */
export function createAuthRouter({ authRepository, cookieSecure }) {
  const router = Router()
  const cookieOptions = {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: 'lax',
    path: '/',
  }

  /**
   * Valida as credenciais, cria uma sessão revogável no banco e define o cookie.
   *
   * @route POST /api/auth/login
   * @param {Object} req
   * @param {Object} res
   * @returns {Promise<void>}
   */
  router.post('/login', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : ''
    const password = typeof req.body?.password === 'string' ? req.body.password : ''

    if (
      !EMAIL_PATTERN.test(email) ||
      email.length > 254 ||
      password.length === 0 ||
      password.length > 128
    ) {
      res.status(400).json({ error: 'Informe um e-mail e uma senha válidos.' })
      return
    }

    const user = await authRepository.findUserByEmail(email)
    const passwordMatches = await bcrypt.compare(
      password,
      user?.password_hash ?? DUMMY_PASSWORD_HASH,
    )

    if (!user || !passwordMatches) {
      res.status(401).json({ error: 'E-mail ou senha inválidos.' })
      return
    }

    const sessionToken = randomBytes(32).toString('base64url')
    const tokenHash = createHash('sha256').update(sessionToken).digest('hex')
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

    await authRepository.createSession(user.id, tokenHash, expiresAt)
    res.cookie(SESSION_COOKIE, sessionToken, {
      ...cookieOptions,
      maxAge: SESSION_DURATION_MS,
    })
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  })

  /**
   * Retorna a conta atual quando o cookie da sessão é válido.
   *
   * @route GET /api/auth/me
   * @param {Object} req
   * @param {Object} res
   * @returns {Promise<void>}
   */
  router.get('/me', async (req, res) => {
    const sessionToken = req.cookies?.[SESSION_COOKIE]
    if (!sessionToken) {
      res.status(401).json({ error: 'Autenticação necessária.' })
      return
    }

    const tokenHash = createHash('sha256').update(sessionToken).digest('hex')
    const user = await authRepository.findActiveSession(tokenHash)

    if (!user) {
      res.clearCookie(SESSION_COOKIE, cookieOptions)
      res.status(401).json({ error: 'Sessão inválida ou expirada.' })
      return
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  })

  /**
   * Revoga a sessão atual no banco e remove o cookie do navegador.
   *
   * @route POST /api/auth/logout
   * @param {Object} req
   * @param {Object} res
   * @returns {Promise<void>}
   */
  router.post('/logout', async (req, res) => {
    const sessionToken = req.cookies?.[SESSION_COOKIE]
    if (sessionToken) {
      const tokenHash = createHash('sha256').update(sessionToken).digest('hex')
      await authRepository.deleteSession(tokenHash)
    }

    res.clearCookie(SESSION_COOKIE, cookieOptions)
    res.status(204).end()
  })

  return router
}
