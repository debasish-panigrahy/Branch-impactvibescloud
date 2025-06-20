// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'node:path'
// import autoprefixer from 'autoprefixer'

// export default defineConfig(() => {
//   return {
//     base: './',
//     build: {
//       outDir: 'dist',
//     },
//     publicDir: 'public',
//     css: {
//       postcss: {
//         plugins: [
//           autoprefixer({}), // add options if needed
//         ],
//       },
//     },
//     esbuild: {
//       loader: 'jsx',
//       include: /src\/.*\.jsx?$/,
//       exclude: [],
//     },
//     optimizeDeps: {
//       force: true,
//       esbuildOptions: {
//         loader: {
//           '.js': 'jsx',
//         },
//       },
//     },
//     plugins: [react()],
//     resolve: {
//       alias: [
//         {
//           find: 'src/',
//           replacement: `${path.resolve(__dirname, 'src')}/`,
//         },
//       ],
//       extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
//     },
//     server: {
//       host: '0.0.0.0',
//       port: process.env.PORT || 5030,
//       allowedHosts: 'all'
//     },
//   }
// })



import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    base: '/', // ✅ Use `/` instead of `./` for correct routing on Vercel
    build: {
      outDir: 'dist', // ✅ Default Vercel expects
    },
    publicDir: 'public',
    css: {
      postcss: {
        plugins: [
          autoprefixer(),
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      host: '0.0.0.0',
      port: process.env.PORT || 5030,
      allowedHosts: 'all'
    },
  }
})