/**
 * Valida e retorna a configuração necessária para iniciar a API.
 *
 * @param {NodeJS.ProcessEnv} [env=process.env] Variáveis de ambiente.
 * @returns {{
 *   port: number,
 *   nodeEnv: string,
 *   frontendOrigin: string,
 *   mysql: { host: string, port: number, user: string, password: string, database: string }
 * }}
 * @throws {Error} Se algum valor obrigatório estiver ausente ou for inválido.
 */
export function loadConfig(env = process.env) {
  const required = [
    'MYSQL_HOST',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
  ]
  const missing = required.filter((key) => !env[key])

  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`)
  }

  const port = Number(env.PORT ?? 3000)
  const mysqlPort = Number(env.MYSQL_PORT ?? 3306)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um número entre 1 e 65535.')
  }
  if (!Number.isInteger(mysqlPort) || mysqlPort < 1 || mysqlPort > 65535) {
    throw new Error('MYSQL_PORT deve ser um número entre 1 e 65535.')
  }

  return {
    port,
    nodeEnv: env.NODE_ENV ?? 'development',
    frontendOrigin: env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    mysql: {
      host: env.MYSQL_HOST,
      port: mysqlPort,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
    },
  }
}
