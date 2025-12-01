#!/bin/bash

# Script de démarrage rapide - HistoRando Mobile App

echo "🚀 Démarrage de HistoRando Mobile..."
echo ""

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé"
    echo "Assurez-vous d'être dans le dossier mobile-app"
    exit 1
fi

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Nettoyer le cache et démarrer
echo "🧹 Nettoyage du cache Expo..."
npx expo start --clear

echo ""
echo "✅ Application lancée !"
echo "📱 Scannez le QR code avec Expo Go"
echo ""
echo "Commandes disponibles :"
echo "  a - Ouvrir sur Android"
echo "  i - Ouvrir sur iOS"
echo "  w - Ouvrir dans le navigateur"
echo "  r - Recharger l'app"
echo "  Ctrl+C - Arrêter le serveur"
