# Ventanilla Movilizaciones - Normalized Data Model

This schema covers all main table types found in the Excel files. Each sheet is mapped to a collection or subcollection in Firestore, and to a JSON structure for UI and reporting.

---
## 1. registros_de_PGN
- **Purpose:** Summary of service registrations (PGN, UPP, PSG, PG) by type and month.
- **Schema:**
```json
{
  "fecha": "2025-01-31", // or month string
  "tipo": "Altas" | "Actualizaciones", // row 2, 3, etc.
  "UPP": 37,
  "PSG": 16,
  "PG_Equidos": 0,
  "PG_Ganado": 0
}
```
- **One object per row, per month, per type.**

---
## 2. altas_de_UPP / altas_de_PSG / ACTUALIZACIONES_DE_UPP
- **Purpose:** Matrix: ventanilla x month, with "Acumulado".
- **Schema:**
```json
{
  "ventanilla": "VAS TIZIMIN",
  "monthly": {
    "2025-01": 26,
    "2025-02": 35,
    ...
    "2025-09": 10
  },
  "acumulado": 219
}
```
- **One object per ventanilla.**

---
## 3. Inventario_Otras_Especies
- **Purpose:** Inventory by species.
- **Schema:**
```json
{
  "especie": "Bovinos",
  "altas": 204,
  "inventario_altas": 3394,
  "actualizaciones": 4185,
  "inventario_act": 155815
}
```

---
## 4. Atencion_UPP_Por_Especie
- **Purpose:** UPP status by species.
- **Schema:**
```json
{
  "especie": "Bovinos",
  "upp_vigentes": 7309,
  "upp_suspendidas": 1167,
  "upp_actualizadas": 3632,
  "avance": 0.4969
}
```

---
## 5. Identificadores_Capturados / Barrido
- **Purpose:** Monthly identifiers by UPP.
- **Schema:**
```json
{
  "mes": "2025-01",
  "upp": 320,
  "solicitados": 4908,
  "entregados": 4908,
  "devueltos": 0,
  "capturados": 4908,
  "avance": 1.0
}
```

---
## 6. Prestadores_de_Servicios_Ganade
- **Purpose:** Service provider summary by activity/type.
- **Schema:**
```json
{
  "actividad": "Engordador",
  "tipo": "P01",
  "historico": 1403,
  "opinion_positiva": 770,
  "proceso_concluido": 672,
  "nuevo_ingreso": 174
}
```

---
## 7. Identificadores_Recuperados_en_R / Identific_Ord_Matanza_Docs_CO
- **Purpose:** Monthly/totals by rastro or order.
- **Schema:**
```json
{
  "rastro": "VAS TIZIMIN",
  "monthly": {
    "2025-01": 3221,
    ...
    "2025-09": 2851
  },
  "total": 25874
}
```

---
## 8. identificadores_disponibles
- **Purpose:** Available identifiers by ventanilla/species.
- **Schema:**
```json
{
  "ventanilla": "VAS Tizimín",
  "bovino": 9554,
  "ovino": 411,
  ...
}
```

---
## 9. informe_individua_TIA / informe_individua_PIA
- **Purpose:** Individual identifier assignments.
- **Schema:**
```json
{
  "clave": 3087,
  "nombre": "MARTIN ANTONIO TORRES HERRERA",
  "upp": 344,
  "ids": 5683,
  "devueltos": 12
}
```

---
## 10. INFORME_REEMO
- **Purpose:** Movilizaciones by destination and month.
- **Schema:**
```json
{
  "destino": "1. Rastro en Yucatán",
  "guias": {
    "2025-01": 475,
    ...
    "2025-05": 452
  }
}
```

---

**All schemas can be extended with extra fields as needed.**
- Dates should be normalized to `YYYY-MM` or `YYYY-MM-DD`.
- All numbers as numbers, not strings.
- For sheets with summary rows (TOTAL), add a `type: 'total'` field or skip in Firestore.

---

Next: I will create a parser script to convert your Excel files into this schema.