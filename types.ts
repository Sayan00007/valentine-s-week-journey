export enum ValentineDay {
  ROSE = 'rose',
  PROPOSE = 'propose',
  CHOCOLATE = 'chocolate',
  TEDDY = 'teddy',
  PROMISE = 'promise',
  HUG = 'hug',
  KISS = 'kiss',
  VALENTINE = 'valentine'
}

export interface DayConfig {
  id: ValentineDay;
  title: string;
  date: string;
  description: string;
  color: string;
  accent: string;
  icon: string;
  image: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedImage {
  url: string;
  prompt: string;
  size: ImageSize;
}
