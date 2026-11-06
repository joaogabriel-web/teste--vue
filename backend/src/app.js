import { json } from 'express'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import { createAuthRouter } from './auth-routes.js'

/**
 * @typedef {Object} AppOptions
 * @property {Object} authRepository Métodos de persistência de contas e sessões.
 * @property {string} frontendOrigin Origem autorizada do frontend para requisições com credenciais.
 * @property {boolean} cookieSecure Define se os cookies exigem HTTPS.
 */

/**
 * Cria a API HTTP com a persistência de autenticação injetada.
 *
 * @param {AppOptions} options Dependências de execução e origem autorizada do navegador.
 * @returns {Object} Aplicação Express configurada.
 */
export function createApp({ authRepository, frontendOrigin, cookieSecure }) {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({ origin: frontendOrigin, credentials: true }))
  app.use(json({ limit: '10kb' }))
  app.use(cookieParser())
  app.use(
    '/api/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { error: 'Muitas tentativas. Tente novamente mais tarde.' },
    }),
  )
  app.use('/api/auth', createAuthRouter({ authRepository, cookieSecure }))

  app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada.' })
  })

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error)
      return
    }

    console.error('Erro não tratado na API:', error)
    res.status(500).json({ error: 'Erro interno do servidor.' })
  })

  return app
}
