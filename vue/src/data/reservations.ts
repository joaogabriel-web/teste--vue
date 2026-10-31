import type { Sala } from './rooms'
import { salas } from './rooms'

export type SituacaoReserva = 'pendente' | 'aprovada' | 'cancelada'

export type Reserva = {
  sala: Sala
  data: string
  inicio: string
  fim: string
  responsavel: string
  finalidade: string
  situacao: SituacaoReserva
}

function encontrarSala(nome: string): Sala {
  const sala = salas.find((item) => item.nome === nome)
  if (!sala) {
    throw new Error(`Sala de exemplo não encontrada: ${nome}`)
  }
  return sala
}

export const reservas: Reserva[] = [
  {
    sala: encontrarSala('Sala de Reuniões'),
    data: '2026-11-03',
    inicio: '09:00',
    fim: '10:30',
    responsavel: 'Ana Costa',
    finalidade: 'Reunião de planejamento pedagógico',
    situacao: 'pendente',
  },
  {
    sala: encontrarSala('Laboratório de Informática'),
    data: '2026-11-04',
    inicio: '14:00',
    fim: '16:00',
    responsavel: 'Marcos Lima',
    finalidade: 'Aula prática de informática',
    situacao: 'aprovada',
  },
  {
    sala: encontrarSala('Auditório'),
    data: '2026-11-05',
    inicio: '08:00',
    fim: '12:00',
    responsavel: 'Carla Souza',
    finalidade: 'Palestra de orientação profissional',
    situacao: 'aprovada',
  },
  {
    sala: encontrarSala('Sala de Formação'),
    data: '2026-11-06',
    inicio: '13:30',
    fim: '15:00',
    responsavel: 'João Mendes',
    finalidade: 'Formação continuada dos professores',
    situacao: 'cancelada',
  },
]
