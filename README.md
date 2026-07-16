# Browser PDF Editor

A serverless PDF editor built with full-stack JavaScript. Edit PDFs directly in your browser with no backend installation required.

## Features

- Browser-based PDF editing
- Serverless architecture (Vercel/Netlify compatible)
- Real-time editing
- Export to PDF

## Tech Stack

- **Frontend**: React, TypeScript
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify
- **Runtime**: Node.js 18+

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/browser_pdf_editor.git
cd browser_pdf_editor

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview  # Test production build locally
```

## Environment Variables

See [.env.example](.env.example) for all available options.

**Important**: Never commit `.env` files with real secrets. Use:
- **Vercel**: Dashboard > Settings > Environment Variables
- **Netlify**: Site Settings > Build & Deploy > Environment

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Vercel auto-deploys on every push to main

### Netlify

1. Push code to GitHub
2. Connect repository to [Netlify](https://netlify.com)
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Testing

```bash
# Run integration tests
npm run test

# Run with coverage
npm run test:coverage
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## Security

- Never commit `.env` files with secrets
- Use deployment platform's environment variable management
- Review [SECURITY.md](SECURITY.md) for security guidelines

## License

MIT

## Support

For issues or questions, open an issue on GitHub.
