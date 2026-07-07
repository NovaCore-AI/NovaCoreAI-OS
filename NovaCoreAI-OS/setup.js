#!/usr/bin/env node
'use strict';

/**
 * setup.js — zentrale Setup-Logik von NovaCoreAI-OS.
 *
 * Zwei Schritte:
 * 1. Staging-Deploy: Core-Skills, Skills aktivierter Module, Hooks und
 *    Plugin-Manifeste werden in ein Zielverzeichnis kopiert und in einem
 *    Deploy-Manifest geführt (für sauberes Update/Aufräumen, später Kimi).
 * 2. Registrierung: Das Plugin wird über den lokalen Marketplace bei
 *    Claude Code registriert (`claude plugin marketplace add` + `install`) —
 *    erst dadurch lädt Claude Code Skills und Hooks tatsächlich.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DEFAULT_TARGET_DIR = path.join(os.homedir(), '.nc-os', 'plugin');
const DEFAULT_MANIFEST_PATH = path.join(os.homedir(), '.nc-os', 'installed-manifest.json');
const PLUGIN_NAME = 'novacoreai-os';

function compareSemver(a, b) {
  const parse = (value) => String(value).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const [aMajor, aMinor, aPatch] = parse(a);
  const [bMajor, bMinor, bPatch] = parse(b);
  if (aMajor !== bMajor) return aMajor - bMajor;
  if (aMinor !== bMinor) return aMinor - bMinor;
  return aPatch - bPatch;
}

function readCoreVersion(repoRoot) {
  return fs.readFileSync(path.join(repoRoot, 'VERSION'), 'utf8').trim();
}

function readRegistry(repoRoot) {
  const registryPath = path.join(repoRoot, 'modules', 'module-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  if (!Array.isArray(registry.modules)) {
    throw new Error(`Ungültige Registry: "modules" fehlt in ${registryPath}`);
  }
  return registry;
}

function listSkillDirs(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) {
    return [];
  }
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(skillsRoot, name, 'SKILL.md')));
}

function skillEntry(skillsRoot, skill) {
  return {
    source: path.join(skillsRoot, skill, 'SKILL.md'),
    relative: path.join('skills', skill, 'SKILL.md'),
  };
}

function collectCoreSkillEntries(repoRoot) {
  const skillsRoot = path.join(repoRoot, 'skills');
  return listSkillDirs(skillsRoot).map((skill) => skillEntry(skillsRoot, skill));
}

function collectModuleSkillEntries({ repoRoot, registry, coreVersion }) {
  return registry.modules.reduce(
    (result, module) => {
      if (!module.enabled) {
        return result;
      }
      if (module.minCoreVersion && compareSemver(coreVersion, module.minCoreVersion) < 0) {
        return {
          ...result,
          warnings: [
            ...result.warnings,
            `Modul "${module.name}" übersprungen: benötigt Core ${module.minCoreVersion}, installiert ist ${coreVersion}.`,
          ],
        };
      }
      const skillsRoot = path.join(repoRoot, 'modules', module.name, 'skills');
      const skills = listSkillDirs(skillsRoot);
      if (skills.length === 0) {
        return {
          ...result,
          warnings: [
            ...result.warnings,
            `Modul "${module.name}" ist aktiviert, enthält aber keine Skills.`,
          ],
        };
      }
      return {
        ...result,
        entries: [...result.entries, ...skills.map((skill) => skillEntry(skillsRoot, skill))],
      };
    },
    { entries: [], warnings: [] }
  );
}

function collectHookEntries(repoRoot) {
  const hooksRoot = path.join(repoRoot, 'hooks');
  if (!fs.existsSync(hooksRoot)) {
    return [];
  }
  return fs
    .readdirSync(hooksRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      source: path.join(hooksRoot, entry.name),
      relative: path.join('hooks', entry.name),
    }));
}

function collectStaticEntries(repoRoot) {
  return [
    {
      source: path.join(repoRoot, '.claude-plugin', 'plugin.json'),
      relative: path.join('.claude-plugin', 'plugin.json'),
    },
    {
      source: path.join(repoRoot, '.claude-plugin', 'marketplace.json'),
      relative: path.join('.claude-plugin', 'marketplace.json'),
    },
    { source: path.join(repoRoot, 'VERSION'), relative: 'VERSION' },
  ];
}

// Kollisionen (z.B. gleichnamiger Core- und Modul-Skill) gewinnen nicht
// still: der zuerst gesammelte Eintrag bleibt, der Rest wird mit Warnung
// verworfen.
function dedupeEntries(entries) {
  return entries.reduce(
    (result, entry) => {
      const existing = result.entries.find((known) => known.relative === entry.relative);
      if (!existing) {
        return { ...result, entries: [...result.entries, entry] };
      }
      return {
        ...result,
        warnings: [
          ...result.warnings,
          `Namenskollision: "${entry.relative}" aus ${entry.source} wird ignoriert (bereits belegt durch ${existing.source}).`,
        ],
      };
    },
    { entries: [], warnings: [] }
  );
}

function readOldManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return { manifest: null, warning: null };
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!Array.isArray(manifest.files)) {
      return {
        manifest: null,
        warning: `Deploy-Manifest ohne "files"-Liste wird ignoriert: ${manifestPath}`,
      };
    }
    return { manifest, warning: null };
  } catch (error) {
    return {
      manifest: null,
      warning: `Deploy-Manifest unlesbar (${error.message}) — verwaiste Dateien aus früheren Installationen können nicht entfernt werden: ${manifestPath}`,
    };
  }
}

function removeStaleFiles({ oldManifest, deployedRelatives, targetDir }) {
  if (!oldManifest) {
    return [];
  }
  const keep = new Set(deployedRelatives);
  const removed = [];
  for (const relative of oldManifest.files) {
    if (keep.has(relative)) {
      continue;
    }
    const stalePath = path.join(targetDir, relative);
    if (!stalePath.startsWith(targetDir + path.sep)) {
      continue;
    }
    if (fs.existsSync(stalePath)) {
      fs.rmSync(stalePath);
      removed.push(relative);
      const parent = path.dirname(stalePath);
      if (fs.existsSync(parent) && fs.readdirSync(parent).length === 0) {
        fs.rmdirSync(parent);
      }
    }
  }
  return removed;
}

function deployEntries({ entries, targetDir }) {
  return entries.reduce(
    (result, entry) => {
      if (!fs.existsSync(entry.source)) {
        return {
          ...result,
          warnings: [...result.warnings, `Quelle fehlt und wurde übersprungen: ${entry.source}`],
        };
      }
      const destination = path.join(targetDir, entry.relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(entry.source, destination);
      return { ...result, deployed: [...result.deployed, entry.relative] };
    },
    { deployed: [], warnings: [] }
  );
}

function runSetup(options = {}) {
  const repoRoot = options.repoRoot || __dirname;
  const targetDir = path.resolve(options.targetDir || DEFAULT_TARGET_DIR);
  const manifestPath = options.manifestPath || DEFAULT_MANIFEST_PATH;

  const coreVersion = readCoreVersion(repoRoot);
  const registry = options.registry || readRegistry(repoRoot);

  const moduleResult = collectModuleSkillEntries({ repoRoot, registry, coreVersion });
  const dedupeResult = dedupeEntries([
    ...collectCoreSkillEntries(repoRoot),
    ...moduleResult.entries,
    ...collectHookEntries(repoRoot),
    ...collectStaticEntries(repoRoot),
  ]);
  const deployResult = deployEntries({ entries: dedupeResult.entries, targetDir });

  const oldManifestResult = readOldManifest(manifestPath);
  const removed = removeStaleFiles({
    oldManifest: oldManifestResult.manifest,
    deployedRelatives: deployResult.deployed,
    targetDir,
  });

  const warnings = [
    ...moduleResult.warnings,
    ...dedupeResult.warnings,
    ...deployResult.warnings,
    ...(oldManifestResult.warning ? [oldManifestResult.warning] : []),
  ];

  const manifest = {
    version: coreVersion,
    installedAt: new Date().toISOString(),
    targetDir,
    files: deployResult.deployed,
  };
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return {
    deployed: deployResult.deployed,
    removed,
    warnings,
    targetDir,
    manifestPath,
    version: coreVersion,
  };
}

function defaultExec(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' });
}

// Registriert das Plugin bei Claude Code über den lokalen Marketplace.
// Ohne diesen Schritt lädt Claude Code weder Skills noch Hooks — die reine
// Dateikopie (Staging) reicht nicht.
function registerWithClaude({ repoRoot = __dirname, exec = defaultExec } = {}) {
  const marketplacePath = path.join(repoRoot, '.claude-plugin', 'marketplace.json');
  const marketplaceName = JSON.parse(fs.readFileSync(marketplacePath, 'utf8')).name;
  const manualHint =
    'Bitte manuell registrieren:\n' +
    `  claude plugin marketplace add ${repoRoot}\n` +
    `  claude plugin install ${PLUGIN_NAME}@${marketplaceName}`;

  const added = exec('claude', ['plugin', 'marketplace', 'add', repoRoot]);
  const addFailed =
    added.error || (added.status !== 0 && !/already|bereits/i.test(added.stderr || ''));
  if (addFailed) {
    return {
      registered: false,
      warning: `Claude-Registrierung fehlgeschlagen (marketplace add): ${
        (added.error && added.error.message) || (added.stderr || '').trim() || `Exit ${added.status}`
      }. ${manualHint}`,
    };
  }

  const installed = exec('claude', ['plugin', 'install', `${PLUGIN_NAME}@${marketplaceName}`]);
  if (installed.error || installed.status !== 0) {
    return {
      registered: false,
      warning: `Claude-Registrierung fehlgeschlagen (plugin install): ${
        (installed.error && installed.error.message) ||
        (installed.stderr || '').trim() ||
        `Exit ${installed.status}`
      }. ${manualHint}`,
    };
  }

  return { registered: true, warning: null };
}

function main() {
  try {
    const result = runSetup();
    console.log(`NovaCoreAI-OS v${result.version} — Staging nach ${result.targetDir}`);
    console.log(`Deployte Dateien: ${result.deployed.length}`);
    if (result.removed.length > 0) {
      console.log(`Entfernte verwaiste Dateien: ${result.removed.join(', ')}`);
    }
    for (const warning of result.warnings) {
      console.warn(`WARNUNG: ${warning}`);
    }
    console.log(`Deploy-Manifest: ${result.manifestPath}`);

    const registration = registerWithClaude();
    if (registration.registered) {
      console.log('Plugin bei Claude Code registriert (Marketplace-Install).');
    } else {
      console.warn(`WARNUNG: ${registration.warning}`);
    }
  } catch (error) {
    console.error(`Setup fehlgeschlagen: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runSetup, registerWithClaude, readCoreVersion, compareSemver };
