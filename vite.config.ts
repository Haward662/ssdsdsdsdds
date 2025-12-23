
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Загружаем переменные из .env файлов в корне проекта
    const env = loadEnv(mode, process.cwd(), '');
    
    // Определяем приоритет: сначала ищем API_KEY (стандарт для контейнеров), 
    // затем GEMINI_API_KEY (стандарт для локальной разработки)
    const apiKey = env.API_KEY || env.GEMINI_API_KEY || process.env.API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Явно прокидываем переменную в глобальную область видимости браузера
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      build: {
        outDir: 'dist',
        sourcemap: false
      }
    };
});
