import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { createPool } from 'mysql2/promise'
import { loadConfig } from './config.js'

const demoAccounts = [
  { email: 'aluno@escola.edu.br', name: 'Aluno de Demonstração', role: 'student' },
  { email: 'professora.ana@escola.edu.br', name: 'Ana Costa', role: 'teacher' },
  { email: 'professor.joao@escola.edu.br', name: 'João Mendes', role: 'teacher' },
  { email: 'admin@escola.edu.br', name: 'Administrador', role: 'admin' },
]

/**
 * Creates or refreshes local demo accounts with a shared bcrypt-hashed password.
 *
 * @returns {Promise<void>}
 */
async function seedUsers() {
  const password = process.env.DEMO_PASSWORD
  const passwordBytes = password ? Buffer.byteLength(password, 'utf8') : 0
  if (passwordBytes < 12 || passwordBytes > 72) {
    throw new Error('Defina DEMO_PASSWORD com uma senha entre 12 e 72 bytes.')
  }

  const config = loadConfig()
  const pool = createPool({ ...config.mysql, timezone: 'Z' })
  try {
    const passwordHash = await bcrypt.hash(password, 12)
    for (const account of demoAccounts) {
      await pool.execute(
        `INSERT INTO users (id, email, name, password_hash, role, active)
         VALUES (?, ?, ?, ?, ?, TRUE) AS new_user
         ON DUPLICATE KEY UPDATE
           name = new_user.name,
           password_hash = new_user.password_hash,
           role = new_user.role,
           active = TRUE`,
        [randomUUID(), account.email, account.name, passwordHash, account.role],
      )
      console.info(`Conta de demonstração preparada: ${account.email} (${account.role}).`)
    }
  } finally {
    await pool.end()
  }
}

seedUsers().catch((error) => {
  console.error('Não foi possível criar as contas de demonstração:', error.message)
  process.exitCode = 1
})
