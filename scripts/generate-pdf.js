import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const outputDir = path.resolve("public");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  info: {
    Title: "STHATION - Documentacao Tecnica dos Modulos Criticos",
    Author: "Sthation",
    Subject: "VCA, Analise Tecnica, Inscription",
  },
});

const output = fs.createWriteStream(path.join(outputDir, "STHATION_MODULOS_TECNICOS.pdf"));
doc.pipe(output);

// Colors
const DARK_TEAL = "#0a2f2f";
const TEAL = "#2dd4bf";
const WHITE = "#ffffff";
const LIGHT_GRAY = "#e5e7eb";
const MEDIUM_GRAY = "#6b7280";
const CODE_BG = "#f1f5f9";

let pageNum = 0;

function addHeader() {
  doc.save();
  doc.rect(0, 0, doc.page.width, 40).fill(DARK_TEAL);
  doc.fontSize(8).fill(WHITE).text("STHATION - Documentacao Tecnica", 50, 14, { width: 400 });
  doc.text(`Pagina ${pageNum}`, doc.page.width - 100, 14, { width: 50, align: "right" });
  doc.restore();
  doc.fill("#1f2937");
}

doc.on("pageAdded", () => {
  pageNum++;
  addHeader();
  doc.y = 55;
});

// ========== COVER PAGE ==========
doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK_TEAL);

doc.fontSize(14).fill(TEAL).text("STHATION", 50, 180, { align: "center" });
doc.moveDown(1);
doc.fontSize(32).fill(WHITE).text("Documentacao Tecnica", { align: "center" });
doc.fontSize(28).text("dos Modulos Criticos", { align: "center" });
doc.moveDown(2);

doc.fontSize(16).fill(TEAL).text("Validacao VCA", { align: "center" });
doc.text("Analise Tecnica", { align: "center" });
doc.text("Inscription Blockchain", { align: "center" });

doc.moveDown(3);
doc.fontSize(11).fill("#94a3b8").text("Documento de Referencia para Desenvolvimento Backend", { align: "center" });
doc.moveDown(1);
doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, { align: "center" });

// ========== INDEX PAGE ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("INDICE", 50, 70);
doc.moveDown(1);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

const indexItems = [
  "1. Visao Geral do Fluxo",
  "2. Modulo 1: Validacao VCA (Validation Community Audit)",
  "3. Modulo 2: Analise Tecnica (Certificacao)",
  "4. Modulo 3: Inscription (Registro Blockchain)",
  "5. Split de Pagamento",
  "6. Banco de Dados - Tabelas Necessarias",
  "7. Endpoints da API",
  "8. Regras de Negocio Criticas",
];

indexItems.forEach((item) => {
  doc.fontSize(13).fill("#1f2937").text(item, 60);
  doc.moveDown(0.5);
});

// ========== SECTION 1: VISAO GERAL ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("1. VISAO GERAL DO FLUXO", 50, 70);
doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

doc.fontSize(11).fill("#1f2937").text(
  "O ciclo de vida de um projeto na Sthation segue esta sequencia:",
  50
);
doc.moveDown(1);

// Flow diagram as text
doc.save();
doc.rect(50, doc.y, 495, 280).fill(CODE_BG).stroke(LIGHT_GRAY);
doc.fontSize(9).fill("#374151").font("Courier");
const flowY = doc.y + 10;
const flowLines = [
  "INSTITUICAO CRIA PROJETO (IAC)",
  "        |",
  "        v",
  "   CAPTACAO DE DOACOES (crowdfunding)",
  "        |",
  "        v",
  "   EXECUCAO DO PROJETO (coleta de evidencias)",
  "        |",
  "        v",
  "   SUBMISSAO PARA VALIDACAO (min 3 evidencias)",
  "        |",
  "        v",
  "  +-----+-----+",
  "  |             |",
  "SOCIAL       AMBIENTAL",
  "  |             |",
  "  v             v",
  "VCA           ANALISE TECNICA",
  "(Checkers)    (Certificadores)",
  "  |             |",
  "  +-----+-----+",
  "        |",
  "  RESULTADO DA VALIDACAO",
  "  APROVADO / DISPUTA / REJEITADO",
  "        |",
  "  INSCRIPTION (Bitcoin Ordinals)",
  "        |",
  "  HALL DE IMPACTO (registro publico)",
];
flowLines.forEach((line, i) => {
  doc.text(line, 60, flowY + i * 10);
});
doc.restore();
doc.y = flowY + flowLines.length * 10 + 20;
doc.font("Helvetica");

doc.moveDown(1);
doc.fontSize(14).fill(DARK_TEAL).text("Dois Fluxos Distintos");
doc.moveDown(0.5);

doc.fontSize(11).fill("#1f2937");
doc.font("Helvetica-Bold").text("Fluxo Social (com doacoes):", 50);
doc.font("Helvetica").text("Captacao -> Doacao -> Execucao -> VCA -> Certificacao -> Inscription -> Hall de Impacto", 50);
doc.moveDown(0.5);
doc.font("Helvetica-Bold").text("Fluxo Ambiental (sem doacoes):", 50);
doc.font("Helvetica").text("Execucao -> Certificacao Tecnica Direta -> Inscription -> Hall de Impacto", 50);

// ========== SECTION 2: VCA ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("2. VALIDACAO VCA", 50, 70);
doc.fontSize(12).fill(MEDIUM_GRAY).text("Validation Community Audit", 50);
doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

doc.fontSize(16).fill(DARK_TEAL).text("2.1 O que e");
doc.moveDown(0.5);
doc.fontSize(11).fill("#1f2937").text(
  "O VCA e o sistema de validacao descentralizada da Sthation. Quando uma instituicao social conclui a execucao de um projeto e submete as evidencias, o sistema sorteia 10 Checkers independentes para analisar e votar.",
  50,
  undefined,
  { width: 495 }
);

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("2.2 Quem participa");
doc.moveDown(0.5);
doc.fontSize(11).fill("#1f2937");
const vcaParticipants = [
  "Checkers: Usuarios certificados pela Sthation Academy (role: CHECKER)",
  "Precisam ter score minimo de 70 para participar",
  "Sao sorteados aleatoriamente (excluindo conflitos de interesse)",
  "Recebem remuneracao do Fundo de Validacao (2% das doacoes)",
];
vcaParticipants.forEach((p) => {
  doc.text(`  •  ${p}`, 50, undefined, { width: 495 });
  doc.moveDown(0.3);
});

doc.moveDown(0.5);
doc.fontSize(16).fill(DARK_TEAL).text("2.3 Regras do Protocolo");
doc.moveDown(0.5);

// Rules table
const rules = [
  ["Parametro", "Valor", "Descricao"],
  ["MIN_CHECKERS", "10", "Minimo de Checkers por validacao"],
  ["APPROVAL_THRESHOLD", "80%", "Consenso > 80% para aprovar"],
  ["DISPUTE_THRESHOLD", "60%", "Entre 60-80% vai para disputa"],
  ["MIN_SCORE", "70", "Score minimo do Checker"],
  ["COOLDOWN", "24h", "Tempo entre validacoes do mesmo projeto"],
  ["VOTING_DEADLINE", "48h", "Prazo para votacao"],
];

const tableStartY = doc.y;
const colWidths = [160, 80, 255];
const rowHeight = 22;

rules.forEach((row, rowIdx) => {
  const y = tableStartY + rowIdx * rowHeight;
  let x = 50;

  if (rowIdx === 0) {
    doc.rect(50, y, 495, rowHeight).fill(DARK_TEAL);
    doc.fontSize(9).fill(WHITE).font("Helvetica-Bold");
  } else {
    doc.rect(50, y, 495, rowHeight).fill(rowIdx % 2 === 0 ? "#f8fafc" : WHITE).stroke(LIGHT_GRAY);
    doc.fontSize(9).fill("#1f2937").font("Helvetica");
  }

  row.forEach((cell, colIdx) => {
    doc.text(cell, x + 5, y + 6, { width: colWidths[colIdx] - 10 });
    x += colWidths[colIdx];
  });
});

doc.y = tableStartY + rules.length * rowHeight + 15;
doc.font("Helvetica");

// ========== VCA CHECKLIST ==========
doc.moveDown(0.5);
doc.fontSize(16).fill(DARK_TEAL).text("2.4 Checklist de Validacao (6 criterios ponderados)");
doc.moveDown(0.5);

const checklist = [
  ["Criterio", "Peso", "Descricao"],
  ["Qualidade das Evidencias", "25%", "Fotos/videos claros e verificaveis"],
  ["Verificacao GPS", "20%", "Coordenadas correspondem a localizacao"],
  ["Consistencia de Timestamps", "15%", "Datas consistentes com cronograma"],
  ["Impacto Mensuravel", "20%", "Resultados quantificaveis"],
  ["Documentacao Completa", "10%", "Todos documentos presentes"],
  ["Aderencia TSB", "10%", "Segue metodologia TSB declarada"],
];

const clStartY = doc.y;
checklist.forEach((row, rowIdx) => {
  const y = clStartY + rowIdx * rowHeight;
  let x = 50;

  if (rowIdx === 0) {
    doc.rect(50, y, 495, rowHeight).fill(DARK_TEAL);
    doc.fontSize(9).fill(WHITE).font("Helvetica-Bold");
  } else {
    doc.rect(50, y, 495, rowHeight).fill(rowIdx % 2 === 0 ? "#f8fafc" : WHITE).stroke(LIGHT_GRAY);
    doc.fontSize(9).fill("#1f2937").font("Helvetica");
  }

  const clColWidths = [175, 50, 270];
  row.forEach((cell, colIdx) => {
    doc.text(cell, x + 5, y + 6, { width: clColWidths[colIdx] - 10 });
    x += clColWidths[colIdx];
  });
});

doc.y = clStartY + checklist.length * rowHeight + 15;
doc.font("Helvetica");

doc.moveDown(0.5);
doc.fontSize(11).fill("#1f2937").font("Helvetica-Bold").text("Calculo do Score Final:");
doc.font("Courier").fontSize(10).text("score_final = SUM(score_criterio * peso_criterio) / SUM(pesos)");
doc.font("Helvetica");

// ========== VCA ESTADOS ==========
doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("2.5 Estados do VCA");
doc.moveDown(0.5);

const vcaStates = [
  ["PENDING", "Aguardando inicio (checkers sendo sorteados)"],
  ["IN_PROGRESS", "Votacoes em andamento (prazo 48h)"],
  ["APPROVED", "Consenso > 80%"],
  ["REJECTED", "Consenso < 60%"],
  ["DISPUTE", "Entre 60-80% -> vai para Analise Tecnica"],
];

vcaStates.forEach((s) => {
  doc.fontSize(10).font("Courier-Bold").fill(TEAL).text(s[0], 60, undefined, { continued: true });
  doc.font("Helvetica").fill("#1f2937").text(`  ${s[1]}`);
  doc.moveDown(0.3);
});

// ========== VCA FLUXO DETALHADO ==========
doc.addPage();
doc.fontSize(16).fill(DARK_TEAL).text("2.6 Fluxo Tecnico Detalhado", 50, 70);
doc.moveDown(0.5);

const vcaFlowSteps = [
  {
    title: "1. Instituicao submete IAC para validacao",
    details: [
      "Backend verifica: minimo 3 evidencias",
      "Backend verifica: todas evidencias tem GPS, timestamp, hash",
    ],
  },
  {
    title: "2. Sistema sorteia 10 Checkers",
    details: [
      "Query: SELECT checkers WHERE score >= 70 AND id NOT IN (conflitos)",
      "Excluir: checkers da mesma cidade, mesma instituicao",
      "Ordenar aleatoriamente, pegar os 10 primeiros",
    ],
  },
  {
    title: "3. Notificar Checkers (email/push)",
    details: ["Deadline: 48h a partir da abertura"],
  },
  {
    title: "4. Cada Checker vota",
    details: [
      "Preenche checklist (6 criterios, score 0-100 cada)",
      "Voto: APPROVE / REJECT / ABSTAIN",
      "Comentario opcional",
      "Backend calcula score ponderado automaticamente",
    ],
  },
  {
    title: "5. Quando todos votam (ou prazo expira)",
    details: [
      "approval_rate = votos_approve / (approve + reject) * 100",
      "Se >= 80%: APPROVED -> segue para Inscription",
      "Se < 60%: REJECTED -> instituicao pode recorrer",
      "Se 60-80%: DISPUTE -> segue para Analise Tecnica",
    ],
  },
];

vcaFlowSteps.forEach((step) => {
  doc.fontSize(12).fill(DARK_TEAL).font("Helvetica-Bold").text(step.title, 50);
  doc.font("Helvetica").fontSize(10).fill("#374151");
  step.details.forEach((d) => {
    doc.text(`    - ${d}`, 60, undefined, { width: 475 });
  });
  doc.moveDown(0.5);
});

doc.moveDown(0.5);
doc.fontSize(16).fill(DARK_TEAL).text("2.7 Impacto no Score do Checker");
doc.moveDown(0.5);
doc.fontSize(11).fill("#1f2937");
doc.text("Apos cada validacao, o score do Checker e atualizado:");
doc.moveDown(0.3);
doc.text("  +2 pontos: voto alinhado com resultado final");
doc.text("  -1 ponto: voto desalinhado com resultado final");
doc.text("  0 pontos: abstencao");
doc.text("  Limites: minimo 0, maximo 100");

// ========== SECTION 3: ANALISE TECNICA ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("3. ANALISE TECNICA", 50, 70);
doc.fontSize(12).fill(MEDIUM_GRAY).text("Certificacao por Especialistas", 50);
doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

doc.fontSize(16).fill(DARK_TEAL).text("3.1 O que e");
doc.moveDown(0.5);
doc.fontSize(11).fill("#1f2937").text(
  "A Analise Tecnica e feita por profissionais especializados (Analistas Certificadores) que emitem parecer tecnico sobre projetos. E acionada em dois cenarios:",
  50, undefined, { width: 495 }
);
doc.moveDown(0.5);
doc.text("  1. Projetos Ambientais: Certificacao tecnica direta (sem VCA)");
doc.text("  2. Disputas VCA: Quando consenso fica entre 60-80%, o certificador desempata");

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("3.2 Quem participa");
doc.moveDown(0.5);
doc.fontSize(11).fill("#1f2937");
doc.text("  Analistas Certificadores com registro profissional (CREA, CRA, etc.)");
doc.text("  Role: ANALISTA_CERTIFICADOR");
doc.text("  Remuneracao: Fundo de Certificacao (2% das doacoes)");

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("3.3 O que o Certificador analisa");
doc.moveDown(0.5);

const techChecklist = [
  ["Aspecto", "Descricao"],
  ["Score Tecnico", "Nota de 0-100 sobre qualidade tecnica"],
  ["Metodologia Valida", "Se a metodologia TSB foi seguida corretamente"],
  ["Evidencias Validas", "Se as evidencias sao autenticas e suficientes"],
  ["Metricas Precisas", "Se os numeros de impacto sao realistas"],
  ["Comentarios VCA", "Revisao dos comentarios dos Checkers (se disputa)"],
  ["Parecer Final", "APPROVED / REJECTED / NEEDS_INFO"],
];

const techTableY = doc.y;
techChecklist.forEach((row, rowIdx) => {
  const y = techTableY + rowIdx * rowHeight;
  if (rowIdx === 0) {
    doc.rect(50, y, 495, rowHeight).fill(DARK_TEAL);
    doc.fontSize(9).fill(WHITE).font("Helvetica-Bold");
  } else {
    doc.rect(50, y, 495, rowHeight).fill(rowIdx % 2 === 0 ? "#f8fafc" : WHITE).stroke(LIGHT_GRAY);
    doc.fontSize(9).fill("#1f2937").font("Helvetica");
  }
  doc.text(row[0], 55, y + 6, { width: 150 });
  doc.text(row[1], 210, y + 6, { width: 330 });
});
doc.y = techTableY + techChecklist.length * rowHeight + 15;
doc.font("Helvetica");

doc.moveDown(0.5);
doc.fontSize(16).fill(DARK_TEAL).text("3.4 Estados da Analise");
doc.moveDown(0.5);

const techStates = [
  ["PENDING", "Na fila aguardando certificador"],
  ["IN_REVIEW", "Certificador analisando"],
  ["APPROVED", "Aprovado -> segue para Inscription"],
  ["REJECTED", "Rejeitado -> instituicao pode recorrer"],
  ["NEEDS_INFO", "Faltam documentos -> devolver para instituicao"],
];

techStates.forEach((s) => {
  doc.fontSize(10).font("Courier-Bold").fill(TEAL).text(s[0], 60, undefined, { continued: true });
  doc.font("Helvetica").fill("#1f2937").text(`  ${s[1]}`);
  doc.moveDown(0.3);
});

// ========== TECH FLOW ==========
doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("3.5 Dois Cenarios");
doc.moveDown(0.5);

doc.fontSize(12).fill(DARK_TEAL).font("Helvetica-Bold").text("Cenario 1: Projeto Ambiental (sem VCA)");
doc.font("Helvetica").fontSize(10).fill("#374151");
doc.text("  1. Empresa ambiental submete IAC com evidencias");
doc.text("  2. Sistema atribui a um Certificador especializado");
doc.text("  3. Certificador analisa evidencias, metricas e conformidade TSB");
doc.text("  4. Emite parecer: APPROVED / REJECTED / NEEDS_INFO");
doc.text("  5. Se APPROVED -> segue para Inscription");

doc.moveDown(0.5);
doc.fontSize(12).fill(DARK_TEAL).font("Helvetica-Bold").text("Cenario 2: Disputa VCA (Social)");
doc.font("Helvetica").fontSize(10).fill("#374151");
doc.text("  1. VCA termina com consenso entre 60-80% (DISPUTE)");
doc.text("  2. Sistema atribui um Certificador");
doc.text("  3. Certificador recebe evidencias + votos + comentarios dos Checkers");
doc.text("  4. Certificador faz analise de desempate");
doc.text("  5. Parecer final e definitivo (sem recurso)");

// ========== SECTION 4: INSCRIPTION ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("4. INSCRIPTION", 50, 70);
doc.fontSize(12).fill(MEDIUM_GRAY).text("Registro Blockchain (Polygon + Bitcoin Ordinals)", 50);
doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

doc.fontSize(16).fill(DARK_TEAL).text("4.1 O que e");
doc.moveDown(0.5);
doc.fontSize(11).fill("#1f2937").text(
  "Inscription e o processo de gravar permanentemente os dados de impacto validados no blockchain. Usa Polygon (rapido e barato) + Bitcoin Ordinals (imutavel e permanente). Uma vez inscrito, o registro e verificavel por qualquer pessoa.",
  50, undefined, { width: 495 }
);

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("4.2 Arquitetura: Polygon + Bitcoin");
doc.moveDown(0.5);

const inscSteps = [
  { step: "1. GERAR HASH SHA-256", desc: "Integridade dos dados - qualquer alteracao invalida o registro" },
  { step: "2. REGISTRAR NA POLYGON", desc: "Custo: R$ 0,01-0,10 | Tempo: ~2 seg | Armazena: hash, metadados" },
  { step: "3. INSCREVER NO BITCOIN", desc: "Protocolo: Ordinals | Tempo: ~10-60 min | Dados completos de impacto" },
  { step: "4. PUBLICAR NO HALL DE IMPACTO", desc: "Registro publico permanente acessivel a qualquer pessoa" },
];

inscSteps.forEach((s) => {
  doc.save();
  doc.rect(50, doc.y, 495, 35).fill("#f0fdfa").stroke(TEAL);
  doc.fontSize(10).fill(DARK_TEAL).font("Helvetica-Bold").text(s.step, 60, doc.y + 5);
  doc.font("Helvetica").fontSize(9).fill("#374151").text(s.desc, 60, doc.y + 5);
  doc.restore();
  doc.y += 40;
});

doc.moveDown(0.5);
doc.fontSize(16).fill(DARK_TEAL).text("4.3 O que e gravado na Inscription");
doc.moveDown(0.5);

doc.fontSize(11).fill("#1f2937");
const inscContent = [
  "projectId, title, type (SOCIAL/ENVIRONMENTAL), institution",
  "impactData: mealsServed, familiesHelped, beneficiaries, treeCount, areaHectares, co2Captured...",
  "validationScore, certifiedBy, certificationDate",
  "dataHash (SHA-256), evidenceHashes (SHA-256 de cada evidencia)",
];
inscContent.forEach((c) => {
  doc.text(`  ${c}`, 50, undefined, { width: 495 });
  doc.moveDown(0.3);
});

doc.moveDown(0.5);
doc.fontSize(16).fill(DARK_TEAL).text("4.4 Geracao do Hash SHA-256");
doc.moveDown(0.5);

doc.save();
doc.rect(50, doc.y, 495, 80).fill(CODE_BG).stroke(LIGHT_GRAY);
doc.fontSize(8).fill("#374151").font("Courier");
const codeY = doc.y + 8;
doc.text("async function createSHA256Hash(data: string): Promise<string> {", 60, codeY);
doc.text("  const encoder = new TextEncoder()", 60);
doc.text("  const dataBuffer = encoder.encode(data)", 60);
doc.text('  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer)', 60);
doc.text("  const hashArray = Array.from(new Uint8Array(hashBuffer))", 60);
doc.text('  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")', 60);
doc.text("}", 60);
doc.restore();
doc.font("Helvetica");
doc.y = codeY + 90;

doc.moveDown(0.5);
doc.fontSize(16).fill(DARK_TEAL).text("4.5 Verificacao Publica");
doc.moveDown(0.5);
doc.fontSize(11).fill("#1f2937");
doc.text("Qualquer pessoa pode verificar uma inscription:");
doc.moveDown(0.3);
doc.text("  1. Via Polygonscan: https://polygonscan.com/tx/{txHash}");
doc.text("  2. Via Ordinals: https://ordinals.com/inscription/{inscriptionId}");
doc.text("  3. Via Hash: Recalcular SHA-256 dos dados e comparar com o hash registrado");

// ========== SECTION 5: SPLIT DE PAGAMENTO ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("5. SPLIT DE PAGAMENTO", 50, 70);
doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

doc.fontSize(16).fill(DARK_TEAL).text("5.1 Como o dinheiro e distribuido");
doc.moveDown(0.5);

// Visual split
const splitData = [
  { label: "Instituicao de Impacto", pct: "80%", color: TEAL },
  { label: "Checkers (Fundo VCA)", pct: "2%", color: "#06b6d4" },
  { label: "Certificadores", pct: "2%", color: "#0891b2" },
  { label: "Fundo de Gas (blockchain)", pct: "4%", color: "#0e7490" },
  { label: "STHATION (plataforma)", pct: "12%", color: DARK_TEAL },
];

const barY = doc.y;
const barWidth = 495;
const barHeight = 35;
let barX = 50;
const pcts = [0.8, 0.02, 0.02, 0.04, 0.12];

pcts.forEach((pct, i) => {
  const w = barWidth * pct;
  doc.rect(barX, barY, w, barHeight).fill(splitData[i].color);
  if (w > 30) {
    doc.fontSize(7).fill(WHITE).text(splitData[i].pct, barX + 3, barY + 12, { width: w - 6 });
  }
  barX += w;
});

doc.y = barY + barHeight + 10;

splitData.forEach((s) => {
  doc.rect(50, doc.y, 10, 10).fill(s.color);
  doc.fontSize(10).fill("#1f2937").text(`${s.label} - ${s.pct}`, 68, doc.y);
  doc.moveDown(0.5);
});

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("5.2 Tabela de Exemplos");
doc.moveDown(0.5);

const splitTable = [
  ["Doacao", "Inst. (80%)", "Checkers (2%)", "Certif. (2%)", "Gas (4%)", "Sthation (12%)"],
  ["R$ 100", "R$ 80", "R$ 2", "R$ 2", "R$ 4", "R$ 12"],
  ["R$ 500", "R$ 400", "R$ 10", "R$ 10", "R$ 20", "R$ 60"],
  ["R$ 1.000", "R$ 800", "R$ 20", "R$ 20", "R$ 40", "R$ 120"],
  ["R$ 5.000", "R$ 4.000", "R$ 100", "R$ 100", "R$ 200", "R$ 600"],
  ["R$ 10.000", "R$ 8.000", "R$ 200", "R$ 200", "R$ 400", "R$ 1.200"],
];

const splitTableY = doc.y;
const splitColWidths = [80, 85, 85, 85, 80, 80];

splitTable.forEach((row, rowIdx) => {
  const y = splitTableY + rowIdx * rowHeight;
  let x = 50;
  if (rowIdx === 0) {
    doc.rect(50, y, 495, rowHeight).fill(DARK_TEAL);
    doc.fontSize(8).fill(WHITE).font("Helvetica-Bold");
  } else {
    doc.rect(50, y, 495, rowHeight).fill(rowIdx % 2 === 0 ? "#f8fafc" : WHITE).stroke(LIGHT_GRAY);
    doc.fontSize(8).fill("#1f2937").font("Helvetica");
  }
  row.forEach((cell, colIdx) => {
    doc.text(cell, x + 3, y + 6, { width: splitColWidths[colIdx] - 6 });
    x += splitColWidths[colIdx];
  });
});
doc.y = splitTableY + splitTable.length * rowHeight + 15;
doc.font("Helvetica");

// ========== SECTION 6: DATABASE ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("6. BANCO DE DADOS", 50, 70);
doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

doc.fontSize(11).fill("#1f2937").text("Tabelas necessarias para os 3 modulos:");
doc.moveDown(0.5);

const tables = [
  {
    name: "vca_sessions",
    cols: [
      "id UUID PK", "iac_id UUID FK", "status VARCHAR(20)", "assigned_checkers UUID[]",
      "excluded_checkers UUID[]", "approval_rate DECIMAL(5,2)", "average_score DECIMAL(5,2)",
      "started_at TIMESTAMP", "deadline TIMESTAMP", "completed_at TIMESTAMP",
      "requires_technical_review BOOLEAN", "technical_reviewer_id UUID FK",
    ],
  },
  {
    name: "vca_votes",
    cols: [
      "id UUID PK", "vca_session_id UUID FK", "checker_id UUID FK", "vote VARCHAR(10)",
      "checklist_scores JSONB", "overall_score DECIMAL(5,2)", "comments TEXT",
      "voted_at TIMESTAMP", "UNIQUE(vca_session_id, checker_id)",
    ],
  },
  {
    name: "technical_reviews",
    cols: [
      "id UUID PK", "project_id UUID", "project_type VARCHAR(10)",
      "certifier_id UUID FK", "certifier_registration VARCHAR(50)",
      "vca_session_id UUID FK (nullable)", "technical_score DECIMAL(5,2)",
      "methodology_valid BOOLEAN", "evidences_valid BOOLEAN", "metrics_accurate BOOLEAN",
      "comments TEXT", "decision VARCHAR(15)", "status VARCHAR(15)",
    ],
  },
  {
    name: "inscriptions",
    cols: [
      "id UUID PK", "project_id UUID", "project_title VARCHAR(255)",
      "data_hash VARCHAR(66)", "evidence_hashes TEXT[]",
      "polygon_tx_hash VARCHAR(66)", "polygon_block_number BIGINT",
      "inscription_id VARCHAR(100)", "bitcoin_tx_id VARCHAR(66)",
      "bitcoin_block_height BIGINT", "inscription_content JSONB",
      "validation_score DECIMAL(5,2)", "certified_by VARCHAR(255)",
      "status VARCHAR(15)",
    ],
  },
  {
    name: "payment_splits",
    cols: [
      "id UUID PK", "donation_id UUID FK", "total_amount DECIMAL(12,2)",
      "institution_amount DECIMAL(12,2) (80%)", "checkers_amount DECIMAL(12,2) (2%)",
      "certifiers_amount DECIMAL(12,2) (2%)", "gas_amount DECIMAL(12,2) (4%)",
      "sthation_amount DECIMAL(12,2) (12%)",
    ],
  },
];

tables.forEach((table) => {
  if (doc.y > 650) doc.addPage();
  doc.fontSize(13).fill(DARK_TEAL).font("Helvetica-Bold").text(table.name, 50);
  doc.font("Helvetica");
  doc.moveDown(0.3);
  table.cols.forEach((col) => {
    doc.fontSize(9).fill("#374151").font("Courier").text(`  ${col}`, 60, undefined, { width: 475 });
  });
  doc.font("Helvetica");
  doc.moveDown(0.8);
});

// ========== SECTION 7: ENDPOINTS ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("7. ENDPOINTS DA API", 50, 70);
doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

doc.fontSize(16).fill(DARK_TEAL).text("7.1 VCA");
doc.moveDown(0.5);

const vcaEndpoints = [
  ["POST", "/api/vca/sessions", "Criar sessao VCA"],
  ["GET", "/api/vca/sessions", "Listar sessoes (filtros: status, checkerId)"],
  ["GET", "/api/vca/sessions/:id", "Detalhes de uma sessao"],
  ["GET", "/api/vca/sessions/:id/evidences", "Listar evidencias do IAC"],
  ["POST", "/api/vca/sessions/:id/vote", "Registrar voto de um checker"],
  ["GET", "/api/vca/my-pending", "Validacoes pendentes do checker logado"],
  ["GET", "/api/vca/my-history", "Historico de validacoes"],
];

vcaEndpoints.forEach((ep) => {
  doc.fontSize(9).font("Courier-Bold").fill(ep[0] === "POST" ? "#059669" : "#2563eb").text(ep[0], 55, undefined, { continued: true });
  doc.font("Courier").fill("#1f2937").text(` ${ep[1]}`, { continued: true });
  doc.font("Helvetica").fill(MEDIUM_GRAY).text(`  ${ep[2]}`);
  doc.moveDown(0.2);
});

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("7.2 Analise Tecnica");
doc.moveDown(0.5);

const techEndpoints = [
  ["GET", "/api/technical-reviews", "Listar projetos para analise"],
  ["GET", "/api/technical-reviews/:id", "Detalhes de um projeto"],
  ["POST", "/api/technical-reviews/:id/start", "Iniciar analise"],
  ["POST", "/api/technical-reviews/:id/submit", "Submeter parecer"],
];

techEndpoints.forEach((ep) => {
  doc.fontSize(9).font("Courier-Bold").fill(ep[0] === "POST" ? "#059669" : "#2563eb").text(ep[0], 55, undefined, { continued: true });
  doc.font("Courier").fill("#1f2937").text(` ${ep[1]}`, { continued: true });
  doc.font("Helvetica").fill(MEDIUM_GRAY).text(`  ${ep[2]}`);
  doc.moveDown(0.2);
});

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("7.3 Inscriptions");
doc.moveDown(0.5);

const inscEndpoints = [
  ["GET", "/api/inscriptions/pending", "Projetos aguardando inscription"],
  ["GET", "/api/inscriptions/completed", "Inscriptions realizadas"],
  ["POST", "/api/inscriptions/:projectId/start", "Iniciar inscription"],
  ["GET", "/api/inscriptions/:id/status", "Status da inscription"],
  ["GET", "/api/inscriptions/:id/verify", "Verificar integridade (recalcula hash)"],
];

inscEndpoints.forEach((ep) => {
  doc.fontSize(9).font("Courier-Bold").fill(ep[0] === "POST" ? "#059669" : "#2563eb").text(ep[0], 55, undefined, { continued: true });
  doc.font("Courier").fill("#1f2937").text(` ${ep[1]}`, { continued: true });
  doc.font("Helvetica").fill(MEDIUM_GRAY).text(`  ${ep[2]}`);
  doc.moveDown(0.2);
});

// ========== SECTION 8: REGRAS ==========
doc.addPage();

doc.fontSize(24).fill(DARK_TEAL).text("8. REGRAS DE NEGOCIO CRITICAS", 50, 70);
doc.moveDown(0.5);
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke(TEAL);
doc.moveDown(1);

doc.fontSize(16).fill(DARK_TEAL).text("8.1 Validacoes Obrigatorias");
doc.moveDown(0.5);

const businessRules = [
  "IAC so pode ser submetido com minimo 3 evidencias (cada com GPS, timestamp, hash)",
  "Checker nao pode votar em projeto da propria cidade ou instituicao",
  "Checker precisa score >= 70 para participar de VCA",
  "Prazo de 48h para votacao VCA (apos isso, calcula com votos recebidos)",
  "Inscription so pode ser feita por ADMIN",
  "Hash SHA-256 deve ser recalculavel (dados deterministicos)",
  "Split de pagamento e automatico e imediato na confirmacao da doacao",
];

businessRules.forEach((r, i) => {
  doc.fontSize(11).fill("#1f2937").text(`${i + 1}. ${r}`, 55, undefined, { width: 490 });
  doc.moveDown(0.3);
});

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("8.2 Permissoes por Role");
doc.moveDown(0.5);

const permHeaders = ["Acao", "Doador", "Inst.", "Amb.", "Checker", "Certif.", "Admin"];
const permRows = [
  ["Doar", "Sim", "Nao", "Nao", "Sim", "Nao", "Sim"],
  ["Criar IAC", "Nao", "Sim", "Sim", "Nao", "Nao", "Sim"],
  ["Votar VCA", "Nao", "Nao", "Nao", "Sim", "Nao", "Sim"],
  ["Analise Tec.", "Nao", "Nao", "Nao", "Nao", "Sim", "Sim"],
  ["Inscription", "Nao", "Nao", "Nao", "Nao", "Nao", "Sim"],
  ["Gerenciar Users", "Nao", "Nao", "Nao", "Nao", "Nao", "Sim"],
];

const permTableY = doc.y;
const permColWidths = [90, 60, 55, 55, 65, 60, 60];
const allPermRows = [permHeaders, ...permRows];

allPermRows.forEach((row, rowIdx) => {
  const y = permTableY + rowIdx * rowHeight;
  let x = 50;
  if (rowIdx === 0) {
    doc.rect(50, y, 445, rowHeight).fill(DARK_TEAL);
    doc.fontSize(8).fill(WHITE).font("Helvetica-Bold");
  } else {
    doc.rect(50, y, 445, rowHeight).fill(rowIdx % 2 === 0 ? "#f8fafc" : WHITE).stroke(LIGHT_GRAY);
    doc.fontSize(8).fill("#1f2937").font("Helvetica");
  }
  row.forEach((cell, colIdx) => {
    const cellColor = cell === "Sim" ? "#059669" : cell === "Nao" ? "#dc2626" : rowIdx === 0 ? WHITE : "#1f2937";
    doc.fill(cellColor).text(cell, x + 3, y + 6, { width: permColWidths[colIdx] - 6 });
    x += permColWidths[colIdx];
  });
});
doc.y = permTableY + allPermRows.length * rowHeight + 15;
doc.font("Helvetica");

doc.moveDown(1);
doc.fontSize(16).fill(DARK_TEAL).text("8.3 Estados do IAC (Impact Action Card)");
doc.moveDown(0.5);

doc.save();
doc.rect(50, doc.y, 495, 25).fill(CODE_BG).stroke(LIGHT_GRAY);
doc.fontSize(10).fill("#374151").font("Courier");
doc.text("DRAFT -> EXECUTING -> SUBMITTED -> VALIDATED -> MINTED", 60, doc.y + 7);
doc.restore();
doc.font("Helvetica");
doc.y += 35;

const iacStates = [
  ["DRAFT", "Pode editar livremente"],
  ["EXECUTING", "Coletando evidencias"],
  ["SUBMITTED", "Bloqueado, em validacao VCA ou Analise Tecnica"],
  ["VALIDATED", "Aprovado, pronto para Inscription"],
  ["REJECTED", "Reprovado (pode recorrer)"],
  ["MINTED", "Inscrito no Bitcoin, transformado em NOBIS"],
];

iacStates.forEach((s) => {
  doc.fontSize(10).font("Courier-Bold").fill(TEAL).text(s[0], 60, undefined, { continued: true });
  doc.font("Helvetica").fill("#1f2937").text(`  ${s[1]}`);
  doc.moveDown(0.3);
});

// ========== FINAL PAGE ==========
doc.addPage();
doc.rect(0, 0, doc.page.width, doc.page.height).fill(DARK_TEAL);

doc.fontSize(28).fill(WHITE).text("RESUMO", 50, 150, { align: "center" });
doc.fontSize(14).fill(TEAL).text("Prioridade de Implementacao", { align: "center" });
doc.moveDown(2);

const priorities = [
  "1. Banco de Dados: Criar tabelas (vca_sessions, vca_votes, technical_reviews, inscriptions, payment_splits)",
  "2. VCA: Sorteio de checkers, sistema de votacao, calculo de consenso",
  "3. Analise Tecnica: Fila de projetos, formulario de parecer, logica de decisao",
  "4. Inscription: Hash SHA-256, integracao Polygon (ethers.js), Bitcoin Ordinals",
  "5. Split: Calculo automatico na confirmacao de doacao",
  "6. Notificacoes: Email/push para checkers e instituicoes",
];

doc.fontSize(12).fill("#e2e8f0");
priorities.forEach((p) => {
  doc.text(p, 70, undefined, { width: 455 });
  doc.moveDown(0.5);
});

doc.moveDown(2);
doc.fontSize(14).fill(TEAL).text("Bibliotecas Recomendadas", { align: "center" });
doc.moveDown(1);
doc.fontSize(11).fill("#94a3b8");
doc.text("ethers.js ou viem (Polygon)  |  bitcoinjs-lib (Bitcoin Ordinals)", { align: "center" });
doc.text("bcrypt (senhas)  |  jsonwebtoken (JWT)  |  node-cron (jobs agendados)", { align: "center" });

doc.moveDown(4);
doc.fontSize(10).fill(TEAL).text("STHATION - Transparencia Total. Impacto Real. Blockchain.", { align: "center" });

// Finalize
doc.end();

output.on("finish", () => {
  console.log("PDF generated at /public/STHATION_MODULOS_TECNICOS.pdf");
});
