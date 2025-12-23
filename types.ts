
export interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icons: string[];
}

export interface StorySlide {
  image: string;
  videoUrl?: string;
  text: string;
}

export interface ReviewStory {
  id: string;
  username: string;
  avatar: string;
  slides: StorySlide[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface CaseMetric {
  value: string;
  label: string;
}

export interface CaseStudy {
  id: string;
  companyName: string;
  companyDescription: string;
  title: string;
  highlight: string; // часть заголовка цветом (напр. "ЗА 7 МЕСЯЦЕВ")
  tags: string[]; // для фильтрации
  tasks: string[];
  metrics: CaseMetric[];
  imageUrl?: string; // опционально картинка/график
}
