# Copilot Instructions - Centro de Consulta de Acuerdos Sanitarios

## Project Overview

This is a Mexican government web application for managing cattle health agreements between two specialized working groups:

- **CESO** - Consejo Estatal de Seguimiento Operativo (CESO) del Sistema Nacional de Identificación y Registro de la Movilización de Animales (SINIIGA-SINIDA)
- **APHIS-USDA/SENASICA Working Group** - Federal/international cooperation for bovine tuberculosis control and cattle export certification

The app serves as an **agreement monitoring system** and **document repository** for critical animal health documentation.

🚀 **Live Application**: https://tb-yucatan.web.app/

## Architecture & Technology Stack

**Frontend**: React 18 + Vite 4.4.5, React Router v7.8.0, Bootstrap 5
**Backend**: Firebase (project: tb-yucatan) - Firestore, Storage, Auth, Hosting
**Data**: Excel databases imported to Firestore collections via batch scripts
**Styling**: Official Mexican government design system (gob.mx v3) + Custom CSS variables
**Build**: Vite with manual chunking for vendor, router, and firebase modules

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
npm run test:rules

# Build and deployment (production is live at tb-yucatan.web.app)
npm run build               # Vite build to dist/
npm run deploy              # Full deployment (hosting + rules)
npm run deploy:hosting      # Frontend only
npm run deploy:rules        # Security rules only

# Development server
npm run dev                 # Vite dev server (port 5173)
npm run preview             # Preview built app
```

### Service Account Security
- **NEVER commit** Firebase service account keys
- Store in `C:\Users\%USERNAME%\FirebaseKeys\` outside project
- Use environment variables for paths in `.env` files
- Rotate keys every 90 days per government security standards

### Excel Data Import Pattern
```javascript
// batch-upload-agreements.js - Server-side data migration
// Uses csv-parse and xlsx libraries
// Handles Excel date serial numbers: Math.floor(dateStr - 25569) * 86400 * 1000
// Validates agreement number formats by source organization

// Critical deployment files:
// - BASES DATOS/base datos CESO.xlsx
// - BASES DATOS/base datos APHIS USDA.xlsx
// - populate-firebase-complete.js (comprehensive migration)
// - upload_ceso_agreements_to_firestore.js
// - upload_aphis_agreements_to_firestore.js
```

### Firebase Emulator Testing
```javascript
// Environment variables for emulator connections
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

// Firebase configuration (firebase.json)
"emulators": {
  "firestore": { "host": "localhost", "port": 8080 },
  "storage": { "host": "localhost", "port": 9199 },
  "auth": { "host": "localhost", "port": 9099 }
}

// Test scripts: tests/emulator-e2e.js, tests/firestore-rules.test.js
// Validates Firestore rules, storage access, authentication flows
```

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

**CRITICAL**: Headers and footers are automatically injected by `gobmx.js` - DO NOT create custom ones.

### Framework Integration & Header/Footer Injection
- **Centralized injection**: Headers and footers are dynamically inserted by the framework JavaScript
- **Never download CDN files**: Always use the hosted CDN versions as they update automatically
- **Custom JavaScript**: Use `$gmx(document).ready(function(){ ... });` instead of jQuery's `$(document).ready()`
- **Framework includes**: Bootstrap 5.3.3, jQuery 3.7.1, Modernizr 3.13.1, Floating UI 1.6.7, Patria font, Noto Sans

### Official GOB.mx Component Library

#### Color Palette (MUST USE ONLY THESE)
```css
/* Official government colors */
--color-primary: #611232;    /* Gobierno principal */
--color-secondary: #9d2449;  /* Gobierno secundario */
--color-accent: #a57f2c;     /* Acento dorado */
--color-light: #DDC9A3;      /* Beige claro */
--color-gray: #98989A;       /* Gris */
--color-dark: #13322e;       /* Verde oscuro */
--color-white: #FFFFFF;      /* Blanco */
--color-gold: #BC955C;       /* Dorado */
--text-color: #545454;       /* Texto principal */
```

#### Typography Requirements
- **Patria font**: For headings (h1, h2, h3)
- **Noto Sans**: For body content (18px base, 1.428 line-height, minimum 16px)
- **Title structure**: Titles should occupy 2/3 of form width (8 columns in 12-column grid)

#### Form Components
```html
<!-- Standard form structure -->
<form role="form">
  <div class="form-group">
    <label class="control-label" for="input-id">Label:</label>
    <input class="form-control" id="input-id" placeholder="Placeholder" type="text">
  </div>
  <div class="form-group">
    <textarea class="form-control" rows="3" placeholder="Text area"></textarea>
  </div>
  <div class="checkbox">
    <label><input type="checkbox"> Accept terms</label>
  </div>
  <button class="btn btn-primary" type="submit">Submit</button>
</form>

<!-- Horizontal forms -->
<form role="form">
  <div class="form-group row">
    <label class="col-3 col-form-label" for="email">Email:</label>
    <div class="col-9">
      <input class="form-control" id="email" type="text">
    </div>
  </div>
</form>
```

#### Tables
```html
<!-- Basic table -->
<table class="table">...</table>

<!-- Striped table -->
<table class="table table-striped">...</table>

<!-- Bordered table -->
<table class="table table-bordered">...</table>

<!-- Responsive table -->
<table class="table table-responsive">...</table>
```

#### Alerts
```html
<div class="alert alert-success" role="alert">¡Felicidades! Success message</div>
<div class="alert alert-info" role="alert">¡Sugerencia! Info message</div>
<div class="alert alert-warning" role="alert">¡Precaución! Warning message</div>
<div class="alert alert-danger" role="alert">¡Error! Error message</div>
```

#### Navigation Components
```html
<!-- Breadcrumbs -->
<ol class="breadcrumb">
  <li class="breadcrumb-item"><a href="#"><i class="icon icon-home"></i></a></li>
  <li class="breadcrumb-item"><a href="#">Home</a></li>
  <li class="breadcrumb-item active" aria-current="page">Current</li>
</ol>

<!-- Sub-navigation bar -->
<nav class="navbar navbar-expand-md navbar-dark bg-light sub-navbar fixed-top">
  <div class="container">
    <a class="navbar-brand sub-navbar" href="#">Department Name</a>
    <div class="collapse navbar-collapse">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link subnav-link" href="#">Link</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

#### Modal Components
```html
<div class="modal" tabindex="1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h4 class="modal-title">Modal Title</h4>
      </div>
      <div class="modal-body">
        <p>Modal content</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save</button>
      </div>
    </div>
  </div>
</div>
```

#### Icons (Official GOB.mx + Bootstrap Icons)
```html
<!-- Official GOB.mx icons -->
<span class="icon-home" aria-hidden="true"></span>
<span class="icon-search" aria-hidden="true"></span>
<span class="icon-user" aria-hidden="true"></span>
<span class="icon-calendar" aria-hidden="true"></span>

<!-- Bootstrap icons -->
<span class="bootstrap-icons" aria-hidden="true">
  <i class="bi bi-search"></i>
</span>
```

#### Datepicker (Requires additional script)
```html
<!-- HTML -->
<div class="form-group datepicker-group">
  <label class="control-label" for="calendar">Calendar:</label>
  <input class="form-control" id="calendar" type="text">
  <span class="bootstrap-icons" aria-hidden="true"><i class="bi bi-calendar"></i></span>
</div>

<!-- JavaScript -->
<script src="https://framework-gb.cdn.gob.mx/gm/v3/assets/js/jquery-ui-datepicker.js"></script>
<script>
$gmx(document).ready(function() {
  $('#calendar').datepicker();
});
</script>
```

#### Utility Classes
```css
/* Spacing helpers */
.top-buffer { margin-top: 64px; }
.bottom-buffer { margin-bottom: 64px; }
.vertical-buffer { margin: 64px 0; }
```

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

<!-- Pagination -->
<ul class="pagination">
  <li class="page-item">
    <a class="page-link" href="#" aria-label="Previous">
      <span aria-hidden="true">&laquo;</span>
    </a>
  </li>
  <li class="page-item"><a class="page-link" href="#">1</a></li>
  <li class="page-item"><a class="page-link" href="#">2</a></li>
  <li class="page-item"><a class="page-link" href="#">3</a></li>
  <li class="page-item">
    <a class="page-link" href="#" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>
  </li>
</ul>
```

**NEVER** use custom button classes like `.btn-gobierno-*`, `.btn-ceso`, `.btn-aphis` - use only official framework classes.

### File Structure Patterns
- `src-development/` - React source code being reconstructed
- `static/` - Compiled production assets with hash names
- `BASES DATOS/` - Excel databases (base datos CESO.xlsx, base datos APHIS USDA.xlsx)
- Bilingual support throughout (Spanish primary, English secondary)

### Role-Based Access Control
```javascript
// USER_ROLES: PUBLIC, RESPONSIBLE, ADMINISTRATOR
// Permissions: view_agreements, upload_evidence, mark_completed, manage_users
// Auth context in src-development/context/AuthContext.jsx
const ROLE_PERMISSIONS = {
  PUBLIC: ['view_agreements', 'search_agreements', 'view_evidence', 'download_evidence'],
  RESPONSIBLE: ['view_agreements', 'search_agreements', 'view_evidence', 'download_evidence', 'upload_evidence', 'mark_completed'],
  ADMINISTRATOR: ['view_agreements', 'search_agreements', 'view_evidence', 'download_evidence', 'upload_evidence', 'mark_completed', 'manage_users', 'send_notifications', 'access_messages']
}
```

### Vite Build Configuration
```javascript
// vite.config.js - Key settings for government app
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
        }
      }
    }
  }
})
```

## Integration Points & Dependencies

### Excel Data Import Pattern
```javascript
// batch-upload-agreements.js - Server-side data migration
// Uses csv-parse and xlsx libraries
// Handles Excel date serial numbers: Math.floor(dateStr - 25569) * 86400 * 1000
// Validates agreement number formats by source organization
```

### Evidence Management
- Firebase Storage paths: `acuerdos-{source}/{docId}/evidence-files/`
- Firestore metadata: `{collection}/{docId}/evidencias/{evidId}`
- Supported formats: PDF, JPG, PNG, Word documents
- **CRITICAL**: Evidence modal triggers ONLY during status change from "Pendiente"/"En Progreso" to "Completado"
- Public viewing, authenticated upload workflow

### Firebase Security Rules
```javascript
// firestore.rules - Public read, authenticated write
match /{document=**} {
  allow read: if true;  // Public agreement access
  allow create, update: if request.auth != null;
}

// storage.rules - File upload restrictions
match /{coll}/{docId}/{fileName} {
  allow write: if request.auth != null
    && request.resource.size < 20 * 1024 * 1024;  // 20MB limit
}
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

### Agreement Number Patterns
```javascript
// Auto-detection of source organization
detectSource(agreementNumber) {
  if (agreementNumber.match(/^CE-YUC-\d{6}-\d{3}$/)) {
    return 'CESO'
  }
  if (agreementNumber.match(/^\d{1,2}-[A-Z]-\d{6}$/)) {
    return 'APHIS-USDA'
  }
  return 'unknown'
}
```

## Common Patterns to Follow

1. **Bilingual Support**: Always provide Spanish and English text options
   - **CRITICAL**: All public HTML pages MUST include a standardized Spanish/English toggle button
   - **Location**: Place language toggle in the top-right area of the main content (not in framework header)
   - **Implementation**: Use Bootstrap button group with consistent styling across all pages
   ```html
   <!-- Standardized Language Toggle (place in consistent location on ALL pages) -->
   <div class="language-toggle mb-3 text-end">
     <div class="btn-group" role="group" aria-label="Language Selection">
       <button type="button" class="btn btn-outline-secondary active" onclick="setLanguage('es')" id="btnSpanish">
         <span class="bootstrap-icons" aria-hidden="true"><i class="bi bi-translate"></i></span> Español
       </button>
       <button type="button" class="btn btn-outline-secondary" onclick="setLanguage('en')" id="btnEnglish">
         <span class="bootstrap-icons" aria-hidden="true"><i class="bi bi-globe"></i></span> English
       </button>
     </div>
   </div>
   ```
   - **Data Attributes**: Use `data-es` and `data-en` attributes for translatable content
   - **JavaScript**: Implement `setLanguage()` and `getCurrentLanguage()` functions consistently

2. **Excel Compatibility**: Maintain date formats and column structures for database imports
3. **Government Branding**: Use official colors, fonts (Patria/Noto Sans), and layout patterns
4. **Security First**: Never expose authentication tokens, always validate user permissions
5. **Mobile Responsive**: Government accessibility requirements mandate mobile-first design
6. **Date Handling**: Parse Excel serial numbers, handle timezone considerations for Yucatán
7. **Error Handling**: Use Spanish error messages for government users
8. **File Validation**: Check file types and sizes before upload (20MB limit)

## File Management & Synchronization

### **CRITICAL: Duplicate File Locations**
Several key files exist in multiple locations and **MUST be kept synchronized**:

- **Root Directory**: `hall-ceso.html`, `hall-aphis.html`, `acuerdos-ceso.html`, `acuerdos-aphis.html`
- **public/ Directory**: Same files for development/staging
- **dist/ Directory**: Built/compiled versions for production

**WORKFLOW REQUIREMENT**: When editing any HTML file, you MUST:
1. Edit the root directory version first
2. Copy changes to `public/` directory version
3. Rebuild for `dist/` directory (via `npm run build`)
4. Verify all three versions are synchronized before deployment

**Automation Note**: Consider implementing a build script to automatically sync these files to prevent inconsistencies.

When working with this codebase, prioritize understanding the dual-organization structure (CESO vs APHIS) and the evidence management workflow, as these are the core business logic patterns that drive most features.