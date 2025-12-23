
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
        image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&q=80&w=400&h=700',
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
    id: 'ktk',
    companyName: 'KTK',
    companyDescription: 'Костромская текстильная компания',
    title: 'ВЫСТРАИВАНИЕ ОТДЕЛА МАРКЕТИНГА',
    highlight: 'ЗА 7 МЕСЯЦЕВ',
    tags: ['Комплексный маркетинг'],
    tasks: [
      'Проведены интервью с клиентами',
      'Внедрена сквозная аналитика',
      'Разработана стратегия узнаваемости бренда среди швейных компаний',
      'Подключены каналы — SEO, SMM, контекстная реклама, конференции'
    ],
    metrics: [
      { value: '100', label: 'ОБРАЩЕНИЙ B2B В МЕСЯЦ' },
      { value: '67 МЛН', label: 'ПРИБЫЛЬ' }
    ]
  },
  {
    id: 'dr-mun',
    companyName: 'DR.MUN',
    companyDescription: 'Стоматологическая клиника Dr. Mun',
    title: 'ВЫСТРАИВАНИЕ ОТДЕЛА МАРКЕТИНГА',
    highlight: 'ЗА 8 МЕСЯЦЕВ',
    tags: ['Комплексный маркетинг', 'SMM'],
    tasks: [
      'Разработка стратегии продвижения компании',
      'Разработка brand book и сайта',
      'Упаковка всех интернет ресурсов',
      'Запуск каналов привлечения — SMM, блогеры, SEO и контекстная реклама'
    ],
    metrics: [
      { value: '600', label: 'ЗАЯВОК В МЕСЯЦ' },
      { value: '28 МЛН', label: 'ПРИБЫЛЬ КОМПАНИИ' }
    ]
  },
  {
    id: 'uniprof',
    companyName: 'UNIPROF',
    companyDescription: 'Международная академия интегративных врачей',
    title: 'РАЗРАБОТКА И ПРОДВИЖЕНИЕ',
    highlight: 'ОНЛАЙН-КУРСА',
    tags: ['Разработка сайта', 'CRM и аналитика'],
    tasks: [
      'Проведены исследования для снижения сроков и рекламного бюджета',
      'Разработана программа курса и сайт',
      'Стратегия продвижения',
      'Запуск каналов привлечения клиентов'
    ],
    metrics: [
      { value: '160', label: 'ЗАКАЗОВ' },
      { value: '4,5 МЛН', label: 'ПРИБЫЛЬ' }
    ]
  },
  {
    id: 'cho',
    companyName: 'Chō',
    companyDescription: 'Ресторан Chō',
    title: 'УВЕЛИЧЕНИЕ УЗНАВАЕМОСТИ',
    highlight: 'И ПРИВЛЕЧЕНИЕ КЛИЕНТОВ',
    tags: ['Карты и агрегаторы', 'Креативный маркетинг'],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=400', 
    tasks: [
      'Подключены каналы привлечения — Яндекс карты, 2ГИС, Google maps',
      'Разработан сайт для получения брони'
    ],
    metrics: [
      { value: '58%', label: 'РОСТ ЗВОНКОВ' },
      { value: '588', label: 'ЗВОНКОВ В МЕСЯЦ' }
    ]
  }
];
