# Manual de Usuario Completo
## Centro de Consulta de Acuerdos Sanitarios - SADER Yucatán

### Versión 1.0 - Octubre 2025

---

## 📋 Tabla de Contenido

1. [Introducción](#introducción)
2. [Grupos de Trabajo](#grupos-de-trabajo)
3. [Características del Sistema](#características-del-sistema)
4. [Guía de Usuario](#guía-de-usuario)
5. [Funciones Avanzadas](#funciones-avanzadas)
6. [Funciones en Desarrollo](#funciones-en-desarrollo)
7. [Solución de Problemas](#solución-de-problemas)
8. [Contacto y Soporte](#contacto-y-soporte)

---

## 🏛️ Introducción

### ¿Qué es el Centro de Consulta de Acuerdos Sanitarios?

El **Centro de Consulta de Acuerdos Sanitarios** es una plataforma web gubernamental oficial desarrollada por la **Representación Estatal en Yucatán de la Secretaría de Agricultura y Desarrollo Rural (SADER)** del Gobierno Federal, trabajando para la ganadería yucateca en coordinación con la Secretaría de Desarrollo Rural (SEDER) del Estado de Yucatán. Su propósito principal es servir como **sistema de monitoreo de acuerdos** y **repositorio de documentación** para la gestión de acuerdos sanitarios pecuarios críticos.

### Objetivo Principal

Facilitar la consulta, seguimiento y gestión de acuerdos sanitarios entre dos grupos de trabajo especializados que colaboran en la protección de la salud animal y la certificación de ganado en Yucatán:

- **CESO** (Consejo Estatal de Seguimiento Operativo del SINIDA)
- **APHIS-USDA** (Grupo de trabajo de cooperación México-Estados Unidos)

### Importancia Estratégica

Este sistema centraliza información crítica para:
- ✅ **Trazabilidad de ganado** mediante el sistema SINIDA
- ✅ **Control de tuberculosis bovina** para exportación
- ✅ **Cumplimiento de protocolos** sanitarios internacionales
- ✅ **Certificación oficial** de productos pecuarios
- ✅ **Cooperación bilateral** México-Estados Unidos

---

## 👥 Grupos de Trabajo

### 🐄 CESO - Consejo Estatal de Seguimiento Operativo del SINIDA

**Descripción**: Organismo estatal responsable del seguimiento operativo del Sistema Nacional de Identificación y Registro de la Movilización de Animales (SINIDA) en Yucatán.

**Funciones Principales**:
- **Trazabilidad Individual**: Identificación única de cada cabeza de ganado mediante aretes oficiales
- **Registro de Movilización**: Control de movimientos de ganado dentro y fuera del estado
- **Seguimiento Sanitario**: Monitoreo del estado de salud del hato ganadero estatal
- **Cumplimiento SINIDA**: Implementación de protocolos nacionales de identificación

**Ámbito de Acción**: 
- Territorial: Estado de Yucatán
- Legal: Marco regulatorio nacional SINIDA
- Coordinación: SENASICA, SADER (Representación Estatal), y autoridades estatales

**Tipos de Acuerdos CESO**:
- Implementación de sistemas de trazabilidad
- Capacitación a productores rurales
- Actualización de bases de datos SINIDA
- Protocolos de movilización de semovientes
- Verificación de cumplimiento sanitario

### 🦬 APHIS-USDA - Grupo de Trabajo de Cooperación Internacional

**Descripción**: Grupo de trabajo bilateral México-Estados Unidos enfocado en el control de tuberculosis bovina y facilitación del comercio de ganado entre ambos países.

**Funciones Principales**:
- **Control de Tuberculosis**: Programas de erradicación de tuberculosis bovina
- **Certificación Internacional**: Emisión de certificados sanitarios para exportación
- **Protocolos Binacionales**: Desarrollo de estándares compartidos México-EE.UU.
- **Inspección y Verificación**: Supervisión de procesos de certificación

**Ámbito de Acción**:
- Territorial: Federal (México) e Internacional (México-EE.UU.)
- Legal: Tratados comerciales y acuerdos sanitarios binacionales
- Coordinación: SENASICA, SADER (Representación Estatal), USDA-APHIS, organismos certificadores

**Tipos de Acuerdos APHIS-USDA**:
- Protocolos de certificación para exportación
- Programas de control de tuberculosis bovina
- Estándares de inspección sanitaria
- Procedimientos de cuarentena
- Capacitación técnica especializada

---

## 🚀 Características del Sistema

### 💻 Especificaciones Técnicas

**Arquitectura**:
- **Frontend**: React 18 + Bootstrap 5 + Framework GOB.mx v3
- **Backend**: Firebase (Firestore, Storage, Auth, Hosting)
- **Datos**: Importación desde Excel, almacenamiento en Firestore
- **Estilo**: Sistema de diseño oficial del gobierno mexicano

**Compatibilidad**:
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles y tablets
- ✅ Accesibilidad según estándares gubernamentales
- ✅ Soporte completo para español e inglés

### 🔐 Modelo de Seguridad

**Niveles de Usuario**:

1. **👤 PÚBLICO**
   - Consulta de acuerdos (solo lectura)
   - Búsqueda y filtrado básico
   - Acceso a información general

2. **👨‍💼 RESPONSABLE**
   - Todo lo del nivel Público
   - Subida de evidencias para acuerdos asignados
   - Modificación de evidencias propias
   - Vista personalizada de acuerdos bajo su responsabilidad

3. **👨‍💻 ADMINISTRADOR**
   - Control total del sistema
   - Gestión de usuarios y permisos
   - Modificación de estados de acuerdos
   - Acceso a todas las funciones administrativas
   - Carga en lote de acuerdos

### 🌐 Interfaz Bilingüe

**Idiomas Soportados**:
- 🇲🇽 **Español** (idioma principal)
- 🇺🇸 **Inglés** (idioma secundario)

**Características de Traducción**:
- Toggle instantáneo entre idiomas
- Conservación de preferencia de idioma
- Traducciones oficiales y técnicamente precisas
- Soporte completo en todas las funciones

---

## 🎯 Guía de Usuario

### 🏠 Página Principal

**Acceso**: https://ceso-aphis-yuc.web.app

**Elementos Principales**:
- **Header Oficial**: Branding del Gobierno de México
- **Selector de Organización**: CESO o APHIS-USDA
- **Información Institucional**: Descripción de cada grupo de trabajo
- **Acceso Directo**: Enlaces a funciones principales

**Navegación Inicial**:
1. Seleccionar organización (CESO o APHIS-USDA)
2. Iniciar sesión (si se requiere acceso administrativo)
3. Acceder al panel de control correspondiente

### 🏢 Paneles de Control (Halls)

#### Panel CESO (`hall-ceso.html`)
**Características**:
- **Estadísticas en Tiempo Real**: 
  - 🔴 Acuerdos Vencidos (prioridad máxima)
  - 🟡 Acuerdos Pendientes
  - 🔵 Acuerdos en Progreso  
  - 🟢 Acuerdos Completados
  - ⚪ Total de Acuerdos

- **Tarjetas Interactivas**: Clic en cualquier estadística abre lista filtrada
- **Funciones de Navegación**:
  - 📊 Panel de Acuerdos
  - 📂 Repositorio CESO (*en desarrollo*)
  - ⚙️ Panel de Configuración (*en desarrollo*)
  - 📈 Reportes y Métricas (*próximamente*)
  - 📤 Carga en Lote
  - ❓ Centro de Ayuda (*próximamente*)

#### Panel APHIS (`hall-aphis.html`)
**Características**:
- **Estadísticas Equivalentes** al panel CESO
- **Colores Distintivos**: Esquema dorado/amarillo para APHIS-USDA
- **Funciones Específicas**:
  - 📊 Panel de Acuerdos APHIS
  - 🌎 Repositorio APHIS (*en desarrollo*)
  - ⚙️ Panel de Configuración (*en desarrollo*)
  - 📈 Reportes y Métricas (*próximamente*)
  - 📤 Carga en Lote
  - ❓ Centro de Ayuda (*próximamente*)

### 📊 Gestión de Acuerdos

#### Consulta de Acuerdos (`acuerdos-ceso.html` / `acuerdos-aphis.html`)

**Interfaz Principal**:
- **Lista Completa**: Todos los acuerdos de la organización
- **Filtros Avanzados**:
  - Por estado (Pendiente, En Progreso, Completado, Vencidos)
  - Por responsable
  - Por rango de fechas
  - Por número de acuerdo

**Información por Acuerdo**:
- **Número de Acuerdo**: Identificador único
- **Descripción**: Texto completo del acuerdo
- **Responsable**: Persona encargada del seguimiento
- **Fechas**: Reunión y cumplimiento
- **Estado Actual**: Con indicadores visuales
- **Evidencias**: Documentos adjuntos

#### Gestión de Estados de Acuerdos (Solo Administradores)

**Estados Disponibles**:
1. **Pendiente** 🟡: Acuerdo en proceso inicial
2. **En Progreso** 🔵: Trabajo activo en desarrollo
3. **Completado** 🟢: Acuerdo cumplido exitosamente  
4. **Vencidos** 🔴: Acuerdo no cumplido en fecha límite

**Proceso de Cambio de Estado**:
1. Acceder como administrador
2. Localizar el acuerdo específico
3. Hacer clic en botón "Cambiar Estado"
4. Seleccionar nuevo estado
5. Confirmar cambio (se registra automáticamente)

### 📁 Gestión de Evidencias

#### Subida de Evidencias (Responsables y Administradores)

**Formatos Soportados**:
- 📄 PDF (documentos oficiales)
- 🖼️ JPG/PNG (fotografías, capturas)
- 📝 Word (.docx, reportes)
- 📊 Excel (.xlsx, datos tabulares)

**Proceso de Subida**:
1. Acceder al acuerdo específico
2. Localizar sección "Evidencias"
3. Hacer clic en "Subir Evidencia"
4. Seleccionar archivo (máximo 10MB)
5. Agregar descripción del documento
6. Confirmar subida

**Visualización de Evidencias**:
- **Lista Cronológica**: Evidencias ordenadas por fecha
- **Vista Previa**: Para PDFs e imágenes
- **Metadatos**: Fecha, tamaño, subido por
- **Control de Versiones**: Historial de documentos

### 📤 Carga en Lote

#### Funcionalidad (`batch-upload-ceso.html` / `batch-upload-aphis.html`)

**Propósito**: Importación masiva de acuerdos desde archivos CSV de sesiones.

**Proceso Completo**:
1. **Descargar Plantilla**: Template CSV pre-configurado
2. **Completar Datos**: Información de la sesión en Excel/CSV
3. **Validar Formato**: Verificación automática de estructura
4. **Subir Archivo**: Importación al sistema
5. **Verificar Resultados**: Reporte de éxito/errores

**Campos Requeridos en CSV**:
- `Numero_de_Acuerdo`: Identificador único
- `Descripcion_del_Acuerdo`: Texto completo
- `Responsable_del_Seguimiento`: Persona encargada
- `Fecha_de_Reunion`: Fecha de sesión (YYYY-MM-DD)
- `Fecha_de_Cumplimiento`: Fecha límite (YYYY-MM-DD)
- `Estado`: Pendiente/Completado/Vencidos
- `Tipo_de_Sesion`: Ordinaria/Extraordinaria/etc.

**Patrones de Numeración**:
- **CESO**: `CE-YUC-DDMMYY-NNN` (ejemplo: CE-YUC-091025-001)
- **APHIS**: `NN-SESION-DDMMYY` (ejemplo: 01-XX-091025)

---

## 🔧 Funciones Avanzadas

### 📊 Modal de Filtrado Interactivo

**Activación**: Hacer clic en cualquier tarjeta estadística del panel de control

**Características**:
- **Filtrado en Tiempo Real**: Consulta directa a base de datos
- **Lista Interactiva**: Cada acuerdo es clickeable
- **Navegación Directa**: Acceso inmediato a detalles
- **Búsqueda Integrada**: Filtro por texto
- **Paginación**: Manejo eficiente de grandes volúmenes

**Funcionalidad**:
1. Clic en estadística (ej: "27 Pendientes")
2. Se abre modal con lista filtrada
3. Búsqueda adicional disponible
4. Clic en número de acuerdo → vista detallada
5. Enlace directo al panel completo de acuerdos

### 🌐 Sistema de Traducción Avanzado

**Toggle de Idioma**:
- **Ubicación**: Esquina superior derecha de todas las páginas
- **Iconos**: 🇲🇽 ESPAÑOL / 🇺🇸 ENGLISH
- **Persistencia**: Preferencia guardada automáticamente
- **Cobertura**: 100% de la interfaz traducida

**Elementos Traducidos**:
- ✅ Navegación y menús
- ✅ Botones y enlaces
- ✅ Etiquetas de formularios
- ✅ Mensajes de estado
- ✅ Descripciones de funciones
- ✅ Documentación y ayuda

### 🔍 Búsqueda y Filtrado Avanzado

**Criterios de Búsqueda**:
- **Por Número**: Búsqueda exacta o parcial
- **Por Descripción**: Búsqueda de texto libre
- **Por Responsable**: Filtro por persona
- **Por Estado**: Filtro múltiple por estados
- **Por Fecha**: Rangos personalizables

**Operadores de Búsqueda**:
- Búsqueda literal (comillas)
- Búsqueda parcial (texto libre)
- Combinación de filtros (AND lógico)

---

## 🚧 Funciones en Desarrollo

### 📂 Repositorio de Documentos

**Estado**: En desarrollo activo  
**Lanzamiento Estimado**: Próxima actualización

**Características Planificadas**:
- **Biblioteca Centralizada**: Documentos oficiales, manuales, protocolos
- **Categorización**: Por tipo de documento y organización
- **Control de Versiones**: Historial de actualizaciones
- **Búsqueda Avanzada**: Por contenido y metadatos
- **Acceso Diferenciado**: Según nivel de usuario

**Tipos de Documentos**:
- 📋 Manuales operativos SINIDA
- 📊 Protocolos de certificación APHIS
- 📑 Normativas y regulaciones actualizadas
- 🎓 Material de capacitación
- 📈 Reportes técnicos especializados

### ⚙️ Panel de Configuración

**Estado**: En desarrollo  
**Lanzamiento Estimado**: Próxima actualización major

**Funciones Administrativas Planificadas**:
- **Gestión de Usuarios**:
  - Creación/edición/eliminación de cuentas
  - Asignación de roles y permisos
  - Activación/desactivación de accesos
  
- **Configuración del Sistema**:
  - Parámetros operacionales
  - Configuración de notificaciones
  - Ajustes de interfaz personalizables
  
- **Gestión de Organizaciones**:
  - Configuración CESO y APHIS
  - Plantillas de acuerdos personalizables
  - Flujos de trabajo configurables

- **Reportes y Auditoría**:
  - Logs de actividad del sistema
  - Reportes de uso y estadísticas
  - Auditoría de cambios y accesos

### 📈 Módulo de Reportes y Métricas

**Estado**: Próximamente  
**Características Previstas**:
- Dashboard ejecutivo con KPIs
- Reportes automáticos programables
- Gráficos y visualizaciones interactivas
- Exportación a Excel y PDF
- Análisis de tendencias y cumplimiento

### ❓ Centro de Ayuda

**Estado**: Próximamente  
**Contenido Planificado**:
- Tutoriales interactivos paso a paso
- FAQ con respuestas detalladas
- Videos explicativos de funciones
- Contacto directo con soporte técnico
- Base de conocimientos searchable

---

## 🆘 Solución de Problemas

### Problemas Comunes y Soluciones

#### 🔐 Problemas de Acceso

**Problema**: "No puedo iniciar sesión"
**Soluciones**:
1. Verificar credenciales correctas
2. Limpiar caché del navegador
3. Intentar desde navegador diferente
4. Contactar administrador del sistema

**Problema**: "No puedo cambiar estados de acuerdos"
**Soluciones**:
1. Verificar que tiene rol de Administrador
2. Confirmar que está en sesión activa
3. Refrescar la página
4. Contactar soporte técnico

#### 📁 Problemas con Evidencias

**Problema**: "No puedo subir archivos"
**Soluciones**:
1. Verificar tamaño de archivo (máximo 10MB)
2. Confirmar formato soportado (PDF, JPG, PNG, DOCX)
3. Verificar conexión a internet estable
4. Intentar con archivo diferente

**Problema**: "Las evidencias no se muestran"
**Soluciones**:
1. Refrescar la página
2. Verificar permisos de acceso
3. Limpiar caché del navegador
4. Reportar al administrador

#### 📤 Problemas de Carga en Lote

**Problema**: "Error en validación de CSV"
**Soluciones**:
1. Verificar formato de fechas (YYYY-MM-DD)
2. Confirmar que números de acuerdo son únicos
3. Validar que todos los campos requeridos están completos
4. Usar plantilla oficial descargada del sistema

**Problema**: "No se procesan todos los registros"
**Soluciones**:
1. Verificar codificación UTF-8 del archivo
2. Eliminar caracteres especiales problemáticos
3. Revisar log de errores detallado
4. Procesar en lotes más pequeños

### 📞 Escalación de Problemas

**Nivel 1 - Auto-servicio**:
- Consultar esta documentación
- Revisar mensajes de error específicos
- Intentar soluciones básicas (refresco, caché)

**Nivel 2 - Administrador Local**:
- Contactar administrador del sistema
- Proporcionar detalles específicos del error
- Incluir capturas de pantalla si es posible

**Nivel 3 - Soporte Técnico**:
- Escalación a través de canales oficiales SADER
- Problemas de infraestructura o base de datos
- Requests de nuevas funcionalidades

---

## 📞 Contacto y Soporte

### Información de Contacto Oficial

**Organización Responsable**:  
Representación Estatal en Yucatán  
Secretaría de Agricultura y Desarrollo Rural (SADER)  
Gobierno Federal de México  

*En coordinación con:*  
Secretaría de Desarrollo Rural (SEDER)  
Gobierno del Estado de Yucatán

**Soporte Técnico**:  
A través de canales oficiales de SADER Yucatán

**Horario de Atención**:  
Lunes a Viernes, 8:00 AM - 5:00 PM (hora local)

### Información del Sistema

**URL de Producción**: https://ceso-aphis-yuc.web.app  
**Versión Actual**: 1.0  
**Última Actualización**: Octubre 2025  
**Estado**: Producción activa

### Escalación de Incidentes

**Problemas Críticos** (sistema no disponible):
- Reportar inmediatamente a través de canales oficiales
- Incluir hora exacta y descripción del problema
- Proporcionar capturas de pantalla si es posible

**Problemas No Críticos** (funcionalidad limitada):
- Documentar problema detalladamente
- Intentar workarounds disponibles
- Reportar a administrador del sistema

**Solicitudes de Mejora**:
- Enviar a través de procesos oficiales de SADER
- Incluir justificación de negocio
- Especificar impacto esperado

---

## 📚 Información Adicional

### Cumplimiento Regulatorio

**Estándares Cumplidos**:
- ✅ Framework Oficial GOB.mx v3
- ✅ Estándares de accesibilidad gubernamental
- ✅ Protocolos de seguridad de datos gubernamentales
- ✅ Requisitos de bilinguismo oficial

### Actualizaciones del Sistema

**Frecuencia**: Actualizaciones regulares según necesidades operativas  
**Notificación**: A través de interfaces del sistema y comunicación oficial  
**Mantenimiento**: Programado durante horarios de menor uso

### Términos de Uso

Este sistema es propiedad del Gobierno Federal de México a través de la Secretaría de Agricultura y Desarrollo Rural (SADER) y está destinado exclusivamente para uso oficial en funciones relacionadas con sanidad animal y acuerdos pecuarios. El uso no autorizado está prohibido y puede resultar en acciones legales.

---

*Manual de Usuario Completo v1.0*  
*Centro de Consulta de Acuerdos Sanitarios*  
*SADER Yucatán - Octubre 2025*  
*Desarrollado en cumplimiento con estándares GOB.mx v3*