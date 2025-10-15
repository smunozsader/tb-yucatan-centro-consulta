# Copilot Instructions - Centro de Consulta de Acuerdos Sanitarios

## Project Overview

This is a Mexican government web application for managing cattle health agreements between two specialized working groups:

- **CESO** - Consejo Estatal de Seguimiento Operativo del SINIDA (State-level cattle traceability via ear tags)
- **APHIS-USDA Working Group** - Federal/international cooperation for bovine tuberculosis control and cattle export certification

The app serves as an **agreement monitoring system** and **document repository** for critical animal health documentation.

## Architecture & Technology Stack

**Frontend**: React 18 + Vite, Bootstrap 5, government design framework (gob.mx)  
**Backend**: Firebase (Firestore, Storage, Auth, Hosting)  
**Data**: Excel databases imported to Firestore collections  
**Styling**: Official Mexican government design system with custom CSS variables  
**Build**: Vite with JSX loader for `.js` files

### Key Architectural Patterns

```javascript
// Dual collection structure for agreements
firestore/
├── acuerdos-ceso/           # CESO agreements
├── acuerdos-aphis/          # APHIS-USDA agreements  
└── {collection}/{docId}/evidencias/  # Evidence subcollections
```

**Agreement Data Model** (`src-development/models/dataModels.js`):
- Unified `Agreement` class for both CESO and APHIS agreements
- Excel serial date parsing: `parseDate()` converts Excel numbers to JS Dates
- Status normalization: `Pendiente`, `Completado`, `Vencido`, `En Progreso`
- Source auto-detection by agreement number patterns: `CE-YUC-DDMMYY-XXX` (CESO) vs `XX-X-DDMMYY` (APHIS)

## Critical Development Workflows

### Project Structure Reality
- `src-development/` - **Current React source being reconstructed** (original lost due to HDD failure)
- `static/` - Compiled production assets with cache-busting hashes
- `index.html` - Production entry point with embedded compiled code
- `BASES DATOS/` - Excel source files for Firestore import
- Root-level `.html` files - Legacy/backup pages for different views

### Firebase Development Commands
```bash
# Development with local emulators
npm run emulators:start     # Starts Firestore, Auth, Storage emulators
npm run test:emulator      # Runs tests/emulator-e2e.js integration test

# Deployment (production is live at tb-yucatan.web.app)
npm run deploy              # Full deployment (hosting + rules)
npm run deploy:hosting      # Frontend only
npm run deploy:rules        # Security rules only
```

### Emulator Integration Testing
Key pattern in `tests/emulator-e2e.js`:
```javascript
// IPv4 explicit binding to avoid connection issues
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
// Tests evidence upload workflow: auth → storage → firestore → admin verification
```

### Service Account Security
- **NEVER commit** Firebase service account keys
- Store in `C:\Users\%USERNAME%\FirebaseKeys\` outside project
- Use environment variables for paths in `.env` files
- Rotate keys every 90 days per government security standards

## Data Management Workflows

### Excel Batch Import System
```bash
# Batch upload agreements from CSV templates
node batch-upload-agreements.js --file TEMPLATES/ceso_sesion_091025.csv --type ceso
node batch-upload-agreements.js --file TEMPLATES/aphis_sesion_091025.csv --type aphis

# Verify population and diagnose data issues
node verify-batch-upload.js
node verify-database-population.js
```

### Agreement Number Pattern Detection
```javascript
// In Agreement.detectSource() method:
// CESO: CE-YUC-DDMMYY-XXX (e.g., CE-YUC-091025-001)
// APHIS: XX-X-DDMMYY (e.g., 01-XX-091025)
// Collection routing: 'acuerdos-ceso' vs 'acuerdos-aphis'
```

### CSV Template Structure
Standard columns for both organizations:
```csv
Numero_de_Acuerdo,Descripcion_del_Acuerdo,Responsable_del_Seguimiento,Fecha_de_Reunion,Fecha_de_Cumplimiento,Estado,Tipo_de_Sesion
```

## Project-Specific Conventions

### Government Design System
```css
:root {
  --color-gobierno-principal: #611232;
  --color-gobierno-secundario: #9d2449;
  --color-gobierno-dorado: #a57f2c;
}
/* Use .btn-gobierno-*, .card-gobierno, .table-gobierno classes */
```

### Role-Based Access Control
```javascript
// USER_ROLES: PUBLIC, RESPONSIBLE, ADMINISTRATOR in AuthContext.jsx
// Permissions: view_agreements, upload_evidence, mark_completed, manage_users
// Mock authentication during reconstruction phase
```

### Vite Configuration Specifics
```javascript
// vite.config.js - JSX loader for .js files
esbuild: { loader: { '.js': 'jsx' } }
// Manual vendor chunking: react/react-dom separated
```

## Integration Points & Dependencies

### Evidence Management
- Firebase Storage paths: `acuerdos-{source}/{docId}/evidence-files/`
- Firestore metadata: `{collection}/{docId}/evidencias/{evidId}`
- Supported formats: PDF, JPG, PNG, Word documents
- Public viewing, authenticated upload workflow

### Excel Date Handling
```javascript
// Critical pattern in Agreement.parseDate():
// Excel epoch: 1900-01-01, JS epoch: 1970-01-01
// Convert Excel serial numbers to JS Date objects
const excelEpoch = new Date(1900, 0, 1)
const jsDate = new Date(excelEpoch.getTime() + (excelDate - 1) * 24 * 60 * 60 * 1000)
```

### Firebase Security Model
```javascript
// firestore.rules & storage.rules patterns:
// Public read access for agreements listing
// Authenticated write access only for evidence uploads
// Evidence files: public metadata, auth-required uploads
```

## Specialized Domain Knowledge

### Mexican Government Context
- Uses official gob.mx framework for styling and accessibility
- Follows SENASICA (animal health service) protocols
- Integrates with SINIDA cattle identification system
- Supports international certification workflows with USDA

### Cattle Health Terminology
- **Acuerdos**: Official agreements/resolutions from working group meetings
- **Evidencias**: Supporting documentation/proof of agreement compliance
- **Seguimiento**: Follow-up/monitoring of agreement status
- **Semovientes**: Live cattle (legal term for livestock in transit)

## Common Patterns to Follow

1. **Bilingual Support**: Always provide Spanish and English text options
2. **Excel Compatibility**: Maintain date formats and column structures for database imports
3. **Government Branding**: Use official colors, fonts (Patria/Noto Sans), and layout patterns
4. **Security First**: Never expose authentication tokens, always validate user permissions
5. **Mobile Responsive**: Government accessibility requirements mandate mobile-first design
6. **Firestore Document IDs**: Use `firebaseId` fallback when `id` fields conflict during Excel imports

When working with this codebase, prioritize understanding the dual-organization structure (CESO vs APHIS) and the evidence management workflow, as these are the core business logic patterns that drive most features.