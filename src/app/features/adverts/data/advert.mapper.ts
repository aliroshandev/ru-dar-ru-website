import { isAdvertStatus } from '../domain/advert-status';
import type { AdvertStatus } from '../domain/advert-status';
import { isAdvertSubcategoryId } from '../domain/advert-category';
import { isAdvertType } from '../domain/advert-type';
import type { AdvertType } from '../domain/advert-type';
import type { Advert } from '../domain/advert.model';
import type {
  AdvertDto,
  AdvertMediaDto,
  AdvertListDto,
  CreateAdvertRequestDto,
  UpdateAdvertRequestDto,
} from './advert.dto';
import type { CreateAdvertRequest, UpdateAdvertRequest } from '../domain/advert-requests';

/**
 * Maps between API DTOs and domain models. Components must not do this.
 * Unknown/non-conforming values are coerced defensively to keep the pipeline safe.
 */
export const advertMapper = {
  fromDto(dto: AdvertDto): Advert {
    return {
      id: dto.id,
      type: isAdvertType(dto.type) ? dto.type : 'consumer',
      category: dto.category as Advert['category'],
      subcategory: isAdvertSubcategoryId(dto.subcategory) ? dto.subcategory : undefined,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      pricing: dto.pricing,
      attributes: dto.attributes ?? {},
      media: dto.media?.map(advertMapper.mediaFromDto) ?? [],
      status: isAdvertStatus(dto.status) ? dto.status : 'moderation',
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  },

  toDto(advert: Advert): AdvertDto {
    return {
      id: advert.id,
      type: advert.type,
      category: advert.category,
      subcategory: advert.subcategory,
      title: advert.title,
      description: advert.description,
      location: advert.location,
      pricing: advert.pricing,
      attributes: { ...advert.attributes },
      media: advert.media.map(advertMapper.mediaToDto),
      status: advert.status,
      createdAt: advert.createdAt,
      updatedAt: advert.updatedAt,
    };
  },

  listFromDto(dto: AdvertListDto) {
    return {
      items: dto.items.map(advertMapper.fromDto),
      total: dto.total,
      page: dto.page,
      pageSize: dto.pageSize,
    };
  },

  createRequestToDto(request: CreateAdvertRequest): CreateAdvertRequestDto {
    return {
      type: request.type,
      category: request.category,
      subcategory: request.subcategory,
      title: request.title,
      description: request.description,
      location: request.location,
      pricing: request.pricing,
      attributes: { ...request.attributes },
      media: request.media.map((m) => ({ type: m.type, url: m.url, sortOrder: m.sortOrder })),
    };
  },

  updateRequestToDto(request: UpdateAdvertRequest): UpdateAdvertRequestDto {
    const dto: UpdateAdvertRequestDto = {};
    if (request.title !== undefined) dto.title = request.title;
    if (request.description !== undefined) dto.description = request.description;
    if (request.location !== undefined) dto.location = request.location;
    if (request.pricing !== undefined) dto.pricing = request.pricing;
    if (request.attributes !== undefined) dto.attributes = { ...request.attributes };
    if (request.media !== undefined) {
      dto.media = request.media.map((m) => ({ type: m.type, url: m.url, sortOrder: m.sortOrder }));
    }
    if (request.status !== undefined) dto.status = request.status;
    return dto;
  },

  mediaFromDto(dto: AdvertMediaDto): Advert['media'][number] {
    return {
      id: dto.id,
      type: (dto.type as Advert['media'][number]['type']) ?? 'image',
      url: dto.url,
      thumbnailUrl: dto.thumbnailUrl,
      alt: dto.alt,
      sortOrder: dto.sortOrder,
      mimeType: dto.mimeType,
    };
  },

  mediaToDto(media: Advert['media'][number]): AdvertMediaDto {
    return {
      id: media.id,
      type: media.type,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      alt: media.alt,
      sortOrder: media.sortOrder,
      mimeType: media.mimeType,
    };
  },
};

/** Illustrated mapping from a raw DTO into a domain advert. */
export type { AdvertType };

export function toAdvertType(value: unknown): AdvertType {
  return isAdvertType(value) ? value : 'consumer';
}

export function toAdvertStatus(value: unknown): AdvertStatus {
  return isAdvertStatus(value) ? value : 'moderation';
}
