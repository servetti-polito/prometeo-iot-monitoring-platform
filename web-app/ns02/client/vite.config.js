import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), dynamicImport()],
  server: {
    host: '127.0.0.1',
    port: 3000
  }
})