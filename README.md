# React + Vite

## Environment Variables

Create a local `.env.local` from `.env.example` for development. Vite only exposes
variables prefixed with `VITE_` to the browser bundle.

For Vercel deployments, add the same variable in the Vercel dashboard under
Project Settings > Environment Variables:

```dotenv
VITE_API_BASE_URL=/api
VITE_APP_ENV=production
VITE_API_WITH_CREDENTIALS=false
```

`.env.local` is intentionally not committed and is not uploaded to Vercel. If you
use the root-relative `/api` path in production, `vercel.json` rewrites those
requests to `https://test-api.meralot.com` so browser requests stay same-origin
and avoid CORS failures.

If you point `VITE_API_BASE_URL` directly to a different origin, keep
`VITE_API_WITH_CREDENTIALS=false` unless the backend returns both a specific
`Access-Control-Allow-Origin` value and `Access-Control-Allow-Credentials: true`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
