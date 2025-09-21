#!/bin/bash

echo "🔍 Vérification du build de production..."
echo ""

# Vérifier que le dossier dist existe
if [ ! -d "dist/" ]; then
  echo "❌ Dossier dist/ non trouvé. Lancez 'npm run build:prod' d'abord"
  exit 1
fi

# Vérifier que le dossier de l'application existe
if [ ! -d "dist/instat-backoffice/" ]; then
  echo "❌ Dossier dist/instat-backoffice/ non trouvé"
  exit 1
fi

echo "📁 Structure du build:"
ls -la dist/instat-backoffice/

echo ""
echo "🔍 Vérification des URLs..."

# Compter les occurrences d'URLs de développement
DEV_URLS=$(grep -r "localhost:8000" dist/ 2>/dev/null | wc -l)
DEV_URLS_HTTP=$(grep -r "http://localhost" dist/ 2>/dev/null | wc -l)

# Compter les occurrences d'URLs de production
PROD_URLS=$(grep -r "api.instat-survey-platform.com" dist/ 2>/dev/null | wc -l)

echo "📊 Résultats:"
echo "   URLs de dev (localhost:8000): $DEV_URLS"
echo "   URLs de dev (http://localhost): $DEV_URLS_HTTP"
echo "   URLs de prod (api.instat-survey-platform.com): $PROD_URLS"

# Vérifications
ERRORS=0

if [ $DEV_URLS -gt 0 ] || [ $DEV_URLS_HTTP -gt 0 ]; then
  echo "❌ ERREUR: Des URLs de développement ont été trouvées dans le build!"
  echo "   Ceci indique que le build n'utilise pas environment.prod.ts"
  echo "   Utilisez: ng build --configuration=production"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ Aucune URL de développement trouvée"
fi

if [ $PROD_URLS -eq 0 ]; then
  echo "⚠️  ATTENTION: Aucune URL de production trouvée"
  echo "   Vérifiez que environment.prod.ts contient les bonnes URLs"
else
  echo "✅ URLs de production trouvées"
fi

# Vérifier la taille des fichiers
echo ""
echo "📏 Taille des fichiers principaux:"
find dist/instat-backoffice/ -name "*.js" -exec ls -lh {} \; | head -5

# Vérifier l'optimisation
if [ -f "dist/instat-backoffice/main.js" ]; then
  MAIN_SIZE=$(stat -f%z "dist/instat-backoffice/main.js" 2>/dev/null || stat -c%s "dist/instat-backoffice/main.js" 2>/dev/null)
  if [ $MAIN_SIZE -gt 1000000 ]; then  # > 1MB
    echo "⚠️  main.js est volumineux ($MAIN_SIZE bytes). Considérez l'optimisation AOT"
  else
    echo "✅ Taille de main.js optimisée"
  fi
fi

echo ""

if [ $ERRORS -eq 0 ]; then
  echo "✅ Build de production validé!"
  echo ""
  echo "🚀 Prêt pour le déploiement:"
  echo "   - Uploadez le contenu de dist/instat-backoffice/ vers votre serveur"
  echo "   - Configurez votre serveur web pour servir index.html pour toutes les routes"
  echo "   - Activez la compression gzip si possible"
else
  echo "❌ Problèmes détectés dans le build ($ERRORS erreur(s))"
  echo ""
  echo "🔧 Actions recommandées:"
  echo "   1. Supprimez dist/ et rebuild: rm -rf dist/ && npm run build:prod"
  echo "   2. Vérifiez environment.prod.ts: npm run check:environment"
  echo "   3. Videz le cache: rm -rf node_modules/.cache/"
  exit 1
fi