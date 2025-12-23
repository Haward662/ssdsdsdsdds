
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Загружаем переменные из всех .env файлов
    const env = loadEnv(mode, process.cwd(), '');
    
    // Собираем ключ из всех возможных источников
    const apiKey = env.VITE_API_KEY || env.GEMINI_API_KEY || env.API_KEY || process.env.API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Прокидываем в браузер под разными именами для совместимости
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.VITE_API_KEY': JSON.stringify(apiKey)
      },
      build: {
        outDir: 'dist',
        sourcemap: false
      }
    };
});
