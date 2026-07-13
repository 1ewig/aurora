import { useQuery } from '@tanstack/react-query';
import type { Product } from '@/data/products';
import type { MaterialItem } from '@/data/materials';
import type { CategoryMetadata } from './content';

export interface LookbookSlide {
  id: number;
  slideNumber: number;
  originalImage: string;
  imageUrl: string;
  altText: string;
  tag: string;
  title: string;
  link: string;
}

export interface EditorialItem {
  id: string;
  originalImage: string;
  imageUrl: string;
  altText: string;
  title: string;
  description: string;
}

export interface LandingData {
  products: Product[];
  categories: CategoryMetadata[];
  lookbook: LookbookSlide[];
  editorial: EditorialItem[];
  materials: MaterialItem[];
}

async function fetchLanding(): Promise<LandingData> {
  const response = await fetch('/api/landing');
  if (!response.ok) {
    throw new Error('Failed to fetch landing data');
  }
  return response.json();
}

export function useLandingQuery() {
  return useQuery<LandingData>({
    queryKey: ['landing'],
    queryFn: fetchLanding,
    staleTime: 1000 * 60 * 5,
  });
}
