# Quick Start Guide

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   - Navigate to `http://localhost:3000`
   - The website will automatically reload on file changes

## Project Structure Overview

```
SAi/
├── src/
│   ├── components/          # All reusable UI components
│   │   ├── Banner/         # Top announcement banner
│   │   ├── Header/         # Navigation header with language switcher
│   │   ├── Hero/           # Main hero section
│   │   ├── Features/      # Feature cards grid
│   │   ├── ProblemSection/ # Problem statement section
│   │   ├── ImpactSection/  # Impact showcase
│   │   ├── CTASection/     # Call-to-action section
│   │   └── Footer/         # Footer with links
│   ├── pages/              # Page components
│   ├── i18n/               # Translation files (5 languages)
│   └── styles/             # Global CSS and variables
```

## Key Features

### 🌐 Multi-Language Support
- Switch between 5 languages using the dropdown in header
- Languages: English, Hindi, Gujarati, Tamil, Marathi
- Language preference saved in browser localStorage

### 🎨 Design System
- Color scheme inspired by Sarvam.ai
- Orange/Peach primary colors
- Beige background tones
- Clean, modern Indian-focused design

### 📱 Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly navigation

## Customization

### Adding New Translations
1. Open `src/i18n/locales/[language].json`
2. Add or modify translation keys
3. Use `t('key.path')` in components

### Modifying Colors
1. Edit CSS variables in `src/styles/global.css`
2. Update `:root` variables
3. All components use these variables

### Adding New Components
1. Create folder in `src/components/[ComponentName]/`
2. Add `ComponentName.jsx` and `ComponentName.css`
3. Export from `src/components/index.js`
4. Import and use in pages

## Build for Production

```bash
npm run build
```

Output will be in `dist/` folder, ready for deployment.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Port Already in Use
Change port in `vite.config.js`:
```js
server: {
  port: 3001  // Change to available port
}
```

### Language Not Switching
- Clear browser localStorage
- Check browser console for errors
- Verify translation files are valid JSON

### Styles Not Loading
- Check CSS file imports
- Verify CSS variable names match
- Clear browser cache

## Next Steps

1. Customize content in translation files
2. Add your logo/branding
3. Update footer links
4. Add analytics tracking
5. Deploy to hosting platform

