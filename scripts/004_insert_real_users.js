import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const sql = neon(process.env.DATABASE_URL);

// Usuarios reais para cadastro
const users = [
  {
    email: "organa@sthation.com",
    password: "Organa2025!",
    name: "Organa Biotech",
    role: "EMPRESA_AMBIENTAL",
    institution: {
      name: "Organa Biotech Solucoes Ambientais Ltda",
      cnpj: "43.850.902/0001-20",
      type: "AMBIENTAL",
      description: "Empresa de solucoes ambientais e biotecnologia",
      address: "Rua Dona Francisca, 8300 - Zona Industrial 1, Joinville - SC, 89.219-600",
      city: "Joinville",
      state: "SC",
      website: "https://www.organabiotech.com.br/",
      responsible_name: "Anderson Teste",
      is_verified: true,
    },
  },
  {
    email: "abrigoanimal@sthation.com",
    password: "Abrigo2025!",
    name: "Abrigo Animal",
    role: "INSTITUICAO",
    institution: {
      name: "Associacao Abrigo Animal",
      cnpj: "04.603.573/0001-60",
      type: "SOCIAL",
      description: "Organizacao Nao-Governamental sem fins lucrativos dedicada ao resgate e protecao de animais",
      address: "Estr. Mario Bachtold, 433-85 - Joinville, SC",
      city: "Joinville",
      state: "SC",
      website: "https://abrigoanimal.org.br/",
      responsible_name: "Anderson Teste",
      is_verified: true,
    },
  },
  {
    email: "prefeitura@sthation.com",
    password: "Prefeitura2025!",
    name: "Prefeitura de Joinville",
    role: "PREFEITURA",
    institution: {
      name: "Prefeitura de Joinville",
      cnpj: "83.169.623/0001-10",
      type: "PREFEITURA",
      description: "Prefeitura Municipal de Joinville - SC",
      address: "Av. Hermann August Lepper, 10 - Saguacu, Joinville - SC, 89221-005",
      city: "Joinville",
      state: "SC",
      website: "https://www.joinville.sc.gov.br/",
      responsible_name: "Anderson Teste",
      phone: "(47) 3431-3233",
      is_verified: true,
    },
  },
  {
    email: "rafaelsth@protonmail.com",
    password: "Doador2025!",
    name: "Anderson Rafael Rosa",
    role: "DOADOR",
    cpf: "00913096970",
  },
  {
    email: "checker@sthation.com",
    password: "Checker2025!",
    name: "Anderson Rafael Rosa (Checker)",
    role: "CHECKER",
    cpf: "00913096970",
  },
];

async function insertUsers() {
  console.log("Iniciando insercao de usuarios reais...\n");

  for (const userData of users) {
    try {
      // Hash da senha
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Inserir usuario
      const userResult = await sql`
        INSERT INTO users (email, password_hash, name, role, is_verified, created_at)
        VALUES (${userData.email}, ${passwordHash}, ${userData.name}, ${userData.role}, true, NOW())
        ON CONFLICT (email) DO UPDATE SET
          password_hash = ${passwordHash},
          name = ${userData.name},
          role = ${userData.role}
        RETURNING id, email, name, role
      `;

      const user = userResult[0];
      console.log(`Usuario criado: ${user.email} (${user.role})`);

      // Se tem instituicao, inserir
      if (userData.institution) {
        const inst = userData.institution;
        await sql`
          INSERT INTO institutions (
            user_id, name, cnpj, type, description, address, city, state, 
            website, responsible_name, phone, is_verified, created_at
          )
          VALUES (
            ${user.id}, ${inst.name}, ${inst.cnpj}, ${inst.type}, ${inst.description},
            ${inst.address}, ${inst.city}, ${inst.state}, ${inst.website || null},
            ${inst.responsible_name}, ${inst.phone || null}, ${inst.is_verified}, NOW()
          )
          ON CONFLICT (cnpj) DO UPDATE SET
            name = ${inst.name},
            user_id = ${user.id}
          RETURNING id, name
        `;
        console.log(`  -> Instituicao: ${inst.name}`);
      }

      console.log(`  -> Senha: ${userData.password}\n`);
    } catch (error) {
      console.error(`Erro ao inserir ${userData.email}:`, error.message);
    }
  }

  console.log("\n=== RESUMO DE ACESSO ===\n");
  console.log("1. Empresa Ambiental:");
  console.log("   Email: organa@sthation.com");
  console.log("   Senha: Organa2025!\n");
  console.log("2. Instituicao Social:");
  console.log("   Email: abrigoanimal@sthation.com");
  console.log("   Senha: Abrigo2025!\n");
  console.log("3. Prefeitura:");
  console.log("   Email: prefeitura@sthation.com");
  console.log("   Senha: Prefeitura2025!\n");
  console.log("4. Doador:");
  console.log("   Email: rafaelsth@protonmail.com");
  console.log("   Senha: Doador2025!\n");
  console.log("5. Checker:");
  console.log("   Email: checker@sthation.com");
  console.log("   Senha: Checker2025!\n");
}

insertUsers().catch(console.error);
