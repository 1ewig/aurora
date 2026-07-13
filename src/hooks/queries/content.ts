import { useQuery } from '@tanstack/react-query';

export interface CategoryMetadata {
  slug: string;
  name: string;
  image: string;
  description: string;
}

async function fetchLookbookSlides(): Promise<any[]> {
  const response = await fetch('/api/lookbook');
  if (!response.ok) {
    throw new Error('Failed to fetch lookbook slides');
  }
  return response.json();
}

/** Fetches lookbook slides for the homepage slider. */
export function useLookbookQuery() {
  return useQuery({
    queryKey: ['lookbook'],
    queryFn: fetchLookbookSlides,
  });
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

async function fetchDailyCategories(): Promise<CategoryMetadata[]> {
  const response = await fetch('/api/categories/daily');
  if (!response.ok) {
    throw new Error('Failed to fetch daily categories');
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

/** Fetches 3 daily rotating categories deterministically. */
export function useDailyCategoriesQuery() {
  return useQuery<CategoryMetadata[]>({
    queryKey: ["categories", "daily"],
    queryFn: fetchDailyCategories,
    staleTime: 1000 * 60 * 30,
  });
}
