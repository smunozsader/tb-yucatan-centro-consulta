# Sistema de Carga en Lote de Acuerdos
**Sistema de Consulta de Acuerdos Sanitarios TB-Yucatán**

## Descripción General

El sistema de carga en lote permite a los administradores cargar múltiples acuerdos de una sesión utilizando archivos CSV, agilizando significativamente el proceso de captura de datos después de las sesiones de trabajo de CESO y APHIS-USDA.

## Características Principales

- ✅ **Validación automática** de formato de datos
- ✅ **Detección de duplicados** por número de acuerdo
- ✅ **Normalización de fechas** automática
- ✅ **Soporte bilingüe** (español/inglés)
- ✅ **Reportes detallados** de carga
- ✅ **Manejo robusto de errores**

## Requisitos Previos

### Dependencias de Sistema
```bash
# Verificar que Node.js esté instalado
node --version  # Debe ser v16 o superior

# Verificar dependencias del proyecto
npm list csv-parse
```

### Configuración de Firebase
- Archivo `.env` con variables de configuración
- Claves de servicio de Firebase en directorio seguro
- Permisos de escritura en colecciones Firestore

## Uso del Sistema

### 1. Preparación del Archivo CSV

#### Para CESO (Consejo Estatal de Seguimiento Operativo)
Crear archivo CSV con las siguientes columnas:
```csv
Numero_de_Acuerdo,Descripcion_del_Acuerdo,Responsable_del_Seguimiento,Fecha_de_Reunion,Fecha_de_Cumplimiento,Estado,Tipo_de_Sesion
```

**Ejemplo: `ceso_sesion_091025.csv`**
```csv
Numero_de_Acuerdo,Descripcion_del_Acuerdo,Responsable_del_Seguimiento,Fecha_de_Reunion,Fecha_de_Cumplimiento,Estado,Tipo_de_Sesion
CE-YUC-091025-001,"Implementar sistema de trazabilidad mejorado para aretes SINIDA","Dr. María González López (Gobierno del Estado)","2025-10-09","2025-11-15","Pendiente","Décima Quinta Ordinaria"
```

#### Para APHIS-USDA (Grupo de Trabajo Federal)
Usar las mismas columnas:
```csv
Numero_de_Acuerdo,Descripcion_del_Acuerdo,Responsable_del_Seguimiento,Fecha_de_Reunion,Fecha_de_Cumplimiento,Estado,Tipo_de_Sesion
```

**Ejemplo: `aphis_sesion_091025.csv`**
```csv
Numero_de_Acuerdo,Descripcion_del_Acuerdo,Responsable_del_Seguimiento,Fecha_de_Reunion,Fecha_de_Cumplimiento,Estado,Tipo_de_Sesion
01-XX-091025,"Revisar protocolos de certificación para exportación de ganado bovino","M.Sc. Gerardo Solís Pasos (Gobierno del Estado)","2025-10-09","2025-12-01","Pendiente","Vigésima Ordinaria"
```

### 2. Ejecución de Carga en Lote

#### Comando Básico
```bash
# Para acuerdos CESO
node batch-upload-agreements.js --file RUTA/archivo_ceso.csv --type ceso

# Para acuerdos APHIS-USDA
node batch-upload-agreements.js --file RUTA/archivo_aphis.csv --type aphis
```

#### Ejemplos Prácticos
```bash
# Cargar sesión CESO del 9 de octubre 2025
node batch-upload-agreements.js --file TEMPLATES/ceso_sesion_091025.csv --type ceso

# Cargar sesión APHIS del 9 de octubre 2025
node batch-upload-agreements.js --file TEMPLATES/aphis_sesion_091025.csv --type aphis

# Cargar desde directorio personalizado
node batch-upload-agreements.js --file "C:\Sesiones\ceso_noviembre_2025.csv" --type ceso
```

### 3. Interpretación de Resultados

#### Salida Exitosa
```
🚀 CARGA EN LOTE DE ACUERDOS
📁 Archivo: TEMPLATES/ceso_sesion_091025.csv
🏢 Organización: CESO
📅 Fecha: 9/10/2025, 10:27:25 a.m.

📊 Registros encontrados en CSV: 3
🔍 Validando y procesando acuerdos...

✅ [1] CE-YUC-091025-001 - Implementar sistema de trazabilidad...
✅ [2] CE-YUC-091025-002 - Capacitación a productores...
✅ [3] CE-YUC-091025-003 - Actualización de base de datos...

📊 RESUMEN DE CARGA EN LOTE:
   ✅ Acuerdos cargados: 3
   ⚠️ Duplicados omitidos: 0
   ❌ Errores: 0
   📋 Total procesados: 3
   🏢 Colección: acuerdos-ceso

📈 ESTADÍSTICAS:
   - Tasa de éxito: 100.0%
   - Fuente: CESO
   - Timestamp: 2025-10-09T16:27:27.797Z

🎉 Carga en lote completada para CESO
```

#### Manejo de Errores
El sistema maneja automáticamente:
- **Duplicados**: Omite acuerdos con números ya existentes
- **Fechas inválidas**: Convierte formatos diversos a fechas válidas
- **Campos vacíos**: Proporciona valores por defecto
- **Caracteres especiales**: Limpia y normaliza texto

## Formatos de Datos Soportados

### Fechas
El sistema acepta múltiples formatos:
- `2025-10-09` (ISO)
- `10/09/2025` (US)
- `09/10/2025` (EU)
- `2025-10-09T10:30:00Z` (ISO completo)

### Estados Válidos
- `Pendiente` (por defecto)
- `Completado`
- `Vencido`
- `En Proceso`

### Responsables
Formato recomendado: `"Título Nombre Apellidos (Institución)"`
Ejemplo: `"Dr. María González López (Gobierno del Estado)"`

## Plantillas Disponibles

### Ubicación
Las plantillas se encuentran en el directorio `TEMPLATES/`:
- `TEMPLATE_CESO.csv` - Plantilla vacía para CESO
- `TEMPLATE_APHIS.csv` - Plantilla vacía para APHIS-USDA
- `ceso_sesion_091025.csv` - Ejemplo CESO
- `aphis_sesion_091025.csv` - Ejemplo APHIS-USDA

### Uso de Plantillas
1. Copiar plantilla apropiada
2. Renombrar con fecha de sesión: `ceso_sesion_DDMMAA.csv`
3. Llenar datos de la sesión
4. Ejecutar carga en lote

## Mejores Prácticas

### Nomenclatura de Archivos
```
Formato: {organizacion}_sesion_{ddmmaa}.csv
Ejemplos:
- ceso_sesion_091025.csv
- aphis_sesion_151125.csv
- ceso_sesion_extraordinaria_301225.csv
```

### Validación Previa
Antes de la carga masiva:
1. Verificar que números de acuerdo sean únicos
2. Confirmar formato de fechas
3. Validar existencia de responsables en base de datos
4. Revisar ortografía y acentos

### Respaldo
- Mantener archivos CSV como respaldo histórico
- Exportar datos antes de cargas masivas
- Documentar cambios en logs de sesión

## Solución de Problemas

### Error: "Archivo no encontrado"
```bash
# Verificar ruta exacta
ls -la TEMPLATES/
# O en Windows
dir TEMPLATES\
```

### Error: "Tipo de organización inválido"
Usar únicamente:
- `ceso` (minúsculas)
- `aphis` (minúsculas)

### Error: "CSV mal formateado"
- Verificar que el archivo tenga encoding UTF-8
- Confirmar que las columnas estén separadas por comas
- Revisar que no haya saltos de línea dentro de campos

### Error de permisos Firebase
```bash
# Verificar variables de entorno
echo $GOOGLE_APPLICATION_CREDENTIALS
# Verificar conexión a Firebase
firebase projects:list
```

## Integración con Dashboard Web

En futuras versiones, este sistema se integrará directamente en la interfaz web del dashboard, permitiendo:
- Carga de archivos mediante drag & drop
- Vista previa de datos antes de cargar
- Validación en tiempo real
- Reportes visuales de carga

## Contacto Técnico

Para soporte técnico o reportar problemas:
- Revisar logs en `firestore-debug.log`
- Verificar configuración en `.env`
- Consultar documentación de Firebase Admin SDK

---

**Sistema desarrollado para:**
- CESO - Consejo Estatal de Seguimiento Operativo del SINIDA
- APHIS-USDA Working Group
- Gobierno del Estado de Yucatán / SENASICA

**Versión:** 1.0.0  
**Última actualización:** Octubre 2025