/**
 * Centralized pt-BR copy for 001-school-trip-payments (FR-024).
 * Specs and code comments remain English.
 */

/** Shared list/table pagination toolbar (page size + prev/next). */
const listTablePagination = {
  pageSize: "Itens por página",
  prev: "Página anterior",
  next: "Próxima página",
  /** Compact visible fraction; use `pageOfAria` for accessible name. */
  pageOf: (page: number, totalPages: number) => `${page} / ${totalPages}`,
  pageOfAria: (page: number, totalPages: number) =>
    `Página ${page} de ${totalPages}`,
};

export const ptBR = {
  entities: {
    school: "Escola",
    schools: "Escolas",
    trip: "Viagem",
    trips: "Viagens",
    /** Sidebar + page: Wix payment gateway console (005). */
    wixIntegration: "Integração Wix",
    passenger: "Passageiro",
    passengers: "Passageiros",
    payment: "Pagamento",
    payments: "Pagamentos",
  },
  fields: {
    name: "Nome",
    /** Trip list / forms: main heading text. */
    title: "Título",
    /** ISO `createdAt` column in trip lists. */
    createdAt: "Data de criação",
    fullName: "Nome completo",
    url: "URL da página",
    /** School form: Wix Stores collection picker + page URL used only for favicon fetch. */
    wixCollection: "Coleção Wix",
    wixCollectionSearchPlaceholder: "Buscar coleção pelo nome…",
    wixCollectionClear: "Remover coleção",
    wixProduct: "Produto Wix",
    wixProductSearchPlaceholder: "Buscar produto pelo nome…",
    wixProductClear: "Remover produto",
    wixProductPageUrl: "URL da página do produto",
    wixProductId: "ID do produto (Wix)",
    imagePreview: "Imagem",
    schoolUrlForFaviconOnly: "URL da página (apenas favicon)",
    slug: "Slug",
    visibility: "Visibilidade",
    visible: "Visível",
    hidden: "Oculta",
    products: "Produtos",
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
    settledPayments: "Quitado",
    settledManual: "Marcado como pago",
    unavailable: "Indisponível",
  },
  toggles: {
    includeInactiveSchools: "Incluir escolas inativas",
    includeInactiveTrips: "Incluir viagens inativas",
    includeRemovedPassengers: "Incluir removidos",
  },
  actions: {
    create: "Criar",
    /** Primary CTA on school trips list (`/schools/.../trips`). */
    addTrip: "Adicionar viagem",
    /** Primary CTA on trip workspace passengers list pane. */
    addPassenger: "Adicionar passageiro",
    edit: "Editar",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    /** School row: soft-delete (inactive, hidden from default list). */
    deactivate: "Desativar",
    /** School row: re-enable inactive school in default list. */
    activate: "Ativar",
    /** School row: hard-delete from DB (Wix rules apply). */
    deletePermanently: "Excluir permanentemente",
    restore: "Restaurar",
    paymentHistory: "Pagamentos",
    newPayment: "Novo pagamento",
    editPayment: "Editar pagamento",
    markManualPaid: "Marcar pago (sem informações)",
    clearManualPaid: "Desmarcar pago manual",
    adjustToPaid: "Ajustar para pago",
    fetchMetadata: "Buscar dados da página",
    viewSchool: "Ver escola",
    viewTrips: "Viagens",
    viewPassengers: "Passageiros",
    /** Trip workspace list pane; control is a placeholder until share is implemented. */
    share: "Compartilhar",
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
    sidebarNav: "Navegação principal",
    loading: "Carregando resumo…",
    aggregatesError: "Não foi possível carregar o resumo da viagem.",
    invalidRoute:
      "Endereço inválido ou recurso não encontrado. Volte para uma lista válida.",
  },
  scope: {
    initError: "Não foi possível carregar os dados iniciais do escopo.",
    retry: "Tentar novamente",
    openMenu: "Abrir menu de escopo",
    editSchool: "Editar escola ativa",
    placeholderUser: "Artur",
    noSchoolSelected: "Selecione uma escola",
    /** Native tooltip when main sidebar nav is disabled until a school is chosen. */
    selectSchoolForSidebarNav:
      "Selecione uma escola no menu acima para usar Início, Viagens e Integração Wix.",
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
    payments: "Nenhum pagamento registrado.",
  },
  /** School row: soft deactivate (inactive). */
  deactivateSchoolDialog: {
    title: "Desativar escola",
    intro: (name: string) =>
      `A escola “${name}” será marcada como inativa e deixará de aparecer na lista padrão.`,
    hint: "Você ainda pode vê-la com o filtro “Incluir escolas inativas”.",
    deactivateFailed: "Não foi possível desativar a escola. Tente novamente.",
  },
  /** School row: activate inactive school. */
  activateSchoolDialog: {
    title: "Ativar escola",
    intro: (name: string) =>
      `A escola “${name}” voltará a aparecer na lista padrão e poderá ser usada normalmente.`,
    activateFailed: "Não foi possível ativar a escola. Tente novamente.",
  },
  /** School row hard delete: AlertDialog + Wix collection product check. */
  deleteSchoolDialog: {
    title: "Excluir permanentemente",
    intro: (name: string) =>
      `A escola “${name}” e todos os dados associados (viagens, passageiros, pagamentos) serão removidos do sistema. Esta ação não pode ser desfeita.`,
    checking: "Verificando a coleção Wix…",
    cannotBlockedProducts: (n: number) =>
      `Não é possível excluir: a coleção Wix desta escola tem ${n} produto(s). Remova os produtos da coleção no Wix e tente novamente.`,
    wixNotConfigured:
      "Não foi possível verificar a coleção Wix (integração sem chave de API). Configure a integração Wix e tente novamente.",
    wixQueryFailed:
      "Não foi possível consultar a coleção Wix. Tente novamente em instantes.",
    orphanCollectionHint:
      "A coleção salva não foi encontrada no Wix; a escola pode ser excluída normalmente.",
    emptyCollectionHint:
      "A coleção Wix está vazia; ela será removida ao confirmar a exclusão.",
    deleteFailed: "Não foi possível excluir a escola. Tente novamente.",
    deleteConflict:
      "A coleção Wix passou a ter produtos; atualize e tente novamente.",
  },
  /** Trip row: soft deactivate (inactive). */
  deactivateTripDialog: {
    title: "Desativar viagem",
    intro: (name: string) =>
      `A viagem “${name}” será marcada como inativa e deixará de aparecer na lista padrão.`,
    hint: "Você ainda pode vê-la com o filtro “Incluir viagens inativas”.",
    deactivateFailed: "Não foi possível desativar a viagem. Tente novamente.",
  },
  /** Trip row: activate inactive trip. */
  activateTripDialog: {
    title: "Ativar viagem",
    intro: (name: string) =>
      `A viagem “${name}” voltará a aparecer na lista padrão e poderá ser usada normalmente.`,
    activateFailed: "Não foi possível ativar a viagem. Tente novamente.",
  },
  /** Trip row: hard delete when there are no passengers. */
  deleteTripDialog: {
    title: "Excluir viagem permanentemente",
    intro: (name: string) =>
      `A viagem “${name}” será removida do sistema. Esta ação não pode ser desfeita.`,
    checking: "Verificando passageiros…",
    cannotWithPassengers: (n: number) =>
      `Não é possível excluir: há ${n} passageiro(s) nesta viagem. Remova os passageiros e tente novamente.`,
    readyHint:
      "Não há passageiros registrados; a viagem pode ser excluída com segurança.",
    eligibilityError:
      "Não foi possível verificar os passageiros. Tente novamente.",
    deleteFailed: "Não foi possível excluir a viagem. Tente novamente.",
    deleteConflict:
      "A viagem passou a ter passageiros; atualize e tente novamente.",
  },
  /** Passenger detail + payments index shared chrome (tabs under header). */
  passengerWorkspace: {
    tabNavAria: "Seções do passageiro",
    detailsTab: "Dados",
    paymentsTab: "Pagamentos",
    optionsMenuAria: "Mais opções do passageiro",
  },
  /** Trip workspace list pane (passengers + trip options menu). */
  tripWorkspace: {
    /** Header control: leave trip workspace for the school trips list (or escolas). */
    goBackAria: "Voltar à lista de viagens",
    passengersTab: "Passageiros",
    optionsMenuAria: "Mais opções da viagem",
    /** Placeholder until the header uses `trip.createdAt` from the API. */
    subtitleDateMock: "Criada em 9 de abr. de 2026",
    /** New trip form: school must have `wixCollectionId`. */
    tripNewRequiresWixCollection:
      "Configure uma coleção Wix na escola antes de criar uma viagem.",
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
    /** Detail pane on `/schools` / `/schools/`: left table is the directory; no card list here. */
    schoolsDirectoryDetailHint:
      "Use a tabela à esquerda para abrir viagens, editar ou criar uma escola.",
    /** Detail pane on `/schools/$schoolId/trips` when no trip is open in this shell. */
    selectTripPrompt:
      "Selecione uma viagem na lista para ver os detalhes aqui.",
    /** Trip workspace list pane: invalid `tripId` in URL. */
    invalidTripContext: "Identificador de viagem inválido.",
    /** School trips list pane: invalid `schoolId` in URL. */
    invalidSchoolContext: "Identificador de escola inválido.",
    /** Wix integration detail when no event row is selected. */
    selectWixEventPrompt:
      "Selecione um evento de pagamento na lista para ver os detalhes aqui.",
    passengersLoadError: "Não foi possível carregar os passageiros.",
    /** Trip workspace list pane: trip metadata failed to load. */
    tripContextLoadError: "Não foi possível carregar os dados da viagem.",
    /** Detail pane on `/trips/$tripId/passengers` when no passenger row is selected. */
    selectPassengerPrompt: "Comece escolhendo um passageiro na lista ao lado.",
  },
  /** List views: pagination labels for `ListTablePaginationToolbar`. */
  listTable: {
    pagination: listTablePagination,
  },
  /** FR-012 unsaved changes Alert Dialog (004). */
  /** Wix payment gateway event console (005); UI strings only. */
  wixIntegration: {
    pageTitle: "Pagamentos Wix",
    pageSubtitle:
      "Eventos recebidos do gateway (dados simulados nesta versão).",
    optionsMenuAria: "Menu de opções da integração Wix",
    configureKeys: "Configurar chaves",
    settingsSheetTitle: "Configuração da integração",
    settingsSheetDescription:
      "Integração única para todo o ambiente. O ID do site Wix (GUID) é enviado nas chamadas à API como cabeçalho `wix-site-id` (ou use a variável `WIX_SITE_ID` no servidor). A chave pública é usada nos webhooks do Wix para recebermos eventos e atualizarmos a base de dados. A chave da API (privada) autentica o acesso programático à API do Wix. Apenas um prefixo da chave privada é exibido aqui; os valores completos ficam no servidor.",
    emptyTable: "Nenhum evento para exibir com os filtros atuais.",
    emptySchoolConsole: "Nenhum evento de escola com os filtros atuais.",
    emptyTripConsole: "Nenhum evento de viagem com os filtros atuais.",
    emptyOrphans: "Nenhum evento órfão com os filtros atuais.",
    orphanBadge: "Órfão",
    noTripLabel: "—",
    columns: {
      trip: "Viagem",
      value: "Valor",
      buyerName: "Nome do comprador",
      email: "E-mail",
      date: "Data",
      eventType: "Tipo",
      categoryName: "Categoria",
      tripName: "Nome da viagem",
      id: "ID",
      integrationEventType: "Tipo de evento",
    },
    keys: {
      siteId: "ID do site Wix",
      siteIdPlaceholder: "Cole o Site ID (GUID do site no painel Wix)",
      publicKey: "Chave pública",
      publicKeyPlaceholder: "Cole a chave pública do site",
      privateKey: "Chave da API (privada)",
      privateKeyPlaceholder: "Cole a chave privada ou da API",
      revealPrivate: "Mostrar chave",
      hidePrivate: "Ocultar chave",
      keyNotSet: "Não configurada",
      editKey: "Editar",
      applyKey: "Aplicar",
      cancelEdit: "Cancelar",
    },
    tabs: {
      schools: "Escolas",
      trips: "Viagens",
      payments: "Pagamentos",
    },
    eventTypeFilterHint: "Tipos de evento",
    schoolEventTypes: {
      create: "create",
      updated: "updated",
      deleted: "deleted",
      removedTrip: "removedTrip",
      addedTrip: "addedTrip",
    },
    tripEventTypes: {
      create: "create",
      updated: "updated",
      deleted: "deleted",
    },
    paymentEventTypes: {
      order_paid: "order_paid",
      order_updated: "order_updated",
      refund: "refund",
      payment_failed: "payment_failed",
    },
    toggles: {
      orphanOnly: "Somente órfãos",
    },
    pagination: listTablePagination,
    detailTitle: "Detalhes do evento",
    detailFields: {
      id: "ID do evento",
      dateCreated: "Data de criação",
      buyerInfoId: "ID do comprador",
      buyerIndoFirstname: "Nome",
      buyerIndoLastname: "Sobrenome",
      buyerIndoPhone: "Telefone do comprador",
      buyerIndoEmail: "E-mail do comprador",
      buyerIndoContactId: "ID de contato",
      orderId: "ID do pedido",
      orderTotal: "Total do pedido",
      billingInfoPaymentMethod: "Forma de pagamento",
      billingInfoCountry: "País (cobrança)",
      billingInfoSubdivision: "UF / subdivisão",
      billingInfoCity: "Cidade",
      billingInfoZipCode: "CEP",
      billingInfoPhone: "Telefone (cobrança)",
      billingInfoEmail: "E-mail (cobrança)",
      billingInfoVatIdNumber: "Documento fiscal",
      billingInfoVatIdType: "Tipo de documento",
      billingInfoStreetNumber: "Número",
      billingInfoStreetName: "Logradouro",
      lineItemsName: "Item (nome)",
      lineItemsProductId: "ID do produto",
      lineItemsOptions: "Opções do item",
      lineItemsCustomTextFields: "Campos de texto personalizados",
    },
  },
  unsavedChanges: {
    title: "Descartar alterações?",
    description:
      "Há alterações não salvas. Se continuar, elas serão perdidas. Deseja descartar?",
    continueEditing: "Continuar editando",
    discard: "Descartar alterações",
    save: "Salvar",
  },
} as const;
