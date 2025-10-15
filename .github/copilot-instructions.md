Markdown PDF: Export (pdf)# Copilot Instructions - Centro de Consulta de Acuerdos Sanitarios

## Project Overview

This is a Mexican government web application for managing cattle health agreements between two specialized working groups:

- **CESO** - Consejo Estatal de Seguimiento Operativo (CESO) del Sistema Nacional de Identificación y Registro de la Movilización de Animales (SINIIGA-SINIDA)
- **APHIS-USDA/SENASICA Working Group** - Federal/international cooperation for bovine tuberculosis control and cattle export certification

The app serves as an **agreement monitoring system** and **document repository** for critical animal health documentation.

## Architecture & Technology Stack

**Frontend**: React 18 + Vite, Bootstrap 5, government design framework (gob.mx)
**Backend**: Firebase (Firestore, Storage, Auth, Hosting)
**Data**: Excel databases imported to Firestore collections
**Styling**: Official Mexican government design system with custom CSS variables

### Key Architectural Patterns

```javascript
// Dual collection structure for agreements
firestore/
├── acuerdos-ceso/           # CESO agreements
├── acuerdos-aphis/          # APHIS-USDA/SENASICA agreements  
└── {collection}/{docId}/evidencias/  # Evidence subcollections
```

**Agreement Data Model** (`src-development/models/dataModels.js`):
- Unified structure for both CESO and APHIS agreements
- Excel import/export compatibility with date parsing
- Status normalization: `Pendiente`, `Completado`, `Vencidos`
- Auto-detection of source organization by agreement number patterns

## Critical Development Workflows

### Firebase Security Model
```javascript
// Public read access for agreements listing
// Authenticated write access only
// Evidence files: public metadata, auth-required uploads
```

### Key Commands
```bash
# Development with emulators
npm run emulators:start
npm run test:emulator

# Deployment (production is live at tb-yucatan.web.app)
npm run deploy              # Full deployment
npm run deploy:hosting      # Frontend only
npm run deploy:rules        # Security rules only
```

### Service Account Security
- **NEVER commit** Firebase service account keys
- Store in `C:\Users\%USERNAME%\FirebaseKeys\` outside project
- Use environment variables for paths in `.env` files
- Rotate keys every 90 days per government security standards

## Project-Specific Conventions

### Official GOB.mx Framework Requirements
**CRITICAL**: All HTML pages MUST use the official GOB.mx framework v3:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page Title - GOB.mx</title>
    
    <!-- REQUIRED: Official GOB.mx Framework -->
    <link href="https://framework-gb.cdn.gob.mx/gm/v3/assets/images/favicon.ico" rel="shortcut icon">
    <link href="https://framework-gb.cdn.gob.mx/gm/v3/assets/styles/main.css" rel="stylesheet">
  </head>
  <body>
    <!-- Content goes inside main.page structure -->
    <main class="page">
      <div class="container">
        <!-- Your content here -->
      </div>
    </main>
    
    <!-- REQUIRED: Framework JS (includes official header/footer) -->
    <script src="https://framework-gb.cdn.gob.mx/gm/v3/assets/js/gobmx.js"></script>
  </body>
</html>
```

**DO NOT** create custom headers/footers - the framework automatically provides official government branding.

### Official GOB.mx Button Guidelines
**CRITICAL**: All buttons MUST follow the official GOB.mx framework button patterns:

```html
<!-- Standard button types -->
<button type="button" class="btn btn-secondary">Básico</button>
<button type="button" class="btn btn-danger">Error</button>
<button type="button" class="btn btn-primary">Primario</button>
<button type="button" class="btn btn-link">Hipervínculo</button>

<!-- Button sizes -->
<button class="btn btn-secondary btn-lg" type="button">Grande</button>
<button class="btn btn-secondary" type="button">Básico</button>
<button class="btn btn-secondary btn-sm" type="button">Chico</button>

<!-- Button states -->
<button class="btn btn-primary btn-lg active" type="button">Activo</button>
<button class="btn btn-primary btn-lg disabled" type="button">Deshabilitado</button>

<!-- Buttons with icons -->
<button class="btn btn-secondary" type="button">
  <span class="bootstrap-icons" aria-hidden="true"><i class="bi bi-search"></i></span>
  Ejemplo
</button>
<button class="btn btn-primary" type="button">
  Ejemplo
  <span class="bootstrap-icons" aria-hidden="true"><i class="bi bi-search"></i></span>
</button>

<!-- Button groups -->
<div class="btn-group" role="group" aria-label="...">
  <button type="button" class="btn btn-secondary">Izquierda</button>
  <button type="button" class="btn btn-secondary">Centro</button>
  <button type="button" class="btn btn-secondary">Derecha</button>
</div>
```

**NEVER** use custom button classes like `.btn-gobierno-*`, `.btn-ceso`, `.btn-aphis` - use only official framework classes.

### File Structure Patterns
- `src-development/` - React source code being reconstructed
- `static/` - Compiled production assets with hash names
- `BASES DATOS/` - Excel databases (usuarios_aphis-usda_new_web_app.xlsx, usuarios_ceso_new_web_app.xlsx)
- Bilingual support throughout (Spanish primary, English secondary)

### Role-Based Access Control
```javascript
// USER_ROLES: PUBLIC, RESPONSIBLE, ADMINISTRATOR
// Permissions: view_agreements, upload_evidence, mark_completed, manage_users
// Auth context in src-development/context/AuthContext.jsx
```

## Integration Points & Dependencies

### Excel Data Import Pattern
```javascript
// Agreement number patterns determine source organization
// CESO: specific format patterns
// APHIS-USDA/SENASICA: different numbering convention
// Parse Excel date serial numbers to JavaScript Date objects
```

### Evidence Management
- Firebase Storage paths: `acuerdos-{source}/{docId}/evidence-files/`
- Firestore metadata: `{collection}/{docId}/evidencias/{evidId}`
- Supported formats: PDF, JPG, PNG, Word documents
- Public viewing, authenticated upload workflow

### Firebase Emulator Testing
```javascript
// tests/emulator-e2e.js - End-to-end testing with local emulators
// Validates Firestore rules, storage access, authentication flows
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

When working with this codebase, prioritize understanding the dual-organization structure (CESO vs APHIS) and the evidence management workflow, as these are the core business logic patterns that drive most features.