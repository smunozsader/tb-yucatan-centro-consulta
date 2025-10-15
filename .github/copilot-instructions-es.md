# Instrucciones Copilot - Centro de Consulta de Acuerdos Sanitarios

## Visión General del Proyecto

Esta es una aplicación web del gobierno mexicano para gestionar acuerdos de sanidad pecuaria entre dos grupos de trabajo especializados:

- **CESO** - Consejo Estatal de Seguimiento Operativo (CESO) del Sistema Nacional de Identificación y Registro de la Movilización de Animales (SINIIGA-SINIDA)
- **Grupo de Trabajo APHIS-USDA/SENASICA** - Cooperación federal/internacional para control de tuberculosis bovina y certificación de exportación de ganado

La aplicación sirve como **sistema de monitoreo de acuerdos** y **repositorio documental** para documentación crítica de sanidad animal.

## Arquitectura y Stack Tecnológico

**Frontend**: React 18 + Vite, Bootstrap 5, framework de diseño gubernamental (gob.mx)
**Backend**: Firebase (Firestore, Storage, Auth, Hosting)
**Datos**: Bases de datos Excel importadas a colecciones Firestore
**Estilos**: Sistema de diseño oficial del gobierno mexicano con variables CSS personalizadas

### Patrones Arquitectónicos Clave

```javascript
// Estructura dual de colecciones para acuerdos
firestore/
├── acuerdos-ceso/           # Acuerdos CESO
├── acuerdos-aphis/          # Acuerdos APHIS-USDA/SENASICA  
└── {collection}/{docId}/evidencias/  # Subcolecciones de evidencias
```

**Modelo de Datos de Acuerdos** (`src-development/models/dataModels.js`):
- Estructura unificada para acuerdos CESO y APHIS
- Compatibilidad import/export Excel con parseo de fechas
- Normalización de estados: `Pendiente`, `Completado`, `Vencidos`
- Auto-detección de organización origen por patrones de número de acuerdo

## Flujos de Trabajo Críticos de Desarrollo

### Modelo de Seguridad Firebase
```javascript
// Acceso de lectura público para listado de acuerdos
// Acceso de escritura solo autenticado
// Archivos de evidencia: metadatos públicos, subida requiere auth
```

### Comandos Clave
```bash
# Desarrollo con emuladores
npm run emulators:start
npm run test:emulator

# Despliegue (producción en vivo en tb-yucatan.web.app)
npm run deploy              # Despliegue completo
npm run deploy:hosting      # Solo frontend
npm run deploy:rules        # Solo reglas de seguridad
```

### Seguridad de Cuenta de Servicio
- **NUNCA commitear** claves de cuenta de servicio Firebase
- Almacenar en `C:\Users\%USERNAME%\FirebaseKeys\` fuera del proyecto
- Usar variables de entorno para rutas en archivos `.env`
- Rotar claves cada 90 días según estándares de seguridad gubernamentales

## Convenciones Específicas del Proyecto

### Sistema de Diseño Gubernamental
```css
:root {
  --color-gobierno-principal: #611232;
  --color-gobierno-secundario: #9d2449;
  --color-gobierno-dorado: #a57f2c;
}
/* Usar clases .btn-gobierno-*, .card-gobierno, .table-gobierno */
```

### Patrones de Estructura de Archivos
- `src-development/` - Código fuente React siendo reconstruido
- `static/` - Assets de producción compilados con nombres hash
- `BASES DATOS/` - Bases de datos Excel (usuarios_aphis-usda_new_web_app.xlsx, usuarios_ceso_new_web_app.xlsx)
- Soporte bilingüe completo (español primario, inglés secundario)

### Control de Acceso Basado en Roles
```javascript
// USER_ROLES: PUBLIC, RESPONSIBLE, ADMINISTRATOR
// Permisos: view_agreements, upload_evidence, mark_completed, manage_users
// Contexto auth en src-development/context/AuthContext.jsx
```

## Puntos de Integración y Dependencias

### Patrón de Importación de Datos Excel
```javascript
// Patrones de número de acuerdo determinan organización origen
// CESO: patrones de formato específicos
// APHIS-USDA/SENASICA: convención de numeración diferente
// Parsear números seriales de fecha Excel a objetos Date JavaScript
```

### Gestión de Evidencias
- Rutas Firebase Storage: `acuerdos-{source}/{docId}/evidence-files/`
- Metadatos Firestore: `{collection}/{docId}/evidencias/{evidId}`
- Formatos soportados: PDF, JPG, PNG, documentos Word
- Visualización pública, flujo de subida autenticado

### Pruebas con Emulador Firebase
```javascript
// tests/emulator-e2e.js - Pruebas end-to-end con emuladores locales
// Valida reglas Firestore, acceso storage, flujos de autenticación
```

## Conocimiento Especializado del Dominio

### Contexto Gubernamental Mexicano
- Usa framework oficial gob.mx para estilos y accesibilidad
- Sigue protocolos SENASICA (servicio de sanidad animal)
- Se integra con sistema SINIDA de identificación de ganado
- Soporta flujos de certificación internacional con USDA

### Terminología de Sanidad Pecuaria
- **Acuerdos**: Resoluciones oficiales de reuniones de grupos de trabajo
- **Evidencias**: Documentación de soporte/prueba de cumplimiento de acuerdos
- **Seguimiento**: Monitoreo del estado de cumplimiento de acuerdos
- **Semovientes**: Ganado vivo (término legal para ganado en tránsito)

## Patrones Comunes a Seguir

1. **Soporte Bilingüe**: Siempre proporcionar opciones de texto en español e inglés
2. **Compatibilidad Excel**: Mantener formatos de fecha y estructuras de columnas para importación de bases de datos
3. **Marca Gubernamental**: Usar colores oficiales, fuentes (Patria/Noto Sans) y patrones de layout
4. **Seguridad Primero**: Nunca exponer tokens de autenticación, siempre validar permisos de usuario
5. **Responsivo Móvil**: Requerimientos de accesibilidad gubernamental exigen diseño mobile-first

Al trabajar con esta base de código, priorice entender la estructura dual de organizaciones (CESO vs APHIS) y el flujo de gestión de evidencias, ya que estos son los patrones de lógica de negocio centrales que impulsan la mayoría de funcionalidades.