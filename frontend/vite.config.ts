import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A API libera CORS para http://localhost:5173 e http://localhost:3000 (appsettings.Development.json).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
})
