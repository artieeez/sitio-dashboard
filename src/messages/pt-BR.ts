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
    openLanding: "Abrir página",
    fetchMetadata: "Buscar dados da página",
  },
  theme: {
    light: "Claro",
    dark: "Escuro",
    toggle: "Alternar tema",
  },
} as const;
