import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '../api/tags';

export function useTags(enabled: boolean) {
  return useQuery({ queryKey: ['tags'], queryFn: tagsApi.list, enabled });
}