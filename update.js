#!/usr/bin/env node
'use strict';

/**
 * update.js — zentrale Update-Logik von NovaCoreAI-OS.
 *
 * 1. `git pull` im OS-Repo
 * 2. Setup erneut ausführen (Skills/Hooks deployen)
 * 3. Verwaiste Dateien anhand des Deploy-Manifests entfernen
 *    (übernimmt runSetup über das alte Manifest)
 */

const { spawnSync } = require('node:child_process');

const { runSetup } = require('./setup.js');

function gitPull(repoRoot) {
  const result = spawnSync('git', ['pull', '--ff-only'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (result.error) {
    throw new Error(`git pull konnte nicht gestartet werden: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `git pull fehlgeschlagen (Exit ${result.status}): ${(result.stderr || '').trim()}`
    );
  }
  return (result.stdout || '').trim();
}

function runUpdate(options = {}) {
  const repoRoot = options.repoRoot || __dirname;
  const pullOutput = options.skipPull ? 'übersprungen' : gitPull(repoRoot);
  const setupResult = runSetup({ ...options, repoRoot });
  return { ...setupResult, pullOutput };
}

function main() {
  try {
    const result = runUpdate();
    console.log(`git pull: ${result.pullOutput}`);
    console.log(`NovaCoreAI-OS v${result.version} aktualisiert (${result.targetDir})`);
    console.log(`Deployte Dateien: ${result.deployed.length}`);
    if (result.removed.length > 0) {
      console.log(`Entfernte verwaiste Dateien: ${result.removed.join(', ')}`);
    }
    for (const warning of result.warnings) {
      console.warn(`WARNUNG: ${warning}`);
    }
  } catch (error) {
    console.error(`Update fehlgeschlagen: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { runUpdate };
