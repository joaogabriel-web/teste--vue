<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import ReservationPage from './components/ReservationPage.vue'
import {
  getLegalDocumentSections,
  getLegalDocumentTitle,
} from './data/legalDocuments'

const currentPath = ref(window.location.pathname)
const isRecoveryPage = computed(() => currentPath.value === '/recuperar-senha')
const isReservationsPage = computed(() => currentPath.value === '/reservas')
const isLegalPage = computed(() =>
  ['/termos-de-uso', '/privacidade'].includes(currentPath.value),
)
const isPrivacyPage = computed(() => currentPath.value === '/privacidade')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)
const isSubmitting = ref(false)
const loginMessage = ref('')
const logoutError = ref('')
const recoveryError = ref('')
const recoveryMessage = ref('')

const documentSections = computed(() => getLegalDocumentSections(isPrivacyPage.value))
const documentTitle = computed(() => getLegalDocumentTitle(isPrivacyPage.value))

watch(
  [isRecoveryPage, isLegalPage, isReservationsPage, documentTitle],
  ([recovery, legal, reservations, title]) => {
    document.title = legal
      ? `${title} | reserve.me`
      : reservations
        ? 'Reservar uma sala | reserve.me'
        : recovery
          ? 'Recuperar senha | reserve.me'
          : 'Entrar | reserve.me'
  },
  { immediate: true },
)

function syncPath() {
  currentPath.value = window.location.pathname
}

function navigate(path: string) {
  window.history.pushState({}, '', path)
  currentPath.value = path
}

onMounted(() => {
  window.addEventListener('popstate', syncPath)
  if (isReservationsPage.value) void verifyReservationSession()
})
onUnmounted(() => window.removeEventListener('popstate', syncPath))

watch(isReservationsPage, (isOpen) => {
  if (isOpen) void verifyReservationSession()
})

const errors = reactive({
  email: false,
  password: false,
})

async function verifyReservationSession() {
  try {
    const response = await fetch('/api/auth/me')
    if (response.status === 401) {
      navigate('/')
      return
    }
    if (!response.ok) throw new Error(`Falha ao validar a sessão: ${response.status}`)
    logoutError.value = ''
  } catch (error) {
    console.error('Não foi possível validar a sessão do usuário.', error)
    navigate('/')
    loginMessage.value = 'Não foi possível conectar ao serviço de autenticação.'
  }
}

async function handleSubmit() {
  submitted.value = true
  errors.email = !email.value.trim()
  errors.password = !password.value.trim()
  loginMessage.value = ''
  if (errors.email || errors.password) return

  isSubmitting.value = true
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    const result = await response.json()
    if (!response.ok) {
      loginMessage.value = result.error ?? 'Não foi possível entrar. Tente novamente.'
      return
    }
    navigate('/reservas')
  } catch (error) {
    console.error('Não foi possível concluir o login.', error)
    loginMessage.value = 'Não foi possível conectar ao serviço de autenticação.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleLogout() {
  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    if (!response.ok) throw new Error(`Falha ao encerrar a sessão: ${response.status}`)
    navigate('/')
  } catch (error) {
    console.error('Não foi possível encerrar a sessão.', error)
    logoutError.value = 'Não foi possível sair. Verifique a conexão e tente novamente.'
  }
}

function handleRecoverySubmit() {
  recoveryMessage.value = ''
  if (!email.value.trim()) {
    recoveryError.value = 'Obrigatório'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    recoveryError.value = 'Informe um e-mail válido'
    return
  }

  recoveryError.value = ''
  recoveryMessage.value = 'A recuperação de senha ainda não está conectada a um serviço.'
}
</script>

<template>
  <main class="login-page">
    <ReservationPage
      v-if="isReservationsPage"
      :logout-error="logoutError"
      @logout="handleLogout"
    />

    <div v-else-if="isLegalPage" class="legal-page">
      <header class="legal-header">
        <a class="brand legal-brand" href="/" aria-label="reserve.me - página inicial">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="4" y="7" width="32" height="29" rx="9" fill="currentColor" />
              <path d="M13 4v7M27 4v7M4 15h32" stroke="white" stroke-width="2.5" stroke-linecap="round" />
              <path d="m15.5 24 3 3 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span class="brand-name">reserve<span>.me</span></span>
        </a>
        <nav class="legal-nav" aria-label="Documentos legais">
          <a href="/termos-de-uso" :aria-current="!isPrivacyPage ? 'page' : undefined">
            Termos de uso
          </a>
          <a href="/privacidade" :aria-current="isPrivacyPage ? 'page' : undefined">
            Privacidade
          </a>
        </nav>
        <a class="legal-login-link" href="/">Acessar conta <span aria-hidden="true">↗</span></a>
      </header>

      <section class="legal-hero" aria-labelledby="document-title">
        <div class="legal-eyebrow"><span aria-hidden="true"></span> INFORMAÇÕES LEGAIS</div>
        <h1 id="document-title">{{ documentTitle }}</h1>
        <p>
          {{ isPrivacyPage
            ? 'Transparência sobre os dados que tratamos e o cuidado com a sua privacidade.'
            : 'Regras claras para uma experiência simples e segura no reserve.me.' }}
        </p>
        <div class="updated-date">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.5" />
            <path d="M10 5.8v4.5l2.8 1.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Última atualização: 30 de outubro de 2026
        </div>
      </section>

      <div class="legal-layout">
        <aside class="legal-sidebar" aria-label="Nesta página">
          <p class="sidebar-title">NESTA PÁGINA</p>
          <nav>
            <a v-for="section in documentSections" :key="section.id" :href="`#${section.id}`">
              <span>{{ section.number }}</span>{{ section.title }}
            </a>
          </nav>
          <div class="sidebar-note">
            <span class="note-icon" aria-hidden="true">i</span>
            <p>Este documento pode ser atualizado. Consulte esta página para ver a versão vigente.</p>
          </div>
        </aside>

        <article class="legal-content">
          <section
            v-for="section in documentSections"
            :id="section.id"
            :key="section.id"
            class="legal-section"
            :aria-labelledby="`${section.id}-title`"
          >
            <div class="section-number">{{ section.number }}</div>
            <div>
              <h2 :id="`${section.id}-title`">{{ section.title }}</h2>
              <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
            </div>
          </section>

          <div class="legal-endnote">
            <span aria-hidden="true">✓</span>
            <p>
              {{ isPrivacyPage
                ? 'Sua confiança importa. Tratamos seus dados com responsabilidade e transparência.'
                : 'Ao utilizar o reserve.me, você concorda com as condições descritas acima.' }}
            </p>
          </div>
        </article>
      </div>

      <footer class="legal-page-footer">
        <a class="brand footer-brand" href="/" aria-label="reserve.me - página inicial">
          <span class="brand-name">reserve<span>.me</span></span>
        </a>
        <p>Feito para deixar cada reserva mais simples.</p>
        <a href="/">Voltar ao início <span aria-hidden="true">↗</span></a>
      </footer>
    </div>

    <section v-else-if="!isRecoveryPage" class="login-card" aria-labelledby="login-title">
      <a class="brand" href="/" aria-label="reserve.me">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <rect x="4" y="7" width="32" height="29" rx="9" fill="currentColor" />
            <path d="M13 4v7M27 4v7M4 15h32" stroke="white" stroke-width="2.5" stroke-linecap="round" />
            <path d="m15.5 24 3 3 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="brand-name">reserve<span>.me</span></span>
      </a>

      <h1 id="login-title">Entrar</h1>

      <form class="login-form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">E-mail</label>
          <p v-if="submitted && errors.email" id="email-error" class="field-error">
            Obrigatório
          </p>
          <div class="input-wrap" :class="{ 'input-wrap--error': submitted && errors.email }">
            <input
              id="email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              :aria-invalid="submitted && errors.email"
              :aria-describedby="submitted && errors.email ? 'email-error' : undefined"
              @input="errors.email = !email.trim()"
            />
          </div>
        </div>

        <div class="field">
          <label for="password">Senha</label>
          <p v-if="submitted && errors.password" id="password-error" class="field-error">
            Obrigatório
          </p>
          <div class="input-wrap" :class="{ 'input-wrap--error': submitted && errors.password }">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              :aria-invalid="submitted && errors.password"
              :aria-describedby="submitted && errors.password ? 'password-error' : undefined"
              @input="errors.password = !password.trim()"
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M2.8 12s3.2-6 9.2-6 9.2 6 9.2 6-3.2 6-9.2 6-9.2-6-9.2-6Z" stroke="currentColor" stroke-width="1.7" />
                <circle cx="12" cy="12" r="2.5" stroke="currentColor" stroke-width="1.7" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m3 3 18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6 0 9.2 6 9.2 6a14 14 0 0 1-3.1 3.8M6.2 6.9C4 8.3 2.8 12 2.8 12s3.2 6 9.2 6c1 0 1.9-.2 2.7-.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <p
          v-if="submitted && (errors.email || errors.password)"
          class="form-required-alert"
          role="alert"
          aria-live="polite"
        >
          Obrigatório
        </p>
        <p v-if="loginMessage" class="form-required-alert" role="alert">
          {{ loginMessage }}
        </p>
        <button class="submit-button" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Entrando...' : 'Entrar' }}
        </button>
        <a class="forgot-link" href="/recuperar-senha">Esqueceu sua senha?</a>
      </form>

      <footer class="legal">
        <a href="/termos-de-uso">Termos de uso</a>
        <span aria-hidden="true">·</span>
        <a href="/privacidade">Privacidade</a>
      </footer>
    </section>

    <section v-else class="login-card" aria-labelledby="recovery-title">
      <a class="brand" href="/" aria-label="reserve.me">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <rect x="4" y="7" width="32" height="29" rx="9" fill="currentColor" />
            <path d="M13 4v7M27 4v7M4 15h32" stroke="white" stroke-width="2.5" stroke-linecap="round" />
            <path d="m15.5 24 3 3 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="brand-name">reserve<span>.me</span></span>
      </a>

      <h1 id="recovery-title">Recuperar senha</h1>
      <p class="recovery-copy">Informe seu e-mail para recuperar o acesso à sua conta.</p>

      <form class="login-form" novalidate @submit.prevent="handleRecoverySubmit">
        <div class="field">
          <label for="recovery-email">E-mail</label>
          <p v-if="recoveryError" id="recovery-email-error" class="field-error">
            {{ recoveryError }}
          </p>
          <div class="input-wrap" :class="{ 'input-wrap--error': recoveryError }">
            <input
              id="recovery-email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              :aria-invalid="Boolean(recoveryError)"
              :aria-describedby="recoveryError ? 'recovery-email-error' : undefined"
              @input="recoveryError = ''; recoveryMessage = ''"
            />
          </div>
        </div>

        <p v-if="recoveryError" class="form-required-alert" role="alert" aria-live="polite">
          {{ recoveryError }}
        </p>
        <button class="submit-button" type="submit">Enviar link de recuperação</button>
        <p v-if="recoveryMessage" class="form-message" role="status">
          {{ recoveryMessage }}
        </p>
        <a class="forgot-link" href="/">Voltar para o login</a>
      </form>

      <footer class="legal">
        <a href="/termos-de-uso">Termos de uso</a>
        <span aria-hidden="true">·</span>
        <a href="/privacidade">Privacidade</a>
      </footer>
    </section>
  </main>
</template>
