// vite.config.js - Configurazione definitiva ottimizzata
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from 'vite-plugin-wasm';
import { resolve } from 'path';

export default defineConfig({
  // Base URL per GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/wdk-multi-chain-web-wallet/' : '/',
  
  plugins: [
    // CRITICAL: Wasm support per TON, tiny-secp256k1, sodium
    wasm(),
    
    // Node.js polyfills per blockchain libraries
    nodePolyfills({
        protocolImports: true,
      
      // Globals necessari
      globals: {
        Buffer: true,
        global: true,
        process: true,
        util: true,  // Fix util.debuglog/inspect warnings
      },
      
      // Include tutti i moduli necessari
      include: [
        'buffer',
        'crypto',
        'stream',
        'util',     // Per readable-stream/hash-base/md5
        'events',
        'net',      // Necessario per alcuni polyfills (ma non usato direttamente in browser)
        'http',
        'https',
      ],
      
      // Non escludere nulla: lascia che Vite gestisca automaticamente
      // exclude: [],
    }),
  ],
  
  // Definizioni globali
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      // Alias per struttura modulare
      '@': resolve(__dirname, './'),
      '@modules': resolve(__dirname, './modules'),
      '@chains': resolve(__dirname, './chains'),
      
      // Alias per TON (risolve import come "@ton/core")
      '@ton/core': resolve(__dirname, 'node_modules/@ton/core'),
      '@ton/crypto': resolve(__dirname, 'node_modules/@ton/crypto'),
      '@ton/ton': resolve(__dirname, 'node_modules/@ton/ton'),
    },
  },
  
  // Ottimizzazioni dependencies
  optimizeDeps: {
    include: [
      'bip39',
      'ethers',
      'qrcode',
      '@tetherto/wdk',
      '@tetherto/wdk-wallet-evm',
      '@tetherto/wdk-wallet-solana',
      '@tetherto/wdk-wallet-ton',
      '@ton/core',
      '@ton/crypto',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  
  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true,
    
    // Rollup options per code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks per migliore caching
          'vendor-wdk': ['@tetherto/wdk'],
          'vendor-crypto': ['bip39', 'ethers'],
          'vendor-ui': ['qrcode'],
          'vendor-ton': ['@ton/core', '@ton/crypto', '@ton/ton'],
        },
      },
    },
    
    // Warning limit per chunking
    chunkSizeWarningLimit: 1000,
    
    // Minification
    minify: 'esbuild',
  },
  
  // Dev server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
    
    // Security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
    
    // Hot Module Replacement
    hmr: {
      overlay: true,
    },
  },
  
  // Preview server (per testing build)
  preview: {
    port: 4173,
    open: true,
  },
});
