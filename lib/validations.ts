import { z } from "zod"

// Validacao de CPF (algoritmo modulo 11)
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "")
  if (cleaned.length !== 11) return false
  
  // Rejeitar CPFs com todos digitos iguais
  if (/^(\d)\1+$/.test(cleaned)) return false

  // Calcular primeiro digito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i)
  }
  let digit1 = (sum * 10) % 11
  if (digit1 === 10 || digit1 === 11) digit1 = 0
  if (digit1 !== parseInt(cleaned[9])) return false

  // Calcular segundo digito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i)
  }
  let digit2 = (sum * 10) % 11
  if (digit2 === 10 || digit2 === 11) digit2 = 0
  if (digit2 !== parseInt(cleaned[10])) return false

  return true
}

// Validacao de CNPJ (algoritmo modulo 11)
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, "")
  if (cleaned.length !== 14) return false
  
  // Rejeitar CNPJs com todos digitos iguais
  if (/^(\d)\1+$/.test(cleaned)) return false

  // Calcular primeiro digito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i]
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit1 !== parseInt(cleaned[12])) return false

  // Calcular segundo digito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i]
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit2 !== parseInt(cleaned[13])) return false

  return true
}

// Mascaras para inputs
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

export function maskCNPJ(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1")
}

export function maskCEP(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1")
}

// Schemas Zod para cada tipo de cadastro
export const doadorSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  cpf: z.string().refine((val) => validateCPF(val), "CPF invalido"),
  phone: z.string().min(14, "Telefone invalido"),
  city: z.string().min(2, "Cidade e obrigatoria"),
  state: z.string().length(2, "Estado invalido"),
})

export const instituicaoSchema = z.object({
  institutionName: z.string().min(3, "Nome da instituicao deve ter pelo menos 3 caracteres"),
  cnpj: z.string().refine((val) => validateCNPJ(val), "CNPJ invalido"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  responsibleName: z.string().min(3, "Nome do responsavel e obrigatorio"),
  responsibleCpf: z.string().refine((val) => validateCPF(val), "CPF do responsavel invalido"),
  phone: z.string().min(14, "Telefone invalido"),
  street: z.string().min(3, "Endereco e obrigatorio"),
  number: z.string().min(1, "Numero e obrigatorio"),
  neighborhood: z.string().min(2, "Bairro e obrigatorio"),
  city: z.string().min(2, "Cidade e obrigatoria"),
  state: z.string().length(2, "Estado invalido"),
  cep: z.string().min(9, "CEP invalido"),
  category: z.string().min(1, "Area de atuacao e obrigatoria"),
  description: z.string().min(100, "Descricao deve ter pelo menos 100 caracteres"),
  website: z.string().url("URL invalida").optional().or(z.literal("")),
})

export const empresaAmbientalSchema = z.object({
  companyName: z.string().min(3, "Razao social deve ter pelo menos 3 caracteres"),
  cnpj: z.string().refine((val) => validateCNPJ(val), "CNPJ invalido"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  responsibleName: z.string().min(3, "Nome do responsavel e obrigatorio"),
  responsibleCpf: z.string().refine((val) => validateCPF(val), "CPF do responsavel invalido"),
  phone: z.string().min(14, "Telefone invalido"),
  street: z.string().min(3, "Endereco e obrigatorio"),
  number: z.string().min(1, "Numero e obrigatorio"),
  neighborhood: z.string().min(2, "Bairro e obrigatorio"),
  city: z.string().min(2, "Cidade e obrigatoria"),
  state: z.string().length(2, "Estado invalido"),
  cep: z.string().min(9, "CEP invalido"),
  sector: z.string().min(1, "Setor de atuacao e obrigatorio"),
  description: z.string().min(50, "Descricao deve ter pelo menos 50 caracteres"),
  website: z.string().url("URL invalida").optional().or(z.literal("")),
  certifications: z.array(z.string()).optional(),
})

export const checkerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  cpf: z.string().refine((val) => validateCPF(val), "CPF invalido"),
  phone: z.string().min(14, "Telefone invalido"),
  city: z.string().min(2, "Cidade e obrigatoria"),
  state: z.string().length(2, "Estado invalido"),
  education: z.string().min(1, "Formacao e obrigatoria"),
  knowledgeArea: z.string().min(3, "Area de conhecimento e obrigatoria"),
  motivation: z.string().min(50, "Motivacao deve ter pelo menos 50 caracteres"),
})

export const certificadorSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  cpf: z.string().refine((val) => validateCPF(val), "CPF invalido"),
  phone: z.string().min(14, "Telefone invalido"),
  professionalRegister: z.string().min(1, "Tipo de registro profissional e obrigatorio"),
  registerNumber: z.string().min(3, "Numero do registro e obrigatorio"),
  education: z.string().min(1, "Formacao e obrigatoria"),
  specialization: z.string().min(3, "Area de especializacao e obrigatoria"),
  yearsExperience: z.coerce.number().min(1, "Anos de experiencia e obrigatorio"),
  resume: z.string().min(50, "Curriculo resumido deve ter pelo menos 50 caracteres"),
})

export const prefeituraSchema = z.object({
  municipalityName: z.string().min(3, "Nome do municipio e obrigatorio"),
  state: z.string().length(2, "Estado invalido"),
  email: z.string().email("Email institucional invalido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  mayorName: z.string().min(3, "Nome do prefeito e obrigatorio"),
  responsibleName: z.string().min(3, "Nome do responsavel tecnico e obrigatorio"),
  responsibleRole: z.string().min(3, "Cargo e obrigatorio"),
  phone: z.string().min(14, "Telefone invalido"),
  cnpj: z.string().refine((val) => validateCNPJ(val), "CNPJ invalido"),
  population: z.coerce.number().min(1, "Populacao e obrigatoria"),
  website: z.string().url("URL invalida").optional().or(z.literal("")),
})

// Estados brasileiros
export const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapa" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceara" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espirito Santo" },
  { value: "GO", label: "Goias" },
  { value: "MA", label: "Maranhao" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Para" },
  { value: "PB", label: "Paraiba" },
  { value: "PR", label: "Parana" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piaui" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondonia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "Sao Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

// Categorias TSB (areas de atuacao social)
export const TSB_CATEGORIES = [
  { value: "educacao", label: "Educacao" },
  { value: "saude", label: "Saude" },
  { value: "assistencia_social", label: "Assistencia Social" },
  { value: "meio_ambiente", label: "Meio Ambiente" },
  { value: "cultura", label: "Cultura e Arte" },
  { value: "esporte", label: "Esporte e Lazer" },
  { value: "direitos_humanos", label: "Direitos Humanos" },
  { value: "desenvolvimento_comunitario", label: "Desenvolvimento Comunitario" },
  { value: "economia_solidaria", label: "Economia Solidaria" },
  { value: "seguranca_alimentar", label: "Seguranca Alimentar" },
  { value: "habitacao", label: "Habitacao" },
  { value: "outros", label: "Outros" },
]

// Setores ambientais
export const ENVIRONMENTAL_SECTORS = [
  { value: "energia", label: "Energia Renovavel" },
  { value: "agua", label: "Recursos Hidricos" },
  { value: "residuos", label: "Gestao de Residuos" },
  { value: "agro", label: "Agropecuaria Sustentavel" },
  { value: "biodiversidade", label: "Biodiversidade e Conservacao" },
  { value: "carbono", label: "Credito de Carbono" },
  { value: "florestal", label: "Manejo Florestal" },
  { value: "outro", label: "Outro" },
]

// Certificacoes ambientais
export const ENVIRONMENTAL_CERTIFICATIONS = [
  { value: "iso14001", label: "ISO 14001" },
  { value: "bcorp", label: "B Corp" },
  { value: "fsc", label: "FSC" },
  { value: "organic", label: "Organico" },
  { value: "verra", label: "Verra/VCS" },
  { value: "gold_standard", label: "Gold Standard" },
  { value: "outro", label: "Outra" },
]

// Niveis de formacao
export const EDUCATION_LEVELS = [
  { value: "ensino_medio", label: "Ensino Medio" },
  { value: "tecnico", label: "Tecnico" },
  { value: "graduacao", label: "Graduacao" },
  { value: "pos_graduacao", label: "Pos-Graduacao" },
  { value: "mestrado", label: "Mestrado" },
  { value: "doutorado", label: "Doutorado" },
]

// Registros profissionais
export const PROFESSIONAL_REGISTERS = [
  { value: "crea", label: "CREA" },
  { value: "crbio", label: "CRBio" },
  { value: "crq", label: "CRQ" },
  { value: "cfq", label: "CFQ" },
  { value: "crf", label: "CRF" },
  { value: "outro", label: "Outro" },
]
