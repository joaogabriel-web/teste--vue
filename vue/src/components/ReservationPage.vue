<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { reservas, type Reserva } from '../data/reservations'
import { salas } from '../data/rooms'

const emit = defineEmits<{
  logout: []
}>()

defineProps<{
  logoutError: string
}>()

const selectedRoom = ref('')
const date = ref('')
const startTime = ref('')
const endTime = ref('')
const responsible = ref('')
const purpose = ref('')
const submitted = ref(false)
const message = ref('')
const reservationList = reactive(reservas)

const errors = reactive({
  sala: '',
  data: '',
  inicio: '',
  fim: '',
  responsavel: '',
  finalidade: '',
})

const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

const selectedRoomDetails = computed(() =>
  salas.find((sala) => sala.nome === selectedRoom.value),
)

const recentReservations = computed(() =>
  [...reservationList].sort((a, b) =>
    `${a.data}T${a.inicio}`.localeCompare(`${b.data}T${b.inicio}`),
  ),
)

function clearErrors() {
  const fields: Array<keyof typeof errors> = [
    'sala',
    'data',
    'inicio',
    'fim',
    'responsavel',
    'finalidade',
  ]
  fields.forEach((field) => {
    errors[field] = ''
  })
}

function validateForm() {
  clearErrors()
  errors.sala = selectedRoom.value ? '' : 'Selecione uma sala.'
  errors.data = date.value ? '' : 'Informe a data.'
  errors.inicio = startTime.value ? '' : 'Informe o horário de início.'
  errors.fim = endTime.value ? '' : 'Informe o horário de término.'
  errors.responsavel = responsible.value.trim() ? '' : 'Informe o responsável.'
  errors.finalidade = purpose.value.trim() ? '' : 'Informe a finalidade.'

  if (date.value && date.value < today) {
    errors.data = 'Escolha uma data a partir de hoje.'
  }

  if (startTime.value && endTime.value && endTime.value <= startTime.value) {
    errors.fim = 'O término deve ser depois do início.'
  }

  return Object.values(errors).every((error) => !error)
}

function handleSubmit() {
  submitted.value = true
  message.value = ''

  if (!validateForm()) return

  const sala = selectedRoomDetails.value
  if (!sala) {
    throw new Error(`Sala selecionada não encontrada: ${selectedRoom.value}`)
  }

  const reservation: Reserva = {
    sala,
    data: date.value,
    inicio: startTime.value,
    fim: endTime.value,
    responsavel: responsible.value.trim(),
    finalidade: purpose.value.trim(),
    situacao: 'pendente',
  }

  reservationList.push(reservation)
  selectedRoom.value = ''
  date.value = ''
  startTime.value = ''
  endTime.value = ''
  purpose.value = ''
  message.value = 'Solicitação enviada! Ela ficará pendente até a aprovação do gerente.'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${value}T12:00:00Z`),
  )
}
</script>

<template>
  <div class="reservation-shell">
    <header class="reservation-header">
      <a class="brand reservation-brand" href="/reservas" aria-label="reserve.me - reservas">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <rect x="4" y="7" width="32" height="29" rx="9" fill="currentColor" />
            <path d="M13 4v7M27 4v7M4 15h32" stroke="white" stroke-width="2.5" stroke-linecap="round" />
            <path d="m15.5 24 3 3 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <span class="brand-name">reserve<span>.me</span></span>
      </a>
      <button class="logout-button" type="button" @click="emit('logout')">Sair</button>
    </header>
    <p v-if="logoutError" class="form-required-alert" role="alert" aria-live="polite">
      {{ logoutError }}
    </p>

    <section class="reservation-intro" aria-labelledby="reservation-title">
      <p class="reservation-eyebrow"><span aria-hidden="true"></span> RESERVAS DA ESCOLA</p>
      <h1 id="reservation-title">Reserve uma sala</h1>
      <p>Encontre o espaço ideal para sua atividade e envie uma solicitação ao gerente.</p>
    </section>

    <div class="reservation-layout">
      <section class="reservation-panel" aria-labelledby="request-title">
        <div class="panel-heading">
          <div>
            <p class="panel-kicker">NOVA SOLICITAÇÃO</p>
            <h2 id="request-title">Detalhes da reserva</h2>
          </div>
          <span class="pending-note"><span aria-hidden="true"></span> Aprovação necessária</span>
        </div>

        <form class="reservation-form" novalidate @submit.prevent="handleSubmit">
          <div class="reservation-field">
            <label for="room">Sala <span aria-hidden="true">*</span></label>
            <p v-if="submitted && errors.sala" id="room-error" class="field-error" role="alert">
              {{ errors.sala }}
            </p>
            <select
              id="room"
              v-model="selectedRoom"
              class="reservation-control"
              :class="{ 'reservation-control--error': submitted && errors.sala }"
              :aria-invalid="Boolean(submitted && errors.sala)"
              :aria-describedby="submitted && errors.sala ? 'room-error' : undefined"
              @change="errors.sala = ''"
            >
              <option value="" disabled>Selecione uma sala</option>
              <option v-for="room in salas" :key="room.nome" :value="room.nome">
                {{ room.nome }} · {{ room.capacidade }} pessoas
              </option>
            </select>
          </div>

          <div class="reservation-field">
            <label for="reservation-date">Data <span aria-hidden="true">*</span></label>
            <p v-if="submitted && errors.data" id="date-error" class="field-error" role="alert">
              {{ errors.data }}
            </p>
            <input
              id="reservation-date"
              v-model="date"
              class="reservation-control"
              :class="{ 'reservation-control--error': submitted && errors.data }"
              type="date"
              :min="today"
              :aria-invalid="Boolean(submitted && errors.data)"
              :aria-describedby="submitted && errors.data ? 'date-error' : undefined"
              @input="errors.data = ''"
            />
          </div>

          <div class="reservation-time-row">
            <div class="reservation-field">
              <label for="start-time">Início <span aria-hidden="true">*</span></label>
              <p v-if="submitted && errors.inicio" id="start-error" class="field-error" role="alert">
                {{ errors.inicio }}
              </p>
              <input
                id="start-time"
                v-model="startTime"
                class="reservation-control"
                :class="{ 'reservation-control--error': submitted && errors.inicio }"
                type="time"
                :aria-invalid="Boolean(submitted && errors.inicio)"
                :aria-describedby="submitted && errors.inicio ? 'start-error' : undefined"
                @input="errors.inicio = ''"
              />
            </div>
            <div class="reservation-field">
              <label for="end-time">Fim <span aria-hidden="true">*</span></label>
              <p v-if="submitted && errors.fim" id="end-error" class="field-error" role="alert">
                {{ errors.fim }}
              </p>
              <input
                id="end-time"
                v-model="endTime"
                class="reservation-control"
                :class="{ 'reservation-control--error': submitted && errors.fim }"
                type="time"
                :aria-invalid="Boolean(submitted && errors.fim)"
                :aria-describedby="submitted && errors.fim ? 'end-error' : undefined"
                @input="errors.fim = ''"
              />
            </div>
          </div>

          <div class="reservation-field">
            <label for="responsible">Responsável <span aria-hidden="true">*</span></label>
            <p v-if="submitted && errors.responsavel" id="responsible-error" class="field-error" role="alert">
              {{ errors.responsavel }}
            </p>
            <input
              id="responsible"
              v-model="responsible"
              class="reservation-control"
              :class="{ 'reservation-control--error': submitted && errors.responsavel }"
              type="text"
              autocomplete="name"
              placeholder="Nome do professor ou funcionário"
              :aria-invalid="Boolean(submitted && errors.responsavel)"
              :aria-describedby="submitted && errors.responsavel ? 'responsible-error' : undefined"
              @input="errors.responsavel = ''"
            />
          </div>

          <div class="reservation-field">
            <label for="purpose">Finalidade <span aria-hidden="true">*</span></label>
            <p v-if="submitted && errors.finalidade" id="purpose-error" class="field-error" role="alert">
              {{ errors.finalidade }}
            </p>
            <textarea
              id="purpose"
              v-model="purpose"
              class="reservation-control reservation-textarea"
              :class="{ 'reservation-control--error': submitted && errors.finalidade }"
              rows="3"
              placeholder="Descreva brevemente a atividade"
              :aria-invalid="Boolean(submitted && errors.finalidade)"
              :aria-describedby="submitted && errors.finalidade ? 'purpose-error' : undefined"
              @input="errors.finalidade = ''"
            />
          </div>

          <p class="required-hint">* Campos obrigatórios</p>
          <p v-if="message" class="form-message" role="status" aria-live="polite">{{ message }}</p>
          <button class="submit-button" type="submit">Enviar solicitação</button>
        </form>
      </section>

      <aside class="reservation-aside">
        <section v-if="selectedRoomDetails" class="room-details" aria-labelledby="room-details-title">
          <p class="panel-kicker">SALA SELECIONADA</p>
          <h2 id="room-details-title">{{ selectedRoomDetails.nome }}</h2>
          <dl>
            <div><dt>Andar</dt><dd>{{ selectedRoomDetails.andar }}</dd></div>
            <div><dt>Capacidade</dt><dd>{{ selectedRoomDetails.capacidade }} pessoas</dd></div>
          </dl>
          <div class="resource-list">
            <p>Recursos disponíveis</p>
            <ul>
              <li v-for="resource in selectedRoomDetails.recursos" :key="resource">{{ resource }}</li>
            </ul>
          </div>
        </section>
        <section v-else class="reservation-tip">
          <span class="tip-icon" aria-hidden="true">i</span>
          <div>
            <h2>Como funciona?</h2>
            <p>Escolha uma sala e um horário. Sua solicitação será enviada ao gerente para aprovação.</p>
          </div>
        </section>

        <section class="requests-panel" aria-labelledby="requests-title">
          <div class="requests-heading">
            <div>
              <p class="panel-kicker">ACOMPANHAMENTO</p>
              <h2 id="requests-title">Solicitações</h2>
            </div>
            <span class="request-count">{{ recentReservations.length }}</span>
          </div>
          <p v-if="!recentReservations.length" class="empty-requests">
            Suas solicitações aparecerão aqui.
          </p>
          <ul v-else class="request-list">
            <li v-for="(reservation, index) in recentReservations" :key="`${reservation.data}-${reservation.sala.nome}-${reservation.inicio}-${index}`">
              <div class="request-info">
                <strong>{{ reservation.sala.nome }}</strong>
                <span>{{ formatDate(reservation.data) }} · {{ reservation.inicio }}–{{ reservation.fim }}</span>
                <span>{{ reservation.responsavel }}</span>
              </div>
              <span class="status-badge" :class="`status-badge--${reservation.situacao}`">
                {{ reservation.situacao }}
              </span>
            </li>
          </ul>
        </section>
      </aside>
    </div>

    <footer class="reservation-footer">
      <span>reserve<span>.me</span></span>
      <p>Feito para deixar cada reserva mais simples.</p>
      <a href="/termos-de-uso">Termos de uso</a>
    </footer>
  </div>
</template>
