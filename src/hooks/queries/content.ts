import { useQuery } from '@tanstack/react-query';

export interface CategoryMetadata {
  slug: string;
  name: string;
  image: string;
  description: string;
}

async function fetchEditorialContent(): Promise<any[]> {
  const response = await fetch('/api/editorial');
  if (!response.ok) {
    throw new Error('Failed to fetch editorial content');
  }
  return response.json();
}

/** Fetches editorial content for the brand story page. */
export function useEditorialQuery() {
  return useQuery({
    queryKey: ['editorial'],
    queryFn: fetchEditorialContent,
  });
}

async function fetchCategories(): Promise<CategoryMetadata[]> {
  const response = await fetch('/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories list');
  }
  return response.json();
}

/** Fetches all categories with metadata dynamically from DB. */
export function useCategoriesQuery() {
  return useQuery<CategoryMetadata[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10,
  });
}
