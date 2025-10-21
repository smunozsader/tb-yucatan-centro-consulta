# Centro de Consulta de Acuerdos Sanitarios

**Sistema desarrollado por la Representación de la Secretaría de Agricultura y Desarrollo Rural (Gobierno Federal Mexicano) en Yucatán**

🚀 **Live Application**: https://ceso-aphis-yuc.web.app/

## 🎯 Project Purpose

Centro de gestión para dos grupos colegiados especializados en sanidad pecuaria estatal:

- 🏢 **CESO** - Consejo Estatal de Seguimiento Operativo del SINIDA (NOM-001-SAG/GAN-2015)
- 🇺🇸 **Grupo de Trabajo APHIS-USDA/SENASICA** para control de tuberculosis bovina y exportación de semovientes

## ✨ Features

### Public Access
- 🔍 Search agreements by number or description
- 🎛 Filter by status (Pendiente, Completado, Vencidos)
- 👁 View complete agreement details
- 📂 Evidence viewing and download from Dashboard
- 📚 Official document consultation
- 🌐 Bilingual support (Spanish ↔ English)
- 📱 Fully responsive mobile design

### Restricted Access (Admin/Responsible)
- 📎 Evidence upload system (PDF, JPG, PNG, Word)
- ✅ Agreement completion marking
- 📧 Meeting notification system
- 📋 Institutional templates (CESO & APHIS-USDA)

## � Security & Service Account Setup

### ⚠️ IMPORTANT: Never commit service account keys to Git!

### Service Account Key Storage

1. **Create dedicated directory:**
   ```bash
   mkdir C:\Users\%USERNAME%\FirebaseKeys
   ```

2. **Download new service account key from Google Cloud Console:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - IAM & Admin → Service Accounts
   - Select your service account → Keys → Add Key → Create new key
   - Save as: `C:\Users\%USERNAME%\FirebaseKeys\ceso-aphis-yuc-service-account.json`

3. **Environment Configuration:**
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env with your actual paths/keys
   # FIREBASE_SERVICE_ACCOUNT_KEY=C:\Users\%USERNAME%\FirebaseKeys\ceso-aphis-yuc-service-account.json
   ```

### 🔑 Key Management Best Practices

- ✅ Store keys outside project directory
- ✅ Use environment variables, never hardcode
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use different keys for different environments
- ✅ Enable key restrictions in Google Cloud Console
- ❌ Never commit `.env` files or key files to Git

### 🚨 Security Incident Response

If keys are accidentally committed:
1. **Immediately revoke** the key in Google Cloud Console
2. **Remove from Git history** using `git filter-branch` or `git filter-repo`
3. **Force push** cleaned history to GitHub
4. **Create new key** and update configurations

## 🏗 Project Structure

```
├── index.html              # Main entry with gob.mx framework
├── static/                 # Compiled production assets
│   ├── css/main.{hash}.css # Compiled styles
│   └── js/main.{hash}.js   # Compiled React bundle
├── __/firebase/            # Firebase configuration
├── BASES DATOS/           # Excel databases
└── .github/               # GitHub configuration & AI instructions
```

## 🎨 Government Design System

Built with official Mexican government standards:
- Colors: `--color-gobierno-principal: #611232`, `--color-gobierno-secundario: #9d2449`
- Typography: Patria (headers), Noto Sans (body)
- Components: `.btn-gobierno-*`, `.card-gobierno`, `.table-gobierno`

## 🚦 Development Status

This repository contains the **production-deployed compiled version**. The original React source code was lost due to hard drive failure and is being reconstructed.

## 📝 Version History

- **v2.5.0** (October 16, 2025): Evidence viewing system in Dashboard + GOB.mx framework compliance fixes
  - ✅ Complete GOB.mx color palette compliance (#611232, #9d2449, #a57f2c, #DDC9A3)
  - ✅ Official button styles (btn-primary, btn-secondary, btn-danger, btn-link only)
  - ✅ Repository authentication and multilingual support
  - ✅ Mandatory evidence compliance system
  - ✅ Clickable status badges with evidence modal integration
  - ✅ TIPO DE SESIÓN column and advanced filtering
  - ✅ Professional batch upload instructions page
  - ✅ Complete Spanish/English translation system
- **v2.3.1**: Simplified institutional templates

## 🤝 Contributing

This is a government project for the state of Yucatan, Mexico. Development follows official government standards and accessibility requirements.

## 📄 License

Government of Mexico - Secretaría de Agricultura y Desarrollo Rural

---

### Migration: normalize 'Permanente' to canonical status

We've added a safe migration script `migrate-canonical-statuses.js` which by default runs in dry-run mode and will not write to Firestore unless `--apply --yes` is provided.

Run a dry-run (recommended, will only list planned changes):

```powershell
node migrate-canonical-statuses.js
```

Run against the Firestore emulator (recommended for testing):

```powershell
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
node migrate-canonical-statuses.js
```

To perform the updates (apply):

```powershell
node migrate-canonical-statuses.js --apply --yes
```

Notes:
- The script will add non-destructive fields `statusCanonical` (value: `Completado`), `statusCanonicalSource` and `statusCanonicalSetAt`.
- By default it scans `acuerdos-ceso` and `acuerdos-aphis`. Use `--collections "acuerdos-ceso,acuerdos"` to override.
- Always run a dry-run first, test on the emulator, and backup production before applying.