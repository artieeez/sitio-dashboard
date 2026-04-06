/**
 * Centralized pt-BR copy for 001-school-trip-payments (FR-024).
 * Specs and code comments remain English.
 */
export const ptBR = {
  entities: {
    school: "Escola",
    schools: "Escolas",
    trip: "Viagem",
    trips: "Viagens",
    passenger: "Passageiro",
    passengers: "Passageiros",
    payment: "Pagamento",
    payments: "Pagamentos",
  },
  fields: {
    name: "Nome",
    fullName: "Nome completo",
    url: "URL da página",
    landingPage: "Página de destino",
    active: "Ativa",
    inactive: "Inativa",
    defaultExpectedAmount: "Valor esperado padrão (BRL)",
    expectedAmountOverride: "Valor esperado (passageiro)",
    cpf: "CPF",
    parentName: "Nome do responsável",
    parentPhone: "Telefone do responsável",
    parentEmail: "E-mail do responsável",
    paymentStatus: "Situação do pagamento",
    paidOn: "Data do pagamento",
    amount: "Valor",
    location: "Local",
    payerIdentity: "Identificação do pagador",
    manualPaidWithoutInfo: "Pago sem informações",
    removedPassenger: "Passageiro removido",
  },
  status: {
    pending: "Pendente",
    settledPayments: "Quitado (pagamentos)",
    settledManual: "Quitado (manual)",
    unavailable: "Indisponível",
  },
  toggles: {
    includeInactiveSchools: "Incluir escolas inativas",
    includeInactiveTrips: "Incluir viagens inativas",
    includeRemovedPassengers: "Incluir passageiros removidos",
  },
  actions: {
    create: "Criar",
    edit: "Editar",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    restore: "Restaurar",
    paymentHistory: "Pagamentos",
    newPayment: "Novo pagamento",
    editPayment: "Editar pagamento",
    markManualPaid: "Marcar pago (sem informações)",
    clearManualPaid: "Desmarcar pago manual",
    openLanding: "Abrir página",
    fetchMetadata: "Buscar dados da página",
    viewSchool: "Ver escola",
    viewTrips: "Viagens",
    viewPassengers: "Passageiros",
  },
  theme: {
    light: "Claro",
    dark: "Escuro",
    toggle: "Alternar tema",
  },
  nav: {
    home: "Início",
  },
  aria: {
    rowMenu: "Menu da linha",
  },
  shell: {
    sidebarNav: "Navegação principal",
    loading: "Carregando resumo…",
    aggregatesError: "Não foi possível carregar o resumo da viagem.",
    invalidRoute:
      "Endereço inválido ou recurso não encontrado. Volte para uma lista válida.",
  },
  aggregates: {
    title: "Resumo por situação de pagamento",
  },
  emptyStates: {
    schools: "Nenhuma escola na lista (com os filtros atuais).",
    trips: "Nenhuma viagem para esta escola (com os filtros atuais).",
  },
} as const;
