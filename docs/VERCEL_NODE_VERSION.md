# Vercel Node Version

The beta builds with Node.js `20.18.0` locally and in CI. Vercel should use the Node.js `20.x` setting in Project Settings before the first production deployment.

`package.json` declares the supported runtime range and `.nvmrc` pins the local development version. The Vite build generates no production source maps, and the application does not require environment variables or server-side secrets.
