/**
 * Data Transfer Objects as they arrive from (or go to) the API.
 * Presentation components NEVER consume these directly — they are mapped
 * into domain models first (Section 14).
 * NOTE: Shape is provisional until a real backend contract exists; a typed
 * mock is the only executable consumer today.
 */

export interface AdvertMediaDto {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  sortOrder?: number;
  mimeType?: string;
}

export interface AdvertDto {
  id: string;
  type: string;
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  pricing?: {
    price?: number;
    pricePerUnit?: number;
    currency?: string;
    negotiable?: boolean;
  };
  attributes: Record<string, unknown>;
  media: AdvertMediaDto[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertListDto {
  items: AdvertDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateAdvertRequestDto {
  type: string;
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  location?: AdvertDto['location'];
  pricing?: AdvertDto['pricing'];
  attributes: Record<string, unknown>;
  media: { type: string; url: string; sortOrder?: number }[];
}

export interface UpdateAdvertRequestDto {
  title?: string;
  description?: string;
  location?: AdvertDto['location'];
  pricing?: AdvertDto['pricing'];
  attributes?: Record<string, unknown>;
  media?: { type: string; url: string; sortOrder?: number }[];
  status?: string;
}
