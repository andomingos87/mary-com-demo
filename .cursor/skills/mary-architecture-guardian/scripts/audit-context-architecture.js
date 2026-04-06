#!/usr/bin/env node
/**
 * audit-context-architecture.js
 *
 * Audita a consistência das 5 camadas de context engineering do projeto Mary.
 * Gera relatório em Markdown com inconsistências priorizadas.
 *
 * Uso: node .cursor/skills/mary-architecture-guardian/scripts/audit-context-architecture.js
 */

const fs = require('fs');
const path = require('path');

// Resolve project root (where AGENTS.md lives)
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const PATHS = {
  claudeMd: path.join(PROJECT_ROOT, 'CLAUDE.md'),
  agentsMd: path.join(PROJECT_ROOT, 'AGENTS.md'),
  contextDir: path.join(PROJECT_ROOT, '.context'),
  cursorDir: path.join(PROJECT_ROOT, '.cursor'),
  agentsDir: path.join(PROJECT_ROOT, '.agents'),
  modules: path.join(PROJECT_ROOT, '.context', 'modules'),
  modulesReadme: path.join(PROJECT_ROOT, '.context', 'modules', 'README.md'),
  moduleIndex: path.join(PROJECT_ROOT, '.context', 'modules', 'module-index.json'),
  contextAgents: path.join(PROJECT_ROOT, '.context', 'agents'),
  contextSkills: path.join(PROJECT_ROOT, '.context', 'skills'),
  cursorSkills: path.join(PROJECT_ROOT, '.cursor', 'skills'),
  cursorSpecialists: path.join(PROJECT_ROOT, '.cursor', 'specialists'),
  agentsSkills: path.join(PROJECT_ROOT, '.agents', 'skills'),
  governance: path.join(PROJECT_ROOT, '.context', 'AI_GOVERNANCE.md'),
};

// Skills transversais que não precisam de módulo
const TRANSVERSAL_SKILLS = new Set([
  'agents-md', 'backlog-creator', 'create-module-specialist',
  'doc-app-gap-analysis', 'epic-client-validation', 'evidence-pack-generator',
  'frontend-refactor-planner', 'mary-design', 'ux-ui-compliance-checklist',
  'vercel-deploy', 'mary-architecture-guardian'
]);

const issues = { critical: [], medium: [], low: [] };
const stats = { totalModules: 0, completeModules: 0, totalIssues: 0 };

function exists(p) { return fs.existsSync(p); }

function getDirs(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map(d => d.name);
}

function getFiles(dir, ext = '.md') {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(ext))
    .map(f => f.replace(ext, ''));
}

function getLineCount(filePath) {
  if (!exists(filePath)) return 0;
  return fs.readFileSync(filePath, 'utf-8').split('\n').length;
}

function addIssue(severity, message, fix) {
  issues[severity].push({ message, fix });
  stats.totalIssues++;
}

// ─── Check 1: Module completeness ───
function checkModuleCompleteness() {
  const modules = getDirs(PATHS.modules);
  stats.totalModules = modules.length;

  for (const mod of modules) {
    const modPath = path.join(PATHS.modules, mod);
    let complete = true;

    // .context/modules/<mod>/ files
    for (const file of ['context.md', 'agents.md', 'skills.md']) {
      if (!exists(path.join(modPath, file))) {
        addIssue('critical', `Módulo "${mod}" sem ${file} em .context/modules/${mod}/`,
          `Criar ${file} usando template de _templates/`);
        complete = false;
      }
    }

    // .cursor/skills/<mod>/SKILL.md
    const cursorSkillPath = path.join(PATHS.cursorSkills, mod, 'SKILL.md');
    if (!exists(cursorSkillPath)) {
      addIssue('critical', `Módulo "${mod}" sem SKILL.md em .cursor/skills/${mod}/`,
        `Criar .cursor/skills/${mod}/SKILL.md com skill funcional do módulo`);
      complete = false;
    }

    // .cursor/specialists/specialist-<mod>.md
    const specialistPath = path.join(PATHS.cursorSpecialists, `specialist-${mod}.md`);
    if (!exists(specialistPath)) {
      addIssue('medium', `Módulo "${mod}" sem specialist em .cursor/specialists/specialist-${mod}.md`,
        `Criar specialist seguindo padrão dos existentes`);
      complete = false;
    }

    // README.md reference
    if (exists(PATHS.modulesReadme)) {
      const readme = fs.readFileSync(PATHS.modulesReadme, 'utf-8');
      if (!readme.includes(mod)) {
        addIssue('medium', `Módulo "${mod}" não está na tabela de .context/modules/README.md`,
          `Adicionar linha na tabela com status e descrição`);
        complete = false;
      }
    }

    if (complete) stats.completeModules++;
  }
}

// ─── Check 2: Orphans and ghosts ───
function checkOrphans() {
  const modules = new Set(getDirs(PATHS.modules));

  // Orphan specialists
  if (exists(PATHS.cursorSpecialists)) {
    const specialists = getFiles(PATHS.cursorSpecialists);
    for (const s of specialists) {
      if (s === 'index') continue;
      const modName = s.replace('specialist-', '');
      if (!modules.has(modName)) {
        addIssue('low', `Specialist "${s}.md" sem módulo correspondente em .context/modules/`,
          `Verificar se o módulo foi removido ou renomeado`);
      }
    }
  }

  // Orphan cursor skills (non-transversal)
  const cursorSkills = getDirs(PATHS.cursorSkills);
  for (const skill of cursorSkills) {
    if (!modules.has(skill) && !TRANSVERSAL_SKILLS.has(skill)) {
      addIssue('low', `Skill "${skill}" em .cursor/skills/ sem módulo correspondente e não listada como transversal`,
        `Adicionar à lista de transversais ou criar módulo`);
    }
  }

  // Unreferenced agents
  if (exists(PATHS.contextAgents)) {
    const agents = getFiles(PATHS.contextAgents).filter(a => a !== 'README');
    const allAgentsMds = [];
    for (const mod of getDirs(PATHS.modules)) {
      const agentsFile = path.join(PATHS.modules, mod, 'agents.md');
      if (exists(agentsFile)) {
        allAgentsMds.push(fs.readFileSync(agentsFile, 'utf-8'));
      }
    }
    const allContent = allAgentsMds.join('\n');
    for (const agent of agents) {
      if (!allContent.includes(agent)) {
        addIssue('low', `Agent "${agent}.md" em .context/agents/ não referenciado por nenhum módulo`,
          `Verificar se o agent é usado ou pode ser removido`);
      }
    }
  }
}

// ─── Check 3: JIT Index consistency ───
function checkJITIndex() {
  if (!exists(PATHS.agentsMd)) {
    addIssue('critical', 'AGENTS.md não encontrado na raiz do projeto',
      'Criar AGENTS.md como entry point principal');
    return;
  }

  const agentsContent = fs.readFileSync(PATHS.agentsMd, 'utf-8');

  // Extract paths from JIT Index table
  const pathRegex = /\[.*?\]\((.*?AGENTS\.md)\)/g;
  let match;
  while ((match = pathRegex.exec(agentsContent)) !== null) {
    const refPath = path.join(PROJECT_ROOT, match[1]);
    if (!exists(refPath)) {
      addIssue('critical', `JIT Index referencia "${match[1]}" que não existe`,
        `Atualizar JIT Index ou criar o AGENTS.md ausente`);
    }
  }

  // Check for AGENTS.md files not in JIT Index
  const findAgentsMd = (dir, depth = 0) => {
    if (depth > 2 || !exists(dir)) return [];
    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name === 'AGENTS.md' && dir !== PROJECT_ROOT) {
        results.push(path.relative(PROJECT_ROOT, fullPath));
      }
      if (entry.isDirectory() && depth < 2) {
        results.push(...findAgentsMd(fullPath, depth + 1));
      }
    }
    return results;
  };

  const allAgentsMds = findAgentsMd(PROJECT_ROOT);
  for (const agentMdPath of allAgentsMds) {
    if (!agentsContent.includes(agentMdPath)) {
      addIssue('medium', `"${agentMdPath}" existe mas não está no JIT Index do AGENTS.md`,
        `Adicionar ao JIT Index ou remover se desnecessário`);
    }
  }
}

// ─── Check 4: Cross-references ───
function checkCrossReferences() {
  if (exists(PATHS.claudeMd)) {
    const claude = fs.readFileSync(PATHS.claudeMd, 'utf-8');
    if (!exists(PATHS.agentsMd) && claude.includes('AGENTS.md')) {
      addIssue('critical', 'CLAUDE.md referencia AGENTS.md mas arquivo não existe', 'Criar AGENTS.md');
    }
    if (!exists(PATHS.governance) && claude.includes('AI_GOVERNANCE')) {
      addIssue('critical', 'CLAUDE.md referencia AI_GOVERNANCE.md mas arquivo não existe',
        'Criar .context/AI_GOVERNANCE.md');
    }
  }

  // Check base paths from governance
  if (exists(PATHS.governance)) {
    const gov = fs.readFileSync(PATHS.governance, 'utf-8');
    const basePaths = ['.context/modules', '.context/skills', '.context/agents',
      '.cursor/skills', '.cursor/specialists', '.agents/skills'];
    for (const bp of basePaths) {
      if (gov.includes(bp) && !exists(path.join(PROJECT_ROOT, bp))) {
        addIssue('critical', `AI_GOVERNANCE.md referencia "${bp}" mas diretório não existe`,
          `Criar diretório ou atualizar governance`);
      }
    }
  }
}

// ─── Check 5: Document health ───
function checkDocHealth() {
  const checkDir = (dir, label) => {
    if (!exists(dir)) return;
    const walk = (d) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('_')) {
          walk(full);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const lines = getLineCount(full);
          if (lines < 5) {
            const rel = path.relative(PROJECT_ROOT, full);
            addIssue('low', `"${rel}" tem apenas ${lines} linhas (possível stub vazio)`,
              `Preencher conteúdo ou remover se desnecessário`);
          }
        }
      }
    };
    walk(dir);
  };

  checkDir(PATHS.contextDir, '.context');
  checkDir(PATHS.cursorDir, '.cursor');
}

// ─── Check 6: module-index.json ───
function checkModuleIndex() {
  if (!exists(PATHS.moduleIndex)) {
    addIssue('low', 'module-index.json não encontrado em .context/modules/',
      'Gerar module-index.json a partir da lista real de módulos');
    return;
  }

  try {
    const index = JSON.parse(fs.readFileSync(PATHS.moduleIndex, 'utf-8'));
    const realModules = new Set(getDirs(PATHS.modules));
    const indexModules = new Set(Object.keys(index.modules || index));

    for (const mod of realModules) {
      if (!indexModules.has(mod)) {
        addIssue('medium', `Módulo "${mod}" existe no filesystem mas não está em module-index.json`,
          `Adicionar ao module-index.json`);
      }
    }
    for (const mod of indexModules) {
      if (!realModules.has(mod)) {
        addIssue('medium', `Módulo "${mod}" está em module-index.json mas não existe no filesystem`,
          `Remover do module-index.json ou criar o módulo`);
      }
    }
  } catch (e) {
    addIssue('medium', `module-index.json tem JSON inválido: ${e.message}`,
      `Corrigir a sintaxe do arquivo`);
  }
}

// ─── Run all checks ───
console.log('Auditando arquitetura de context engineering...\n');

checkModuleCompleteness();
checkOrphans();
checkJITIndex();
checkCrossReferences();
checkDocHealth();
checkModuleIndex();

// ─── Generate report ───
const now = new Date().toISOString().split('T')[0];
let report = `# Relatório de Auditoria — Context Engineering Mary\n`;
report += `Data: ${now}\n\n`;
report += `## Resumo\n`;
report += `- Total de módulos: ${stats.totalModules}\n`;
report += `- Módulos completos (5 camadas): ${stats.completeModules}\n`;
report += `- Inconsistências encontradas: ${stats.totalIssues}\n`;
report += `  - Críticas: ${issues.critical.length}\n`;
report += `  - Médias: ${issues.medium.length}\n`;
report += `  - Baixas: ${issues.low.length}\n\n`;

const sections = [
  ['critical', 'Inconsistências Críticas (bloqueiam desenvolvimento)'],
  ['medium', 'Inconsistências Médias (podem causar confusão)'],
  ['low', 'Inconsistências Baixas (cosmético/melhoria)'],
];

for (const [key, title] of sections) {
  report += `## ${title}\n\n`;
  if (issues[key].length === 0) {
    report += `Nenhuma encontrada.\n\n`;
  } else {
    for (const issue of issues[key]) {
      report += `- **${issue.message}**\n`;
      report += `  - Fix: ${issue.fix}\n`;
    }
    report += `\n`;
  }
}

if (stats.totalIssues > 0) {
  report += `## Recomendações Priorizadas\n\n`;
  let i = 1;
  for (const issue of [...issues.critical, ...issues.medium.slice(0, 3)]) {
    report += `${i}. ${issue.fix} — (${issue.message.split('"')[1] || 'geral'})\n`;
    i++;
  }
}

console.log(report);

// Also write to file
const outputPath = path.join(PROJECT_ROOT, '.dev', 'docs', `audit-context-${now}.md`);
try {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, report, 'utf-8');
  console.log(`\n---\nRelatório salvo em: ${path.relative(PROJECT_ROOT, outputPath)}`);
} catch (e) {
  console.log(`\n---\n(Não foi possível salvar: ${e.message})`);
}
