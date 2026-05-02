export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateHabitName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Alışkanlık adı boş olamaz.' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Alışkanlık adı en az 2 karakter olmalıdır.' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Alışkanlık adı en fazla 50 karakter olabilir.' };
  }

  return { isValid: true, error: null };
}

export function validateGoalMinutes(value: string | number): ValidationResult {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num)) {
    return { isValid: false, error: 'Geçerli bir süre girin.' };
  }

  if (num < 1) {
    return { isValid: false, error: 'Hedef süre en az 1 dakika olmalıdır.' };
  }

  if (num > 1440) {
    return { isValid: false, error: 'Hedef süre 1440 dakikayı (24 saat) aşamaz.' };
  }

  return { isValid: true, error: null };
}

export function validateLimit(value: string | number): ValidationResult {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num)) {
    return { isValid: false, error: 'Geçerli bir limit girin.' };
  }

  if (num < 1) {
    return { isValid: false, error: 'Limit en az 1 dakika olmalıdır.' };
  }

  if (num > 1440) {
    return { isValid: false, error: 'Limit 1440 dakikayı (24 saat) aşamaz.' };
  }

  return { isValid: true, error: null };
}

export function validateHabitIcon(icon: string): ValidationResult {
  if (!icon || icon.trim().length === 0) {
    return { isValid: false, error: 'Bir ikon seçin.' };
  }
  return { isValid: true, error: null };
}
