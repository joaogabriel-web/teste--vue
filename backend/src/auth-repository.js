/**
 * Cria as consultas MySQL usadas pela autenticação.
 *
 * @param {Object} pool Pool de conexões MySQL.
 * @returns {Object} Métodos de persistência de contas e sessões.
 */
export function createAuthRepository(pool) {
  return {
    /**
     * Busca uma conta ativa pelo endereço de e-mail normalizado.
     *
     * @param {string} email E-mail normalizado da conta.
     * @returns {Promise<object | null>} Usuário correspondente, incluindo o hash da senha.
     */
    async findUserByEmail(email) {
      const [rows] = await pool.execute(
        `SELECT id, email, name, password_hash, role, active
         FROM users
         WHERE email = ? AND active = TRUE
         LIMIT 1`,
        [email],
      )
      return rows[0] ?? null
    },

    /**
     * Persiste o hash do token aleatório da sessão, nunca o token original.
     *
     * @param {string} userId Identificador da conta.
     * @param {string} tokenHash Hash SHA-256 do token do cookie.
     * @param {Date} expiresAt Data e hora de expiração da sessão.
     * @returns {Promise<void>}
     */
    async createSession(userId, tokenHash, expiresAt) {
      await pool.execute(
        'DELETE FROM auth_sessions WHERE expires_at <= UTC_TIMESTAMP()',
      )
      await pool.execute(
        `INSERT INTO auth_sessions (token_hash, user_id, expires_at)
         VALUES (?, ?, ?)`,
        [tokenHash, userId, expiresAt],
      )
    },

    /**
     * Busca uma sessão não expirada e sua conta ativa.
     *
     * @param {string} tokenHash Hash SHA-256 do token do cookie.
     * @returns {Promise<object | null>} Conta da sessão ou null se for inválida.
     */
    async findActiveSession(tokenHash) {
      const [rows] = await pool.execute(
        `SELECT users.id, users.email, users.name, users.role
         FROM auth_sessions
         INNER JOIN users ON users.id = auth_sessions.user_id
         WHERE auth_sessions.token_hash = ?
           AND auth_sessions.expires_at > UTC_TIMESTAMP()
           AND users.active = TRUE
         LIMIT 1`,
        [tokenHash],
      )
      return rows[0] ?? null
    },

    /**
     * Revoga uma sessão usando o hash do token.
     *
     * @param {string} tokenHash Hash SHA-256 do token do cookie.
     * @returns {Promise<void>}
     */
    async deleteSession(tokenHash) {
      await pool.execute('DELETE FROM auth_sessions WHERE token_hash = ?', [tokenHash])
    },
  }
}
