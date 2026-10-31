export type Sala = {
  nome: string
  andar: number
  capacidade: number
  recursos: string[]
}

export const salas: Sala[] = [
  {
    nome: 'Sala de Reuniões',
    andar: 1,
    capacidade: 8,
    recursos: ['Projetor', 'Quadro branco', 'Videoconferência'],
  },
  {
    nome: 'Laboratório de Informática',
    andar: 2,
    capacidade: 24,
    recursos: ['Computadores', 'Projetor', 'Internet'],
  },
  {
    nome: 'Auditório',
    andar: 1,
    capacidade: 80,
    recursos: ['Microfone', 'Projetor', 'Sistema de som'],
  },
  {
    nome: 'Sala de Formação',
    andar: 3,
    capacidade: 18,
    recursos: ['Quadro branco', 'TV', 'Internet'],
  },
]
