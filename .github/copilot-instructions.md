# Centro de Consulta de Acuerdos Sanitarios - AI Development Guide

## Project Overview
React-based web application for Mexican government (Gobierno de México) that provides consultation services for sanitary agreements between CESO and APHIS-USDA in Yucatan. This is a **production-deployed Firebase-hosted application** with compiled static assets.

**Live Deployment**: https://tb-yucatan.web.app/

### System Purpose
Sistema desarrollado por la Representación de la Secretaría de Agricultura y Desarrollo Rural (Gobierno Federal Mexicano) en Yucatán, en beneficio de la Ganadería yucateca, para la gestión integral de dos grupos colegiados fundamentales en la sanidad pecuaria estatal.

**Target Organizations**:
- 🏢 **CESO** - Consejo Estatal de Seguimiento Operativo del SINIDA, alineado con la NOM-001-SAG/GAN-2015 para el Sistema Nacional de Identificación Animal de Bovinos y Colmenas
- 🇺🇸 **Grupo de Trabajo APHIS-USDA/SENASICA** para el control de la tuberculosis bovina y la atención de recomendaciones críticas en seguimiento a las visitas de certificación de la entidad federativa Yucatán para la exportación de semovientes bovinos a Estados Unidos

## Core Features & Functionality

### Public Functions (No Authentication Required)
- 🔍 **Search Agreements**: By number or description
- 🎛 **Filter by Status**: Pendiente, Completado, Vencidos, etc.
- 🔗 **Quick Access**: Click agreement numbers for instant details
- 👁 **View Details**: Complete agreement information
- 📂 **Evidence Viewing**: Access evidence files from EVIDENCIA column in Dashboard (v2.5.0)
- ⬇ **Download Evidence**: Direct file downloads from detail modals
- 📚 **Document Consultation**: Official documents organized by categories
- 🌐 **Language Toggle**: Español ↔ Inglés
- 📱 **Mobile Responsive**: Full mobile navigation support

### Restricted Functions (Administrator/Responsible Role Required)
- 📎 **Evidence System**: Upload compliance files (PDF, JPG, PNG, Word)
- ✅ **Mark Completed**: Change agreement status with mandatory evidence
- 📂 **Evidence Management**: Full compliance functions from EVIDENCIA column
- 📧 **Meeting Notifications**: Generate form letters for ordinary and extraordinary meetings
- 📋 **Institutional Templates**: CESO and APHIS-USDA with official SIMPLIFIED format (v2.3.1)

## Architecture & Key Components

### Core Technology Stack
- **Frontend**: React with React Router v7.8.0
- **Hosting**: Firebase (project: `tb-yucatan`)
- **Styling**: Custom government design system + jQuery UI datepicker
- **Government Framework**: gob.mx v3 official framework integration

### File Structure Patterns
```
├── index.html                 # Main entry point with gob.mx framework
├── static/                    # Compiled production assets
│   ├── css/main.{hash}.css   # Compiled styles
│   └── js/main.{hash}.js     # Compiled React bundle
├── __/firebase/              # Firebase configuration
├── BASES DATOS/             # Excel databases (APHIS USDA, CESO)
└── asset-manifest.json     # Build artifact mapping
```

## Government Design System

### CSS Variables & Colors
- Primary: `--color-gobierno-principal: #611232` (dark red)
- Secondary: `--color-gobierno-secundario: #9d2449` (red)
- Gold: `--color-gobierno-dorado: #a57f2c`
- Green: `--color-gobierno-verde: #13322e`
- Typography: `--fuente-titulos: "Patria"` (headers), `--fuente-contenido: "Noto Sans"` (body)

### Component Naming Conventions
- Government buttons: `.btn-gobierno-principal`, `.btn-gobierno-secundario`, `.btn-gobierno-outline`
- Background utilities: `.bg-gobierno-*`
- Text utilities: `.text-gobierno-*`
- Cards: `.card-gobierno`
- Tables: `.table-gobierno`

## Firebase Configuration
- Project ID: `tb-yucatan`
- Auth Domain: `tb-yucatan.firebaseapp.com`
- Config files: `__/firebase/init.js` and `__/firebase/init.json`
- No database URL configured (likely uses Firestore or external data)

## Data Sources & Management
Excel databases in `BASES DATOS/`:
- `base datos APHIS USDA.xlsx` - USDA Agricultural data and agreements
- `base datos CESO.xlsx` - CESO organization data and agreements
- `Tabla de acuerdos (CESO TABLA ORIGINAL).xlsx` - Original agreements table

### Evidence Management System
- **Supported Formats**: PDF, JPG, PNG, Word documents
- **Upload Workflow**: Restricted to Administrator/Responsible roles
- **Viewing Access**: Public via EVIDENCIA column in Dashboard
- **Download Feature**: Direct access from detail modals
- **Version Control**: Evidence tracking with v2.5.0 implementation

### User Roles & Permissions
- **Public Users**: Search, view, download evidence
- **Administrator**: Full CRUD operations, evidence upload, status changes
- **Responsible**: Evidence management, agreement completion marking

## Production Deployment Context

### Build Process
- This is a **compiled/built application** - source code is not in this repository
- Asset hashes in filenames indicate webpack/build tool usage
- `asset-manifest.json` maps logical names to hashed filenames
- Files are minified and production-optimized

### Development Constraints
- **No source editing**: React components are compiled in `static/js/main.f151cabb.js`
- **Style customization**: Only via `index.html` `<style>` blocks or external CSS
- **Configuration changes**: Modify Firebase config in `__/firebase/` files
- **Content updates**: Likely require rebuild from source repository

## Government Framework Integration

### gob.mx Framework
- Uses official Mexican government web framework v3
- CDN assets: `https://framework-gb.cdn.gob.mx/gm/v3/`
- Global object: `$gmx` (jQuery-like)
- Official header/footer automatically included

### jQuery UI Integration
- Custom-styled datepicker with government colors
- Version 1.13.2 from jQuery CDN
- Extensive CSS overrides in `index.html` for government branding

## Special Features
- **PGLite Debug**: `pglite-debug.log` indicates PostgreSQL-in-browser usage
- **Responsive Dashboard**: Table classes with mobile-first responsive design
- **Government Accessibility**: Proper semantic HTML and ARIA compliance
- **Error Handling**: Custom error handler for `detectOverflow` issues
- **Bilingual Support**: Spanish ↔ English language toggle
- **Evidence System**: Version-controlled file management with download capabilities
- **Meeting Templates**: Automated form letter generation for CESO and APHIS-USDA meetings

## Development Workflow

### Making Changes
1. **Content/Text**: Modify directly in `index.html`
2. **Styling**: Add CSS to `<style>` block in `index.html` or modify `styles.css`
3. **Firebase Config**: Update `__/firebase/init.js` and `init.json`
4. **Major Features**: Requires access to source repository and rebuild

### Deployment
- Firebase hosting deployment updates `index.html` and `static/` assets
- Database updates: Replace Excel files in `BASES DATOS/`
- Configuration: Update Firebase config files

### Testing Locally
```bash
# Serve locally (Windows PowerShell)
npx serve . -p 3000
# Or use Python
python -m http.server 3000
```

## Debugging Notes
- Console logs indicate framework loading status
- Custom error handling for overflow detection
- Check browser developer tools for gob.mx framework integration issues
- Firebase errors will appear in console if configuration is incorrect