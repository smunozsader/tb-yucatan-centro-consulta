# Centro de Consulta de Acuerdos Sanitarios

**Sistema desarrollado por la Representación de la Secretaría de Agricultura y Desarrollo Rural (Gobierno Federal Mexicano) en Yucatán**

🚀 **Live Application**: https://tb-yucatan.web.app/

## 🎯 Project Purpose

Centro de gestión para dos grupos colegiados especializados en sanidad pecuaria estatal:

- 🏢 **CESO** - Consejo Estatal de Seguimiento Operativo del SINIDA (NOM-001-SAG/GAN-2015)
- 🇺🇸 **Grupo de Trabajo APHIS-USDA/SENASICA** para control de tuberculosis bovina y exportación de semovientes

## ✨ Features

### Public Access
- 🔍 Search agreements by number or description
- 🎛 Filter by status (Pendiente, Completado, Vencidos)
- 👁 View complete agreement details
- 📂 Evidence viewing and download from Dashboard
- 📚 Official document consultation
- 🌐 Bilingual support (Spanish ↔ English)
- 📱 Fully responsive mobile design

### Restricted Access (Admin/Responsible)
- 📎 Evidence upload system (PDF, JPG, PNG, Word)
- ✅ Agreement completion marking
- 📧 Meeting notification system
- 📋 Institutional templates (CESO & APHIS-USDA)

## 🛠 Technology Stack

- **Frontend**: React with React Router v7.8.0
- **Hosting**: Firebase (project: tb-yucatan)
- **Styling**: Government design system (gob.mx v3) + Custom CSS
- **Data**: Excel databases (APHIS USDA, CESO)
- **Framework**: Official Mexican Government framework integration

## 🏗 Project Structure

```
├── index.html              # Main entry with gob.mx framework
├── static/                 # Compiled production assets
│   ├── css/main.{hash}.css # Compiled styles
│   └── js/main.{hash}.js   # Compiled React bundle
├── __/firebase/            # Firebase configuration
├── BASES DATOS/           # Excel databases
└── .github/               # GitHub configuration & AI instructions
```

## 🎨 Government Design System

Built with official Mexican government standards:
- Colors: `--color-gobierno-principal: #611232`, `--color-gobierno-secundario: #9d2449`
- Typography: Patria (headers), Noto Sans (body)
- Components: `.btn-gobierno-*`, `.card-gobierno`, `.table-gobierno`

## 🚦 Development Status

This repository contains the **production-deployed compiled version**. The original React source code was lost due to hard drive failure and is being reconstructed.

## 📝 Version History

- **v2.5.0**: Evidence viewing system in Dashboard
- **v2.3.1**: Simplified institutional templates

## 🤝 Contributing

This is a government project for the state of Yucatan, Mexico. Development follows official government standards and accessibility requirements.

## 📄 License

Government of Mexico - Secretaría de Agricultura y Desarrollo Rural