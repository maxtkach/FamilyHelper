export const COLORS = {
  primary: '#6C5CE7',
  secondary: '#A8A4E6',
  success: '#4CAF50',
  danger: '#FF7675',
  warning: '#FFA726',
  info: '#74B9FF',
  light: '#F5F5F5',
  dark: '#2D3436',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#B2BEC3',
  grayLight: '#E5E5E5',
  grayDark: '#2D3436',
  glass: 'rgba(255, 255, 255, 0.7)',
  glassDark: 'rgba(0, 0, 0, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassShadow: 'rgba(0, 0, 0, 0.1)',
  background: '#F5F6FA',
  text: '#2D3436',
  border: '#E5E5E5',
  gradient: {
    primary: ['#6C5CE7', '#A8A4E6'] as const,
    secondary: ['#A8A4E6', '#6C5CE7'] as const,
    success: ['#00B894', '#00CEC9'] as const,
    danger: ['#FF7675', '#FF6B6B'] as const,
    card: ['#FFFFFF', '#F5F6FA'] as const,
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System-Medium',
  bold: 'System-Bold',
};

export const SIZES = {
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 20,
  extraLarge: 28,
  padding: 16,
  radius: 12,
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 16,
  body1: 16,
  body2: 14,
  body3: 12,
  body4: 10,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

export const RECURRING_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
} as const;

export const CATEGORIES = {
  FOOD: 'Продукты',
  TRANSPORT: 'Транспорт',
  UTILITIES: 'Коммунальные услуги',
  ENTERTAINMENT: 'Развлечения',
  HEALTH: 'Здоровье',
  EDUCATION: 'Образование',
  SHOPPING: 'Покупки',
  OTHER: 'Другое',
} as const; 