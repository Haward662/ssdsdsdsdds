export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
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