import type { Priority } from '../api/types';

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low: { label: 'Низкий', color: 'default' },
  medium: { label: 'Средний', color: 'blue' },
  high: { label: 'Высокий', color: 'orange' },
  crit: { label: 'Критичный', color: 'red' },
};