import 'dotenv/config'
import { createPool } from 'mysql2/promise'
import { createApp } from './app.js'
import { loadConfig } from './config.js'
import { createAuthRepository } from './auth-repository.js'

/**
 * Conecta ao MySQL e inicia a API HTTP.
 *
 * @returns {Promise<void>}
 */
async function startServer() {
  const config = loadConfig()
  const pool = createPool({
    ...config.mysql,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: 'Z',
  })

  try {
    await pool.query('SELECT 1')
  } catch (error) {
    await pool.end()
    throw error
  }

  const app = createApp({
    authRepository: createAuthRepository(pool),
    frontendOrigin: config.frontendOrigin,
    cookieSecure: config.nodeEnv === 'production',
  })
  const server = app.listen(config.port, () => {
    console.info(`API reserve.me disponível na porta ${config.port}.`)
  })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(async () => {
        await pool.end()
      })
    })
  }
}

startServer().catch((error) => {
  console.error('Não foi possível iniciar a API:', error)
  process.exitCode = 1
})
