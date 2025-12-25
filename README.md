# SwasthyaAI Website

A modern, multilingual website for SwasthyaAI - Smart Voice + Agentic Health Assistant for India.

## Features

- 🌐 **Multi-language Support**: English, Hindi, Gujarati, Tamil, and Marathi
- 🎨 **Clean UI Design**: Inspired by Sarvam.ai with Indian-focused theme
- 📱 **Responsive Design**: Mobile-first approach, works on all devices
- ⚡ **Fast Performance**: Built with Vite for optimal loading speeds
- 🎯 **Business-Focused**: Clear value propositions and customer attraction

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **i18next** - Internationalization framework
- **CSS3** - Custom styling with CSS variables

## Project Structure

```
SAi/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Banner/
│   │   ├── Header/
│   │   ├── LanguageSwitcher/
│   │   ├── Hero/
│   │   ├── ValueProposition/
│   │   ├── Features/
│   │   ├── ProblemSection/
│   │   ├── ImpactSection/
│   │   ├── CTASection/
│   │   └── Footer/
│   ├── pages/                # Page components
│   │   └── HomePage.jsx
│   ├── i18n/                 # Internationalization
│   │   ├── config.js
│   │   └── locales/
│   │       ├── en.json
│   │       ├── hi.json
│   │       ├── gu.json
│   │       ├── ta.json
│   │       └── mr.json
│   ├── styles/               # Global styles
│   │   ├── global.css
│   │   └── App.css
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Language Support

The website supports 5 languages:
- English (en)
- Hindi (hi)
- Gujarati (gu)
- Tamil (ta)
- Marathi (mr)

Users can switch languages using the language switcher in the header. The selected language is saved in localStorage.

## Design System

### Colors

- **Primary**: Orange/Peach (#FF6B35) - Inspired by Sarvam.ai
- **Background**: Beige tones (#F5F1EB, #FAF8F5)
- **Text**: Dark gray (#2C2C2C) for primary text
- **Footer**: Dark olive green (#3A4A3C)

### Typography

- **Font Family**: System fonts for optimal performance
- **Headings**: Bold (700 weight)
- **Body**: Regular (400 weight)

## Components

All components are modular and reusable:
- Each component has its own folder with `.jsx` and `.css` files
- Components use CSS variables for theming
- Responsive design built-in

## Contributing

1. Follow the existing code structure
2. Maintain component modularity
3. Keep translations updated for all languages
4. Test responsive design on multiple devices

## License

Copyright 2025 SwasthyaAI. All rights reserved.

