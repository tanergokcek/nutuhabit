import { HabitType } from '@/src/types/habit';

export interface HabitTemplate {
  name: string;
  type: HabitType;
  icon: string;
  goalMinutes?: number;
  limitMinutes?: number;
  description: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    name: 'Su İçmek',
    type: 'done',
    icon: '💧',
    description: 'Günlük su içme alışkanlığı',
  },
  {
    name: 'Yürüyüş',
    type: 'time',
    icon: '🏃',
    goalMinutes: 30,
    description: 'Günlük yürüyüş için 30 dakika',
  },
  {
    name: 'Kitap Okumak',
    type: 'time',
    icon: '📖',
    goalMinutes: 20,
    description: 'Her gün 20 dakika kitap okuma',
  },
  {
    name: 'Meditasyon',
    type: 'time',
    icon: '🧘',
    goalMinutes: 15,
    description: 'Günlük 15 dakika meditasyon',
  },
  {
    name: 'Sosyal Medya',
    type: 'bad',
    icon: '📱',
    limitMinutes: 60,
    description: 'Sosyal medya kullanımını günlük 60 dakika ile sınırla',
  },
  {
    name: 'Uyku Düzeni',
    type: 'done',
    icon: '😴',
    description: 'Düzenli uyku saatlerine uy',
  },
  {
    name: 'Ders Çalışmak',
    type: 'time',
    icon: '📚',
    goalMinutes: 45,
    description: 'Günlük 45 dakika ders çalışma',
  },
];

export const HABIT_ICONS = [
  // Fitness & Movement
  'fitness-outline', 'barbell-outline', 'walk-outline', 'bicycle-outline',
  'body-outline', 'football-outline',
  // Health & Wellness
  'water-outline', 'leaf-outline', 'heart-outline', 'pulse-outline',
  'medical-outline', 'shield-checkmark-outline',
  // Mind & Sleep
  'moon-outline', 'sunny-outline', 'partly-sunny-outline', 'bed-outline',
  'eye-outline', 'happy-outline',
  // Learning & Work
  'book-outline', 'school-outline', 'laptop-outline', 'code-slash-outline',
  'bulb-outline', 'pencil-outline',
  // Creative & Hobby
  'brush-outline', 'camera-outline', 'musical-notes-outline', 'headset-outline',
  'game-controller-outline', 'color-palette-outline',
  // Goals & Motivation
  'star-outline', 'trophy-outline', 'rocket-outline', 'flash-outline',
  'ribbon-outline', 'flame-outline',
  // Lifestyle
  'restaurant-outline', 'cafe-outline', 'home-outline', 'briefcase-outline',
  'wallet-outline', 'people-outline',
  // Bad Habits
  'wine-outline', 'beer-outline', 'fast-food-outline', 'logo-no-smoking',
  'skull-outline', 'tv-outline', 'phone-portrait-outline', 'cash-outline',
  'warning-outline', 'sad-outline',
];
