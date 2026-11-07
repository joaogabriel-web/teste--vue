import 'dotenv/config'
import { emitKeypressEvents } from 'node:readline'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { createPool } from 'mysql2/promise'
import { loadConfig } from './config.js'

/**
 * Lê a senha no terminal interativo sem exibir os caracteres digitados.
 *
 * @returns {Promise<string>} Senha informada pela pessoa operadora.
 */
function promptPassword() {
  const input = process.stdin
  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    throw new Error('Execute este comando em um terminal interativo.')
  }

  emitKeypressEvents(input)
  input.setRawMode(true)
  input.resume()
  process.stdout.write('Senha (mínimo 12 caracteres): ')

  return new Promise((resolve, reject) => {
    let password = ''

    function finish(error) {
      input.setRawMode(false)
      input.pause()
      input.removeListener('keypress', onKeypress)
      process.stdout.write('\n')
      if (error) reject(error)
      else resolve(password)
    }

    function onKeypress(character, key) {
      if (key?.ctrl && key.name === 'c') {
        finish(new Error('Operação cancelada.'))
      } else if (key?.name === 'return' || key?.name === 'enter') {
        finish()
      } else if (key?.name === 'backspace') {
        password = Array.from(password).slice(0, -1).join('')
      } else if (character && !key?.ctrl && !key?.meta) {
        password += character
      }
    }

    input.on('keypress', onKeypress)
  })
}

/**
 * Cria uma conta ativa usando um hash bcrypt da senha.
 *
 * @returns {Promise<void>}
 */
async function createUser() {
  const [rawEmail, name, role = 'teacher'] = process.argv.slice(2)
  const email = rawEmail?.trim().toLowerCase()

  if (
    !email ||
    email.length > 254 ||
    !name?.trim() ||
    name.trim().length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !['student', 'teacher', 'admin'].includes(role)
  ) {
    throw new Error('Uso: npm run create-user -- <email> "<nome>" [student|teacher|admin]')
  }

  const password = await promptPassword()
  if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('A senha deve ter entre 12 e 72 caracteres.')
  }

  const config = loadConfig()
  const pool = createPool({ ...config.mysql, timezone: 'Z' })

  try {
    const passwordHash = await bcrypt.hash(password, 12)
    await pool.execute(
      `INSERT INTO users (id, email, name, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [randomUUID(), email, name.trim(), passwordHash, role],
    )
    console.info(`Conta ${role} criada para ${email}.`)
  } finally {
    await pool.end()
  }
}

createUser().catch((error) => {
  console.error('Não foi possível criar a conta:', error.message)
  process.exitCode = 1
})
