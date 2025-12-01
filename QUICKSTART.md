# 🚀 Quick Start Guide - HistoRando Mobile

## Démarrage rapide (2 minutes)

### Méthode 1 : Script automatique
```bash
cd mobile-app
./start.sh
```

### Méthode 2 : Commande manuelle
```bash
cd mobile-app
npm start
```

### Méthode 3 : Avec cache nettoyé
```bash
cd mobile-app
npx expo start --clear
```

---

## 📱 Scanner le QR Code

L'application Expo affiche un QR code dans le terminal.

### Sur Android
1. Ouvrez **Expo Go**
2. Appuyez sur **Scan QR Code**
3. Scannez le code affiché dans le terminal

### Sur iOS
1. Ouvrez l'app **Appareil photo**
2. Pointez vers le QR code
3. Cliquez sur la notification Expo

---

## ✅ Premier test

1. **Écran Welcome** apparaît avec le logo
2. Cliquez sur **"Créer un compte"**
3. Remplissez le formulaire :
   - Prénom : `Test`
   - Nom : `User`
   - Username : `testuser`
   - Email : `test@example.com`
   - Password : `test1234`
   - Confirmer : `test1234`
4. Cliquez sur **"S'inscrire"**
5. ✅ Vous voyez l'écran principal avec 3 tabs !

---

## 🛠️ Commandes utiles

Dans le terminal Expo :

| Touche | Action |
|--------|--------|
| `r` | Recharger l'application |
| `a` | Ouvrir sur Android (si émulateur) |
| `w` | Ouvrir dans le navigateur |
| `j` | Ouvrir le debugger |
| `m` | Afficher le menu |
| `Ctrl+C` | Arrêter le serveur |

Sur le téléphone (secouer) :
- Reload
- Toggle Performance Monitor
- Debug Remote JS
- Show Inspector

---

## 📚 Documentation

- **README.md** : Documentation complète
- **TESTING_GUIDE.md** : Guide de test détaillé
- **PROJECT_STATUS.md** : État du projet

---

## 🔗 URLs importantes

- **Backend API** : https://histo-rando-backend-egvh3.ondigitalocean.app/api/v1
- **API Docs** : https://histo-rando-backend-egvh3.ondigitalocean.app/api/docs

---

## 🐛 Problème ?

### L'app ne se charge pas
```bash
npx expo start --clear
```

### Erreur de dépendances
```bash
rm -rf node_modules
npm install
```

### Cannot connect to Metro
Vérifiez que votre téléphone et PC sont sur le même réseau WiFi.

---

## 🎉 C'est parti !

Scannez le QR code et commencez à tester l'application ! 🚀
