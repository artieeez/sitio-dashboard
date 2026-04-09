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
    fetchMetadata: "Buscar dados da página",
    viewSchool: "Ver escola",
    viewTrips: "Viagens",
    viewPassengers: "Passageiros",
  },
  theme: {
    label: "Tema",
    toggle: "Alternar tema",
  },
  nav: {
    home: "Início",
  },
  aria: {
    rowMenu: "Menu da linha",
  },
  shell: {
    mainNavGroup: "Menu",
    /** Sidebar group label for edit current school + add school. */
    schoolGroup: "Escola",
    sidebarNav: "Navegação principal",
    loading: "Carregando resumo…",
    aggregatesError: "Não foi possível carregar o resumo da viagem.",
    invalidRoute:
      "Endereço inválido ou recurso não encontrado. Volte para uma lista válida.",
  },
  scope: {
    initError: "Não foi possível carregar os dados iniciais do escopo.",
    retry: "Tentar novamente",
    addSchool: "Adicionar escola",
    openMenu: "Abrir menu de escopo",
    editSchool: "Editar escola ativa",
    placeholderUser: "Artur",
    noSchoolSelected: "Selecione uma escola",
    /** Native tooltip when main sidebar nav is disabled until a school is chosen. */
    selectSchoolForSidebarNav:
      "Selecione uma escola no menu acima para usar Início e Viagens.",
    searchPlaceholder: "Buscar escola",
    recents: "Escolas recentes",
    noRecents: "Nenhuma escola recente.",
    noResults: "Nenhuma escola encontrada.",
    /** Label for the filtered list section in the scope menu (Base UI requires group + label). */
    searchResults: "Resultados",
    homePlaceholder: "Visão geral da escola em breve.",
  },
  aggregates: {
    title: "Resumo por situação de pagamento",
  },
  emptyStates: {
    schools: "Nenhuma escola na lista (com os filtros atuais).",
    trips: "Nenhuma viagem para esta escola (com os filtros atuais).",
  },
  /** M3 list–detail regions (004); shell `aria-label`s. */
  listDetail: {
    listRegion: "Lista",
    detailRegion: "Detalhes",
    /** Clears list selection and returns to list + placeholder (any list–detail shell). */
    detailClose: "Fechar",
    /** Detail pane on `/schools/` when no school is selected. */
    selectSchoolPrompt:
      "Selecione uma escola na lista para ver os detalhes aqui.",
    /** Detail pane on `/schools/$schoolId/trips` when no trip is open in this shell. */
    selectTripPrompt:
      "Selecione uma viagem na lista para ver os detalhes aqui.",
    /** Trip workspace list pane: invalid `tripId` in URL. */
    invalidTripContext: "Identificador de viagem inválido.",
    /** School trips list pane: invalid `schoolId` in URL. */
    invalidSchoolContext: "Identificador de escola inválido.",
    passengersLoadError: "Não foi possível carregar os passageiros.",
    /** Detail pane on `/trips/$tripId/passengers` when no passenger payments row is primary. */
    selectPassengerPrompt:
      "Escolha um passageiro na lista ao lado ou use o menu da linha para pagamentos.",
  },
  /** FR-012 unsaved changes Alert Dialog (004). */
  unsavedChanges: {
    title: "Descartar alterações?",
    description:
      "Há alterações não salvas. Se continuar, elas serão perdidas. Deseja descartar?",
    continueEditing: "Continuar editando",
    discard: "Descartar alterações",
    save: "Salvar",
  },
} as const;
