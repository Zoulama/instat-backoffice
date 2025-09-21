#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration d\'environnement...\n');

// Chemins des fichiers d'environnement
const envDevPath = path.join(__dirname, '../src/environments/environment.ts');
const envProdPath = path.join(__dirname, '../src/environments/environment.prod.ts');

// Vérifier que les fichiers existent
if (!fs.existsSync(envDevPath)) {
  console.error('❌ Fichier environment.ts manquant');
  process.exit(1);
}

if (!fs.existsSync(envProdPath)) {
  console.error('❌ Fichier environment.prod.ts manquant');
  process.exit(1);
}

// Lire les configurations
const envDev = fs.readFileSync(envDevPath, 'utf8');
const envProd = fs.readFileSync(envProdPath, 'utf8');

// Extraire les URLs API
const apiUrlDevMatch = envDev.match(/apiUrl:\s*['"`]([^'"`]+)['"`]/);
const apiUrlProdMatch = envProd.match(/apiUrl:\s*['"`]([^'"`]+)['"`]/);

const devApiUrl = apiUrlDevMatch ? apiUrlDevMatch[1] : 'NOT_FOUND';
const prodApiUrl = apiUrlProdMatch ? apiUrlProdMatch[1] : 'NOT_FOUND';

console.log('📝 Configuration actuelle:');
console.log(`   DEV API URL:  ${devApiUrl}`);
console.log(`   PROD API URL: ${prodApiUrl}`);
console.log('');

// Vérifier les services qui utilisent l'environment
const servicesPaths = [
  '../src/app/core/services/user.service.ts',
  '../src/app/core/services/auth.service.ts',
  '../src/app/core/services/survey.service.ts',
  '../src/app/core/services/template.service.ts'
];

let allServicesOk = true;

console.log('🔍 Vérification des services:');

servicesPaths.forEach(servicePath => {
  const fullPath = path.join(__dirname, servicePath);
  const serviceName = path.basename(servicePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`   ❌ ${serviceName}: Fichier non trouvé`);
    allServicesOk = false;
    return;
  }
  
  const serviceContent = fs.readFileSync(fullPath, 'utf8');
  
  // Vérifier l'import d'environment
  const hasEnvironmentImport = serviceContent.includes('import { environment }') || 
                               serviceContent.includes("from '../../../environments/environment'");
  
  // Vérifier l'utilisation d'environment.apiUrl
  const usesEnvironmentApiUrl = serviceContent.includes('environment.apiUrl');
  
  // Vérifier les URLs en dur (hors commentaires)
  const hasHardcodedUrls = serviceContent.match(/https?:\/\/[^\s'"`;)]+/g)?.filter(url => {
    // Exclure les URLs dans les commentaires
    const lines = serviceContent.split('\n');
    for (let line of lines) {
      if (line.includes(url) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        return true;
      }
    }
    return false;
  });
  
  let status = '✅';
  let issues = [];
  
  if (!hasEnvironmentImport) {
    status = '⚠️';
    issues.push('Pas d\'import environment');
  }
  
  if (!usesEnvironmentApiUrl) {
    status = '⚠️';
    issues.push('N\'utilise pas environment.apiUrl');
  }
  
  if (hasHardcodedUrls && hasHardcodedUrls.length > 0) {
    status = '❌';
    issues.push(`URLs en dur: ${hasHardcodedUrls.join(', ')}`);
    allServicesOk = false;
  }
  
  console.log(`   ${status} ${serviceName}${issues.length > 0 ? ': ' + issues.join(', ') : ''}`);
});

console.log('');

if (allServicesOk) {
  console.log('✅ Tous les services utilisent correctement la configuration d\'environnement');
  console.log('');
  console.log('💡 Suggestions pour le déploiement:');
  console.log('   1. Vérifiez que le build utilise --configuration=production');
  console.log('   2. Vérifiez que environment.prod.ts contient la bonne URL de production');
  console.log('   3. Vérifiez les variables d\'environnement du serveur de production');
} else {
  console.log('❌ Des problèmes ont été détectés dans la configuration');
  process.exit(1);
}

console.log('');
console.log('🚀 Commandes de build recommandées:');
console.log('   ng build --configuration=production');
console.log('   ng build --prod');
console.log('');