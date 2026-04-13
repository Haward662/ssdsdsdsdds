## 3. Работа с NeuroAPI (neuroapi.host)

`neuroapi.host` — это российский шлюз-балансировщик.

**КРИТИЧЕСКИЕ ПРАВИЛА:**

1. **Никаких прокси на сервере:** Для запросов к NeuroAPI не нужно использовать `https-proxy-agent`, WARP или другие обходы. Сервис принимает запросы с белых российских IP (наш Timeweb) напрямую.
    
2. **Базовый URL:** Ошибка `403 Country, region, or territory not supported` возникает из-за стука в оригинальные эндпоинты заблокированных моделей. При инициализации клиента (через OpenAI SDK или fetch) **всегда** жестко переопределяй `baseURL` на `https://neuroapi.host/v1`. ⚠️ Домен `api.neuroapi.host` **НЕ существует** (NXDOMAIN) — только `neuroapi.host`.
    
3. Токен авторизации передается стандартно в заголовке `Authorization: Bearer <token>`.
   
   документация - https://neuroapi.host/docs/getting-started