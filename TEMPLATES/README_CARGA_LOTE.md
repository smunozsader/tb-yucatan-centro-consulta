# 📋 GUÍA PARA CARGA EN LOTE DE ACUERDOS

## 🎯 Propósito
Sistema para cargar múltiples acuerdos de una sesión de manera eficiente usando archivos CSV.

## 📁 Templates Disponibles
- `template_acuerdos_ceso.csv` - Para acuerdos CESO
- `template_acuerdos_aphis.csv` - Para acuerdos APHIS-USDA

## 📊 Estructura de Campos

### Campos Requeridos:
1. **Numero_de_Acuerdo** - Identificador único del acuerdo
2. **Descripcion_del_Acuerdo** - Texto completo del acuerdo
3. **Responsable_del_Seguimiento** - Persona encargada del seguimiento
4. **Fecha_de_Reunion** - Fecha de la reunión (formato: YYYY-MM-DD)
5. **Fecha_de_Cumplimiento** - Fecha límite de cumplimiento (formato: YYYY-MM-DD)
6. **Estado** - Estado actual: `Pendiente`, `Completado`, `Vencidos`
7. **Tipo_de_Sesion** - Tipo de sesión donde se generó

### Patrones de Numeración:
- **CESO**: `CE-YUC-DDMMYY-NNN` (ej: CE-YUC-091025-001)
- **APHIS**: `NN-SESION-DDMMYY` (ej: 01-XX-091025)

### Estados Válidos:
- `Pendiente` - Acuerdo en proceso
- `Completado` - Acuerdo cumplido
- `Vencidos` - Acuerdo no cumplido en tiempo

### Tipos de Sesión Comunes:
**CESO:**
- Ordinaria
- Extraordinaria
- Instalación
- Seguimiento

**APHIS:**
- Primera Ordinaria
- Segunda Ordinaria
- Extraordinaria
- Seguimiento

## 🚀 Uso del Sistema

### 1. Preparar CSV:
1. Copiar template correspondiente
2. Completar datos de la sesión
3. Guardar con nombre descriptivo: `ceso_sesion_DDMMYY.csv` o `aphis_sesion_DDMMYY.csv`

### 2. Cargar Datos:
```bash
# Cargar acuerdos CESO
node batch-upload-agreements.js --file TEMPLATES/ceso_sesion_091025.csv --type ceso

# Cargar acuerdos APHIS
node batch-upload-agreements.js --file TEMPLATES/aphis_sesion_091025.csv --type aphis
```

### 3. Verificación:
- El script validará formato de fechas
- Verificará unicidad de números de acuerdo
- Creará backup automático
- Reportará errores y éxitos

## ⚠️ Consideraciones Importantes

### Formato de Fechas:
- Usar formato ISO: `YYYY-MM-DD`
- Ejemplos válidos: `2025-10-09`, `2025-12-31`

### Números de Acuerdo:
- Deben ser únicos en todo el sistema
- Seguir patrones establecidos por organización
- No usar caracteres especiales excepto guiones

### Texto de Descripción:
- Evitar comillas dobles dentro del texto
- Para comillas usar comillas simples
- Máximo 500 caracteres recomendado

### Responsables:
- Incluir título profesional
- Especificar institución entre paréntesis
- Mantener consistencia en nombres

## 🔧 Solución de Problemas

### Error: "Número de acuerdo duplicado"
- Verificar que el número no exista en la base
- Usar numeración secuencial

### Error: "Fecha inválida"
- Verificar formato YYYY-MM-DD
- Verificar que la fecha sea válida

### Error: "Estado inválido"
- Usar solo: Pendiente, Completado, Vencidos
- Verificar mayúsculas y minúsculas

## 📞 Soporte
Para problemas técnicos contactar al administrador del sistema.