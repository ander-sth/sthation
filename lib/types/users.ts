// Tipos de Usuário conforme Documento Mestre v6.0
// Seção 2.1: Tipos de Perfis de Usuário

export enum UserRole {
  // 6 tipos principais de perfis
  DOADOR = "DOADOR",
  INSTITUICAO = "INSTITUICAO", // Alias generico
  INSTITUICAO_SOCIAL = "INSTITUICAO_SOCIAL",
  EMPRESA_AMBIENTAL = "EMPRESA_AMBIENTAL",
  CHECKER = "CHECKER",
  ANALISTA_CERTIFICADOR = "ANALISTA_CERTIFICADOR",
  ADMIN = "ADMIN",
  PREFEITURA = "PREFEITURA",
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  // Campos específicos por role
  cpf?: string // Pessoa física
  cnpj?: string // Pessoa jurídica
  isVerified: boolean
  // Sthation Academy
  certifications?: string[] // Badges/NFTs de certificação
  academyCompletedAt?: Date
  // Checker específico
  checkerScore?: number // Score de reputação (0-100)
  totalValidations?: number
  // Instituição específico
  estatutoUrl?: string
  comprovanteCnpjUrl?: string
}

// Permissões por role conforme Documento Mestre
export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    label: string
    description: string
    canCreateIAC: boolean
    canDonate: boolean
    canValidateVCA: boolean
    canValidateTechnical: boolean // Analista Certificador
    canBuyNobis: boolean
    canManageUsers: boolean
    canAccessDashboard: boolean
    requiresVerification: boolean
    requiresCertification: boolean
  }
> = {
  [UserRole.DOADOR]: {
    label: "Doador",
    description: "Indivíduo ou empresa que realiza doações para projetos sociais/ambientais",
    canCreateIAC: false,
    canDonate: true,
    canValidateVCA: false,
    canValidateTechnical: false,
    canBuyNobis: false,
    canManageUsers: false,
    canAccessDashboard: true,
    requiresVerification: false,
    requiresCertification: false,
  },
  [UserRole.INSTITUICAO]: {
    label: "Instituicao",
    description: "Organizacao que executa acoes de impacto social ou ambiental",
    canCreateIAC: true,
    canDonate: false,
    canValidateVCA: false,
    canValidateTechnical: false,
    canBuyNobis: false,
    canManageUsers: false,
    canAccessDashboard: true,
    requiresVerification: true,
    requiresCertification: false,
  },
  [UserRole.INSTITUICAO_SOCIAL]: {
    label: "Instituicao Social",
    description: "Organizacao que executa acoes de impacto social (ONGs, associacoes, cooperativas)",
    canCreateIAC: true,
    canDonate: false,
    canValidateVCA: false,
    canValidateTechnical: false,
    canBuyNobis: false,
    canManageUsers: false,
    canAccessDashboard: true,
    requiresVerification: true,
    requiresCertification: false,
  },
  [UserRole.EMPRESA_AMBIENTAL]: {
    label: "Empresa Ambiental",
    description: "Empresa especializada em projetos de sustentabilidade e redução de carbono",
    canCreateIAC: true,
    canDonate: false,
    canValidateVCA: false,
    canValidateTechnical: false,
    canBuyNobis: false,
    canManageUsers: false,
    canAccessDashboard: true,
    requiresVerification: true,
    requiresCertification: false,
  },
  [UserRole.CHECKER]: {
    label: "Checker (Verificador)",
    description: "Validador independente que audita evidências via VCA",
    canCreateIAC: false,
    canDonate: true,
    canValidateVCA: true,
    canValidateTechnical: false,
    canBuyNobis: false,
    canManageUsers: false,
    canAccessDashboard: true,
    requiresVerification: true,
    requiresCertification: true, // Requer Sthation Academy
  },
  [UserRole.ANALISTA_CERTIFICADOR]: {
    label: "Analista Certificador",
    description: "Especialista técnico que valida dados de projetos ambientais",
    canCreateIAC: false,
    canDonate: false,
    canValidateVCA: false,
    canValidateTechnical: true,
    canBuyNobis: false,
    canManageUsers: false,
    canAccessDashboard: true,
    requiresVerification: true,
    requiresCertification: true, // Requer certificação especializada
  },
  [UserRole.ADMIN]: {
    label: "Administrador",
    description: "Admin interno da plataforma Sthation",
    canCreateIAC: true,
    canDonate: true,
    canValidateVCA: true,
    canValidateTechnical: true,
    canBuyNobis: false,
    canManageUsers: true,
    canAccessDashboard: true,
    requiresVerification: false,
    requiresCertification: false,
  },
  [UserRole.PREFEITURA]: {
    label: "Prefeitura",
    description: "Gestao publica que inscreve projetos sociais e ambientais para verificacao",
    canCreateIAC: true,
    canDonate: false,
    canValidateVCA: false,
    canValidateTechnical: false,
    canBuyNobis: false,
    canManageUsers: false,
    canAccessDashboard: true,
    requiresVerification: true,
    requiresCertification: false,
  },
}
