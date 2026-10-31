export type LegalSection = {
  id: string
  number: string
  title: string
  paragraphs: string[]
}

export const termsSections: LegalSection[] = [
  {
    id: 'sobre',
    number: '01',
    title: 'Sobre o reserve.me',
    paragraphs: [
      'O reserve.me oferece ferramentas para que pessoas encontrem e organizem reservas e para que estabelecimentos gerenciem seus agendamentos.',
      'As condições específicas de cada serviço, como horários, preços, pagamentos e cancelamentos, são informadas pelo estabelecimento responsável no momento da reserva.',
    ],
  },
  {
    id: 'conta',
    number: '02',
    title: 'Sua conta',
    paragraphs: [
      'Ao criar uma conta, mantenha seus dados corretos e suas credenciais em segurança. As atividades realizadas com sua conta são de sua responsabilidade.',
      'Se suspeitar de acesso não autorizado, avise o suporte pelos canais oficiais da plataforma assim que possível.',
    ],
  },
  {
    id: 'reservas',
    number: '03',
    title: 'Reservas e cancelamentos',
    paragraphs: [
      'Confira os detalhes da reserva antes de confirmá-la. Regras de alteração, atraso, comparecimento e reembolso podem variar conforme o estabelecimento e devem ser apresentadas durante a contratação.',
      'O reserve.me não substitui o contato direto com o estabelecimento para questões sobre a prestação do serviço reservado.',
    ],
  },
  {
    id: 'responsabilidades',
    number: '04',
    title: 'Uso responsável',
    paragraphs: [
      'Use a plataforma de forma lícita e respeitosa. Não tente comprometer sua segurança, interferir no funcionamento do serviço ou utilizar informações de outras pessoas sem autorização.',
      'O estabelecimento é responsável pelas informações que publica e pelos serviços que oferece. O reserve.me atua como ferramenta de conexão e organização de reservas.',
    ],
  },
  {
    id: 'disponibilidade',
    number: '05',
    title: 'Disponibilidade da plataforma',
    paragraphs: [
      'Trabalhamos para manter o reserve.me disponível e seguro, mas podem ocorrer interrupções para manutenção, atualizações ou por fatores fora do nosso controle.',
      'Estes termos podem ser atualizados para refletir mudanças no serviço ou na legislação. A versão vigente ficará disponível nesta página.',
    ],
  },
  {
    id: 'contato',
    number: '06',
    title: 'Dúvidas e contato',
    paragraphs: [
      'Para dúvidas sobre estes termos, entre em contato pelos canais oficiais de suporte disponíveis na plataforma.',
      'O uso continuado do reserve.me após a publicação de uma nova versão indica ciência dos termos atualizados.',
    ],
  },
]

export const privacySections: LegalSection[] = [
  {
    id: 'dados',
    number: '01',
    title: 'Quais dados podemos tratar',
    paragraphs: [
      'Tratamos informações necessárias para oferecer o serviço, como dados de cadastro e contato, detalhes de reservas e comunicações feitas por meio da plataforma.',
      'Dados técnicos de navegação, como tipo de dispositivo e registros de acesso, podem ser tratados para manter a segurança e o funcionamento do reserve.me.',
    ],
  },
  {
    id: 'finalidades',
    number: '02',
    title: 'Como usamos seus dados',
    paragraphs: [
      'Usamos essas informações para criar e administrar sua conta, permitir reservas, enviar comunicações relacionadas ao serviço, atender solicitações e proteger a plataforma contra fraudes e acessos indevidos.',
      'Quando necessário, também podemos tratar dados para cumprir obrigações legais e exercer direitos em processos ou solicitações legítimas.',
    ],
  },
  {
    id: 'compartilhamento',
    number: '03',
    title: 'Quando compartilhamos',
    paragraphs: [
      'Os dados necessários à reserva podem ser compartilhados com o estabelecimento escolhido, para que ele possa organizar e prestar o serviço solicitado.',
      'Também podemos utilizar fornecedores que apoiam a operação da plataforma, sempre limitando o acesso ao necessário, ou compartilhar informações quando houver obrigação legal.',
    ],
  },
  {
    id: 'cookies',
    number: '04',
    title: 'Cookies e tecnologias',
    paragraphs: [
      'Tecnologias locais podem ser usadas para manter sessões, lembrar preferências e entender o funcionamento do serviço. As configurações do seu navegador permitem gerenciar cookies, mas desativar alguns deles pode afetar recursos da plataforma.',
    ],
  },
  {
    id: 'seguranca',
    number: '05',
    title: 'Armazenamento e segurança',
    paragraphs: [
      'Mantemos os dados pelo período necessário às finalidades descritas nesta política e às obrigações aplicáveis. Adotamos medidas técnicas e organizacionais para reduzir riscos de acesso, perda ou uso indevido.',
      'Nenhum sistema é completamente livre de riscos. Caso ocorra um incidente relevante, serão tomadas as medidas previstas na legislação aplicável.',
    ],
  },
  {
    id: 'direitos',
    number: '06',
    title: 'Seus direitos',
    paragraphs: [
      'Nos termos da Lei Geral de Proteção de Dados (LGPD), você pode solicitar confirmação do tratamento, acesso, correção, anonimização, portabilidade, eliminação nos casos cabíveis e informações sobre o compartilhamento de seus dados.',
      'Para exercer seus direitos ou tirar dúvidas sobre privacidade, use os canais oficiais de suporte disponíveis na plataforma. Poderemos pedir informações para confirmar sua identidade e responder à solicitação.',
    ],
  },
  {
    id: 'atualizacoes',
    number: '07',
    title: 'Atualizações desta política',
    paragraphs: [
      'Esta política pode mudar quando nossos serviços ou requisitos legais forem atualizados. A versão vigente e sua data de atualização estarão sempre indicadas nesta página.',
    ],
  },
]

export const getLegalDocumentSections = (isPrivacyPage: boolean) =>
  isPrivacyPage ? privacySections : termsSections

export const getLegalDocumentTitle = (isPrivacyPage: boolean) =>
  isPrivacyPage ? 'Política de privacidade' : 'Termos de uso'
