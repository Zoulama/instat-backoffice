# Guide de Déploiement - INSTAT Backoffice

## 🚨 Résolution du problème "Services pointent sur DEV"

### ✅ État actuel vérifié
- Tous les services utilisent correctement `environment.apiUrl`
- Aucune URL en dur détectée dans les services
- Configuration d'environnement correcte

### 🔍 Causes possibles du problème

1. **Build de production incorrect**
   - Le build n'utilise pas `--configuration=production`
   - Angular utilise `environment.ts` au lieu de `environment.prod.ts`

2. **Fichier de production incorrect**
   - `environment.prod.ts` contient une mauvaise URL
   - Variables d'environnement non appliquées

3. **Cache du navigateur**
   - L'ancienne version est mise en cache
   - Service worker conserve l'ancienne configuration

## 🛠️ Solutions

### 1. Build de production correct
```bash
# ❌ INCORRECT - Utilise environment.ts (dev)
ng build

# ✅ CORRECT - Utilise environment.prod.ts
ng build --configuration=production
# ou
ng build --prod
```

### 2. Vérifier la configuration de production
```bash
# Vérifier le contenu de environment.prod.ts
cat src/environments/environment.prod.ts | grep apiUrl
```

### 3. Script de build sécurisé
```bash
#!/bin/bash
echo "🚀 Build de production INSTAT Backoffice"

# Nettoyer le cache
rm -rf dist/
rm -rf node_modules/.cache/

# Vérifier la configuration
node scripts/check-environment.js

# Build avec la configuration de production
ng build --configuration=production --aot --build-optimizer

echo "✅ Build terminé - Vérifiez les fichiers dans dist/"
```

### 4. Vérification post-build
```bash
# Vérifier que les bons fichiers sont générés
ls -la dist/instat-backoffice/

# Vérifier le contenu des fichiers JavaScript (recherche d'URLs)
grep -r "localhost:8000" dist/ && echo "❌ PROBLÈME: URLs de dev trouvées" || echo "✅ OK: Pas d'URLs de dev"
grep -r "api.instat-survey-platform.com" dist/ && echo "✅ OK: URLs de prod trouvées" || echo "❌ PROBLÈME: URLs de prod manquantes"
```

## 🔧 Configuration recommandée

### environment.prod.ts
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.instat-survey-platform.com', // URL de production
  appBaseUrl: 'https://instat-backoffice.com',
  enableMockData: false, // IMPORTANT: Désactiver les mocks
  enableDevTools: false,
  enableConsoleLogs: false
};
```

### angular.json (vérifier la configuration)
```json
{
  "configurations": {
    "production": {
      "fileReplacements": [
        {
          "replace": "src/environments/environment.ts",
          "with": "src/environments/environment.prod.ts"
        }
      ]
    }
  }
}
```

## 🚦 Processus de déploiement

### 1. Pré-déploiement
```bash
# Vérifier l'environnement
npm run check:environment

# Tests
npm run test
npm run e2e
```

### 2. Build
```bash
# Build de production
npm run build:prod

# ou directement
ng build --configuration=production
```

### 3. Post-déploiement
```bash
# Vérifier les URLs dans les fichiers buildés
npm run check:build

# Test en local du build de prod
npm run serve:prod
```

## 📋 Checklist de déploiement

- [ ] `ng build --configuration=production` utilisé
- [ ] `environment.prod.ts` contient la bonne `apiUrl`
- [ ] `enableMockData: false` en production
- [ ] Cache navigateur vidé
- [ ] Service worker mis à jour
- [ ] URLs vérifiées dans `dist/`
- [ ] Test de l'application en prod

## 🔍 Commandes de diagnostic

### Vérification rapide
```bash
# Vérifier la configuration actuelle
node scripts/check-environment.js

# Vérifier le build
grep -r "localhost" dist/ | wc -l  # Doit retourner 0
```

### Debug en cas de problème
1. **Vider le cache navigateur** (Ctrl+Shift+R)
2. **Désactiver le service worker** temporairement
3. **Vérifier les Network tabs** pour voir les URLs appelées
4. **Rebuild complet** avec `rm -rf dist/ && ng build --prod`

## 📞 Support

Si le problème persiste après avoir suivi ce guide :
1. Fournir le résultat de `node scripts/check-environment.js`
2. Fournir la commande de build utilisée
3. Fournir un screenshot de l'onglet Network du navigateur