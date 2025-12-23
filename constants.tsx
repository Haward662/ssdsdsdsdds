
import { Service, ReviewStory, NavLink, CaseStudy } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Кейсы', href: '#cases' },
  { label: 'Услуги', href: '#services' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Контакты', href: '#contact' },
];

export const SERVICES: Service[] = [
  {
    id: 'smm',
    title: 'SMM',
    subtitle: 'Телеграмм, Вконтакте, Одноклассники, Youtube, Tik tok',
    description: 'Комплексное ведение соцсетей для создания лояльного комьюнити и регулярных продаж через контент.',
    icons: [
      'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/f/f3/VK_Compact_Logo_%282021-present%29.svg',
      'https://upload.wikimedia.org/wikipedia/commons/2/22/OK_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      'https://www.svgrepo.com/show/333611/tiktok.svg'
    ],
  },
  {
    id: 'context',
    title: 'КОНТЕКСТНАЯ РЕКЛАМА',
    subtitle: 'Google, Яндекс',
    description: 'Привлекаем горячих клиентов, которые ищут доставку еды прямо сейчас в поисковых системах.',
    icons: [
      'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c3/Yandex_logo_2021.svg'
    ],
  },
  {
    id: 'target',
    title: 'ТАРГЕТИРОВАННАЯ РЕКЛАМА',
    subtitle: 'Телеграмм, Вконтакте, Одноклассники, MyTarget',
    description: 'Настраиваем точный захват аудитории по интересам, геолокации и поведению в социальных сетях.',
    icons: [
      'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/f/f3/VK_Compact_Logo_%282021-present%29.svg',
      'https://upload.wikimedia.org/wikipedia/commons/2/22/OK_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/5/52/Mail.ru_logo_2024.svg'
    ],
  },
  {
    id: 'vibe-coding',
    title: 'ВАЙБ КОДИНГ',
    subtitle: 'Автоматизация, Геймификация, Розыгрыши',
    description: 'Автоматизация индивидуальных решений, создание уникальных геймификаций и розыгрышей для взрывного роста охватов и лояльности.',
    icons: [
      'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg'
    ],
  },
  {
    id: 'geo',
    title: 'ГЕОМАРКЕТИНГ',
    subtitle: '2ГИС, Яндекс Карты, Google Maps',
    description: 'Доминирование в локальном поиске. Собираем всех, кто ищет еду рядом с вашим заведением.',
    icons: [
      'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c3/Yandex_logo_2021.svg'
    ],
  },
  {
    id: 'crm',
    title: 'РАБОТА С БАЗОЙ',
    subtitle: 'Рассылки, CRM, Автопрозвоны',
    description: 'Возвращаем клиентов и увеличиваем LTV. Работаем с вашей текущей базой для повторных заказов.',
    icons: [
      'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'
    ],
  }
];

export const REVIEWS: ReviewStory[] = [
  {
    id: 'anna-yammi',
    username: 'Анна Ямми',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    slides: [
      {
        image: 'https://i.ibb.co/jkPSzrR8/2025-12-22-10-54-01.jpg',
        text: '',
      }
    ]
  },
  {
    id: 'marina',
    username: 'Марина',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
    slides: [
      {
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://kinescope.io/embed/ht1Dnzhiq2F1XVbMg3LijD',
        text: '',
      }
    ]
  },
  {
    id: 'king-perm',
    username: 'Кинг Пермь',
    avatar: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=150&h=150',
    slides: [
      {
        image: 'https://i.ibb.co/wrYChWkt/image.jpg',
        text: '',
      }
    ]
  },
  {
    id: 'krasnokamsk',
    username: 'Доставка Краснокамск',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=150&h=150',
    slides: [
      {
        image: 'https://i.ibb.co/8DQ4LwVq/image.jpg',
        text: '',
      }
    ]
  }
];

export const CASES: CaseStudy[] = [
  {
    id: 'halal-butik',
    companyName: 'Halal Butik',
    companyDescription: 'Халяль-доставка еды',
    title: '183 НОВЫХ КЛИЕНТА',
    highlight: 'ЗА МЕСЯЦ',
    tags: ['Комплексный маркетинг'],
    tasks: [
      'Таргетированная реклама ВКонтакте',
      'Персональные рассылки по базе',
      'Проработка офферов и акций',
      'Автоворонка повторных касаний'
    ],
    metrics: [
      { value: '183', label: 'НОВЫХ КЛИЕНТА' },
      { value: '78 ₽', label: 'ЦЕНА КЛИЕНТА' }
    ],
    linkUrl: 'https://vk.com/@proboostsmm-keis-183-novyh-klientov-dlya-dostavki-edy-za-mesyac'
  },
  {
    id: 'okto-pizza',
    companyName: 'Okto Pizza',
    companyDescription: 'Доставка пиццы',
    title: 'ЗАПУСК С НУЛЯ',
    highlight: '500К ОБОРОТ',
    tags: ['Запуск под ключ'],
    tasks: [
      'Упаковка сообщества ВКонтакте',
      'Запуск таргетированной рекламы',
      'Посевы в локальных сообществах',
      'Рассылки для возврата клиентов'
    ],
    metrics: [
      { value: '500К', label: 'ОБОРОТ 1 МЕСЯЦ' },
      { value: 'Flow', label: 'СТАБИЛЬНЫЙ ПОТОК' }
    ],
    linkUrl: 'https://vk.com/@-210647270-keis-kak-otkrylis-i-za-pervyi-mesyac-sdelali-oborot-v-500tys'
  },
  {
    id: 'sushi-34',
    companyName: 'Суши 34',
    companyDescription: 'Доставка суши и роллов',
    title: '220 НОВЫХ КЛИЕНТОВ',
    highlight: 'РОСТ ЧЕКА',
    tags: ['Трафик + работа с базой'],
    tasks: [
      'Таргет ВКонтакте',
      'Персональные рассылки',
      'Акции на первый заказ',
      'Работа с ушедшими клиентами'
    ],
    metrics: [
      { value: '220', label: 'НОВЫХ КЛИЕНТОВ' },
      { value: '1600 ₽', label: 'СРЕДНИЙ ЧЕК' }
    ],
    linkUrl: 'https://teletype.in/@proboost/ZlmmSvwmpZF'
  },
  {
    id: 'king-rolls',
    companyName: 'King Rolls',
    companyDescription: 'Доставка роллов',
    title: 'ВОЗВРАТ КЛИЕНТОВ',
    highlight: 'ROI 850%',
    tags: ['CRM и работа с базой'],
    tasks: [
      'Сегментация клиентской базы',
      'Персональные рассылки ВКонтакте',
      'Триггерные офферы',
      'Аналитика возвратов'
    ],
    metrics: [
      { value: '44 800', label: 'ВЫРУЧКА С РАССЫЛКИ' },
      { value: '850%', label: 'ROI' }
    ],
    linkUrl: 'https://teletype.in/@proboost/xFMDVIBbSYo'
  }
];
