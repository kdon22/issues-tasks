#!/usr/bin/env node

// Auto-generate table declarations for AppDatabase
// Run with: node scripts/generate-resource-tables.js

const path = require('path');
const fs = require('fs');

// Simple function to read and parse the resource registry
function getResourceRegistry() {
  try {
    // Read the resource registry file
    const registryPath = path.join(__dirname, '../lib/api/resource-registry.ts');
    const registryContent = fs.readFileSync(registryPath, 'utf8');
    
    // Extract resource names from the registry (simple parsing)
    const resourceMatches = registryContent.match(/(\w+):\s*\w+ResourceConfig/g);
    if (!resourceMatches) return {};
    
    const resources = {};
    resourceMatches.forEach(match => {
      const resourceName = match.split(':')[0].trim();
      resources[resourceName] = {
        tableName: resourceName,
        workspaceScoped: true // Default assumption
      };
    });
    
    return resources;
  } catch (error) {
    console.error('Error reading resource registry:', error.message);
    return {};
  }
}

function generateAppDatabaseClass() {
  const resources = getResourceRegistry();
  const resourceNames = Object.keys(resources);
  
  console.log('// Auto-generated table declarations for AppDatabase');
  console.log('// Copy these into your AppDatabase class:');
  console.log('');
  
  // Generate table declarations
  resourceNames.forEach(resourceName => {
    console.log(`  ${resourceName}!: Dexie.Table<CacheItem, string>;`);
  });
  
  console.log('');
  console.log('// System tables');
  console.log('  syncOperations!: Dexie.Table<SyncOperation, string>;');
  console.log('  conflicts!: Dexie.Table<ConflictItem, string>;');
  console.log('  workspaceCache!: Dexie.Table<WorkspaceCache, string>;');
  
  console.log('');
  console.log('// Resource Registry Summary:');
  console.log(`// Total resources: ${resourceNames.length}`);
  
  resourceNames.forEach(resourceName => {
    const config = resources[resourceName];
    console.log(`// - ${resourceName}: ${config.tableName} (${config.workspaceScoped ? 'workspace-scoped' : 'global'})`);
  });
}

function showAddResourceInstructions() {
  console.log('');
  console.log('='.repeat(60));
  console.log('HOW TO ADD A NEW RESOURCE (e.g., "reports"):');
  console.log('='.repeat(60));
  console.log('');
  console.log('1. Create lib/api/configs/reports.ts:');
  console.log('   - Define reportsResourceConfig following the ResourceConfig pattern');
  console.log('   - Include API, cache, and database configurations');
  console.log('');
  console.log('2. Update lib/api/resource-registry.ts:');
  console.log('   - Import: import { reportsResourceConfig } from "./configs/reports";');
  console.log('   - Add to registry: reports: reportsResourceConfig,');
  console.log('');
  console.log('3. Update lib/api/cache/database.ts:');
  console.log('   - Add table declaration: reports!: Dexie.Table<CacheItem, string>;');
  console.log('   - (Or run this script to generate all declarations)');
  console.log('');
  console.log('4. That\'s it! Your new resource will have:');
  console.log('   ✓ Auto-generated database table with proper indexes');
  console.log('   ✓ Configured caching with TTL and optimistic updates');
  console.log('   ✓ API endpoints using existing CRUD factory');
  console.log('   ✓ Workspace scoping and permissions');
  console.log('   ✓ Hooks integration for auto-save and real-time updates');
  console.log('');
  console.log('5. Run this script again to verify your changes:');
  console.log('   npm run generate:resources');
  console.log('');
}

function showDatabaseSchemaGeneration() {
  const resources = getResourceRegistry();
  const resourceNames = Object.keys(resources);
  
  console.log('='.repeat(60));
  console.log('AUTO-GENERATED DATABASE SCHEMA:');
  console.log('='.repeat(60));
  console.log('');
  console.log('// Copy this into your generateDatabaseSchema() function:');
  console.log('const schema = {');
  
  resourceNames.forEach(resourceName => {
    console.log(`  ${resourceName}: '&id, workspaceId, [workspaceId+timestamp], timestamp',`);
  });
  
  console.log('  // System tables');
  console.log('  syncOperations: \'&id, [resource+timestamp], priority, timestamp\',');
  console.log('  conflicts: \'&id, resource, resourceId, timestamp\',');
  console.log('  workspaceCache: \'&id, workspaceId, lastFullSync, lastDeltaSync\'');
  console.log('};');
  console.log('');
}

// Run the generator
console.log('🚀 DRY Resource System - Table Generator');
console.log('');

generateAppDatabaseClass();
showAddResourceInstructions();
showDatabaseSchemaGeneration();

console.log('✅ Generation complete! Copy the declarations above into your files.'); 