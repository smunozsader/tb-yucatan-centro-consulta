Ventanillas Movilizaciones - Data ingest template

Place monthly or quarterly movilizaciones exports (CSV or Excel) in this folder. Prefer the following pattern and format to make ingestion reliable.

Filename pattern
----------------
{ventanilla}-{YYYY}-{MM}-{source}.csv
Examples:
- ventanilla_merida-2025-09-ppt-extract.csv
- ventanilla_progreso-2025-09-manual.csv

Sheet / CSV layout (recommended)
-------------------------------
Use a single table per file containing the relevant rows. Keep column headers on the first row. Recommended columns:
- ventanilla: short identifier (e.g., ventanilla_merida)
- year: 4-digit year (e.g., 2025)
- month: 2-digit month (01..12)
- table_type: movilizaciones_general | por_municipio | por_especie | time_series
- municipio: name (when applicable)
- origen_destino: 'origen' or 'destino' or specific locality
- especie: species name (e.g., Bovino, Ovino)
- cantidad: numeric count

If your PowerPoint tables have a different layout, extract the tables into Excel and map columns to the recommended headers. If needed, include an extra column 'notes' for free text.

Accepted file types
-------------------
- .csv (preferred for uploads)
- .xlsx / .xls (Excel) - save as single-sheet with header row

Next steps for me (when files are present)
-----------------------------------------
- I can add a small parser script to normalize these files and save them to Firestore under `movilizaciones/{year}/{month}/{ventanilla}`.
- I can also scaffold the upload UI and a server endpoint to accept and parse the files.

If you want, drop a sample Excel or CSV here tomorrow and I'll parse it and show a preview of the normalized JSON.
