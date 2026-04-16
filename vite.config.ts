import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: {
    // @ts-expect-error - Vite 8 native support (types may not be updated yet)
    tsconfigPaths: true,
  },
  plugins: [
    devtools(),
    nitro(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
