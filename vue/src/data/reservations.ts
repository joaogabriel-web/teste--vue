import type { Sala } from './rooms'

export type SituacaoReserva = 'pendente' | 'aprovada' | 'rejeitada'

export type Reserva = {
  sala: Sala
  data: string
  inicio: string
  fim: string
  responsavel: string
  finalidade: string
  situacao: SituacaoReserva
}

export const reservas: Reserva[] = []
