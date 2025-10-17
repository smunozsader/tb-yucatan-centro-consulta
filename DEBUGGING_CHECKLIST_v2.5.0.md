# 🐛 Pre-Release Debugging Checklist - Centro de Consulta de Acuerdos Sanitarios
## Version: v2.5.0 (Evidence Viewing System)

**Release Date:** October 16, 2025
**Target:** Test Users (CESO & APHIS-USDA Working Groups)
**Live URL:** https://ceso-aphis-yuc.web.app/

---

## ✅ COMPLETED: Test Data Setup

### Batch Upload Results
- [x] **CESO Agreements**: 3 test agreements uploaded successfully
  - CE-YUC-091025-001: Sistema de trazabilidad mejorado
  - CE-YUC-091025-002: Capacitación a productores sobre protocolos
  - CE-YUC-091025-003: Actualización base de datos SINIDA
- [x] **APHIS Agreements**: 3 test agreements uploaded successfully
  - 01-XX-091025: Revisar protocolos de certificación
  - 02-XX-091025: Actualizar procedimientos de muestreo
  - 03-XX-091025: Coordinación interinstitucional

### TEST Agreements for Evidence Modal
- [x] **CESO PENDIENTE**: `TEST-CE-YUC-001` - Ready for completion workflow
- [x] **CESO VENCIDO**: `TEST-CE-YUC-002` - Overdue, ready for completion workflow
- [x] **APHIS PENDIENTE**: `TEST-01-XX-001` - Ready for completion workflow
- [x] **APHIS VENCIDO**: `TEST-02-XX-002` - Overdue, ready for completion workflow

### Status Updates for Testing
- [x] **CESO Test Agreement**: `CE-YUC-091025-001` → **Pendiente** (ready for completion)
- [x] **APHIS Test Agreement**: `01-XX-091025` → **Pendiente** (ready for completion)

---

## 📋 Critical Path Testing

### 🔍 Agreement Search & Display
- [ ] **CESO Agreements**: Search by number (CE-YUC-DDMMYY-XXX format)
- [ ] **APHIS Agreements**: Search by number (XX-X-DDMMYY format)
- [ ] **Status Filtering**: Pendiente, Completado, Vencidos
- [ ] **Date Sorting**: Newest agreements first
- [ ] **Bilingual Display**: Spanish/English toggle works
- [ ] **Mobile Responsiveness**: Cards stack properly on small screens

### 📎 Evidence Management
- [ ] **File Upload**: PDF, JPG, PNG, Word (max 20MB)
- [ ] **Public Viewing**: Evidence accessible without authentication
- [ ] **Download Links**: Direct download functionality
- [ ] **File Validation**: Proper error messages for invalid files
- [ ] **Storage Paths**: `acuerdos-{source}/{docId}/evidence-files/`

#### 🧪 Evidence Modal Testing (Status Change Workflow)
- [ ] **TEST Agreements Setup**: 4 test agreements created with Pendiente/Vencido status
  - 🔵 PENDIENTE: TEST-CE-YUC-001, TEST-01-XX-001
  - 🔴 VENCIDO: TEST-CE-YUC-002, TEST-02-XX-002

**Testing Workflow:**
1. [ ] **Search TEST Agreements**: Go to https://ceso-aphis-yuc.web.app/ and search "TEST-"
2. [ ] **Login Required**: Login as RESPONSIBLE or ADMINISTRATOR role
3. [ ] **Find "Cumplir" Button**: Blue button visible next to Pendiente/Vencido agreements
4. [ ] **Click "Cumplir"**: Opens status dropdown for each test agreement
5. [ ] **Change to "Completado"**: Select "Completado" from dropdown
6. [ ] **🎯 Evidence Modal Triggers**: Modal should open automatically requiring evidence
7. [ ] **Upload Evidence**: Select file (PDF/JPG/PNG/Word) + add comment
8. [ ] **Complete Status Change**: Submit evidence → status changes to "Completado"
9. [ ] **Verify Evidence**: Green evidence button appears, click to view/download

**Expected Results:**
- [ ] Modal appears immediately when changing status to "Completado"
- [ ] File upload works (max 20MB, supported formats)
- [ ] Status change blocked until evidence provided
- [ ] Evidence saved and viewable after completion
- [ ] Process works for both CESO and APHIS agreements

### 🔐 Authentication & Permissions
- [ ] **PUBLIC Role**: View agreements, search, view evidence
- [ ] **RESPONSIBLE Role**: Upload evidence, mark completed
- [ ] **ADMINISTRATOR Role**: All permissions + user management
- [ ] **Session Persistence**: User stays logged in across pages

### 🎨 GOB.mx Framework Compliance
- [ ] **Official Colors**: #611232, #9d2449, #a57f2c, #DDC9A3
- [ ] **Button Styles**: Only btn-primary, btn-secondary, btn-danger, btn-link
- [ ] **Typography**: Patria (headers), Noto Sans (body)
- [ ] **Framework Header/Footer**: Automatic via gobmx.js
- [ ] **Favicon**: Official GOB.mx favicon loads

---

## 🧪 Firebase Integration Testing

### Emulator Setup
```bash
# Start emulators
npm run emulators:start

# Run E2E tests
npm run test:emulator
```

### Production Connectivity
- [ ] **Firestore Rules**: Public read, authenticated write
- [ ] **Storage Rules**: 20MB file size limit, authenticated upload
- [ ] **Authentication**: Firebase Auth emulator compatibility
- [ ] **Data Sync**: Excel import data matches Firestore collections

### Security Validation
- [ ] **Service Account Keys**: Not committed to Git
- [ ] **Environment Variables**: Proper .env configuration
- [ ] **Public Access**: Agreement data readable without auth
- [ ] **File Permissions**: Evidence files publicly accessible

---

## 🌐 Cross-Browser Testing

### Desktop Browsers
- [ ] **Chrome 120+**: Full functionality
- [ ] **Firefox 115+**: Full functionality
- [ ] **Edge 120+**: Full functionality
- [ ] **Safari 17+**: Full functionality (if applicable)

### Mobile Browsers
- [ ] **iOS Safari**: Touch interactions, responsive layout
- [ ] **Android Chrome**: Touch interactions, responsive layout
- [ ] **Mobile Responsiveness**: 320px to 768px breakpoints

---

## 📱 Mobile-Specific Testing

### Touch Interactions
- [ ] **Button Taps**: All buttons respond to touch
- [ ] **Form Inputs**: Virtual keyboard appears correctly
- [ ] **File Upload**: Mobile file picker works
- [ ] **Modal Dialogs**: Proper sizing and scrolling

### Responsive Design
- [ ] **Navigation**: Collapsible menu on small screens
- [ ] **Tables**: Horizontal scroll on narrow screens
- [ ] **Cards**: Proper stacking and spacing
- [ ] **Typography**: Readable font sizes

---

## 🔄 Data Integrity Testing

### Excel Import Validation
- [ ] **Date Parsing**: Excel serial numbers → JavaScript Date
- [ ] **Status Normalization**: Cumplido → Completado, Vencido → Vencidos
- [ ] **Agreement Numbers**: Auto-detection of CESO vs APHIS
- [ ] **Column Mapping**: Consistent field names across sources

### Database Consistency
- [ ] **Dual Collections**: acuerdos-ceso, acuerdos-aphis
- [ ] **Subcollections**: evidencias/{evidId} structure
- [ ] **Metadata**: File information stored correctly
- [ ] **Relationships**: Agreement ↔ Evidence links intact

---

## 🚀 Performance Testing

### Load Times
- [ ] **Initial Page Load**: < 3 seconds
- [ ] **Agreement Search**: < 1 second response
- [ ] **File Upload**: Progress indication, < 30 seconds for 20MB
- [ ] **Modal Opening**: < 500ms

### Memory Usage
- [ ] **No Memory Leaks**: Extended usage doesn't consume excessive RAM
- [ ] **File Handling**: Large files don't crash browser
- [ ] **Image Loading**: Thumbnails load efficiently

---

## 🐛 Bug Regression Testing

### Known Issues (Fixed in v2.5.0)
- [ ] **Button Visibility**: All buttons use approved GOB.mx styles
- [ ] **Color Compliance**: No non-standard hex codes
- [ ] **Repository Authentication**: Proper access controls
- [ ] **Multilingual Support**: Spanish/English switching works

### Previous Version Issues
- [ ] **UTF-8 CSV**: No duplicate download links
- [ ] **White Text**: No invisible text on white backgrounds
- [ ] **Modal Sorting**: Agreements sorted newest first
- [ ] **Status Clickability**: Status badges trigger evidence modals

---

## 📊 Analytics & Monitoring

### Error Tracking
- [ ] **Console Errors**: No JavaScript errors in browser console
- [ ] **Network Errors**: All API calls return 200 status
- [ ] **Firebase Errors**: No authentication or database errors

### User Experience
- [ ] **Loading States**: Proper spinners and progress indicators
- [ ] **Error Messages**: Spanish error messages for government users
- [ ] **Success Feedback**: Clear confirmation for user actions
- [ ] **Help Documentation**: Links to user manuals work

---

## 🚢 Deployment Readiness

### Build Verification
```bash
# Clean build
npm run build

# Preview build
npm run preview

# Lint check
npm run lint
```

### Firebase Deployment
```bash
# Deploy hosting only
npm run deploy:hosting

# Deploy rules only
npm run deploy:rules

# Full deployment
npm run deploy
```

### Environment Configuration
- [ ] **Production Keys**: Service account keys configured
- [ ] **Environment Variables**: .env file properly set
- [ ] **Firebase Config**: Correct project ID and API keys
- [ ] **Hosting Config**: Proper redirects and rewrites

---

## 👥 User Acceptance Testing

### CESO Working Group
- [ ] **Agreement Access**: All CESO agreements visible
- [ ] **Evidence Upload**: Responsible users can upload files
- [ ] **Status Updates**: Agreement completion marking works
- [ ] **Repository Access**: CESO-specific documents available

### APHIS-USDA Working Group
- [ ] **Agreement Access**: All APHIS agreements visible
- [ ] **Evidence Upload**: Authorized users can upload files
- [ ] **International Compliance**: USDA certification workflows
- [ ] **Repository Access**: APHIS-specific documents available

---

## 📞 Support & Documentation

### User Manuals
- [ ] **MANUAL_USUARIO_COMPLETO.md**: Comprehensive guide available
- [ ] **MANUAL_USUARIO_CORTO.md**: Quick reference guide available
- [ ] **PDF Downloads**: Manuals downloadable from repository
- [ ] **Help Links**: Context-sensitive help throughout app

### Technical Documentation
- [ ] **README.md**: Updated with v2.5.0 features
- [ ] **Copilot Instructions**: AI agent guidance current
- [ ] **Firebase Rules**: Security rules documented
- [ ] **Deployment Logs**: Session documentation complete

---

## ✅ Final Release Checklist

### Pre-Release
- [ ] All critical path tests passed
- [ ] No console errors or warnings
- [ ] Mobile testing completed
- [ ] Cross-browser testing completed
- [ ] Performance benchmarks met

### Release Process
- [ ] Git tag created: `v2.5.0`
- [ ] Package.json version updated
- [ ] README.md version history updated
- [ ] Firebase deployment successful
- [ ] Live URL verified working

### Post-Release
- [ ] User feedback collection initiated
- [ ] Error monitoring active
- [ ] Support channels ready
- [ ] Rollback plan documented

---

## 🆘 Emergency Rollback Plan

**If critical issues discovered after release:**

1. **Immediate Actions:**
   - Stop accepting new evidence uploads
   - Notify all test users of temporary issues
   - Switch to read-only mode if necessary

2. **Technical Rollback:**
   ```bash
   # Revert to previous version
   git checkout v2.4.0  # Previous stable version
   npm run deploy
   ```

3. **Communication:**
   - Update homepage with maintenance notice
   - Provide timeline for fixes
   - Maintain user trust and transparency

---

**Release Commander:** [Your Name]
**Date:** October 16, 2025
**Status:** ⏳ Ready for Testing</content>
<parameter name="filePath">c:\proyectos\tb-yucatan_new_web_app\DEBUGGING_CHECKLIST_v2.5.0.md