import { Service, ReviewStory, NavLink } from './types';

export const NAV_LINKS: NavLink[] = [
  { label: 'Услуги', href: '#services' },
  { label: 'Клуб', href: '#club' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Блог', href: '#/blog' },
  { label: 'Контакты', href: '#contact' },
];

export const SERVICES: Service[] = [
  {
    id: 'vk',
    title: 'ВКонтакте под ключ',
    description: 'Полное управление: контент, рассылки, чат-боты и таргет для максимальных продаж.',
    icon: '📱',
  },
  {
    id: 'yandex',
    title: 'Яндекс Директ',
    description: 'Горячий трафик из поиска и сетей. Оптимизация стоимости заказа (CPA).',
    icon: '🎯',
  },
  {
    id: 'target',
    title: 'Таргет',
    description: 'Точечная настройка рекламы на вашу целевую аудиторию в соцсетях.',
    icon: '⚡',
  },
  {
    id: 'geo',
    title: 'Геомаркетинг',
    description: 'Доминирование в 2ГИС и Яндекс Картах. Собираем всех, кто ищет еду рядом.',
    icon: '📍',
  },
  {
    id: 'retention',
    title: 'Работа с базой',
    description: 'Возвращаем клиентов через рассылки и автопрозвоны. Увеличиваем LTV.',
    icon: '🔄',
  },
  {
    id: 'vibe-coding',
    title: 'Вайб кодинг',
    description: 'Разработка умных чат-ботов и игровых механик для вовлечения аудитории.',
    icon: '💻',
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
        text: 'Данил, здравствуйте! Хотела благодарность выразить и похвалить, что активность хорошо подросла! 🙏',
      },
      {
        image: 'https://i.ibb.co/0yDSx7hh/3.jpg',
        text: 'Продолжайте в том же духе! Результаты очень радуют команду. ❤️',
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
        videoUrl: 'отзыв марина.mp4',
        text: 'Видео-отзыв от Марины: результаты работы за прошлый месяц! ❤️',
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
        text: 'Положительная динамика по всем каналам трафика. Работаем дальше!',
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
        text: 'За первый месяц сотрудничества увеличили количество заказов в 2 раза.',
      }
    ]
  }
];