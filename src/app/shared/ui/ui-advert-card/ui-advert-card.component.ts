import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import type { Advert } from '../../../features/adverts/domain/advert.model';
import { primaryImage } from '../../category/advert-media.presenter';
import { priceText } from '../../category/advert-pricing.presenter';
import { UiBadge } from '../ui-badge/ui-badge.component';
import { UiButton } from '../ui-button/ui-button.component';
import { UiCard } from '../ui-card/ui-card.component';

/**
 * Shared advert card (Phase 30). A category-agnostic card used by the browse,
 * favorites, and search result grids so presentation stays consistent and the
 * three pages stop duplicating the same markup. Pure display: takes an `Advert`
 * and optional label functions, renders a thumbnail (via primaryImage), title,
 * description, category/type badges, price, location, a "مشاهده" link, and an
 * optional projected footer for page-specific actions.
 */
@Component({
  selector: 'ui-advert-card',
  imports: [CommonModule, RouterModule, UiCard, UiBadge, UiButton],
  template: `
    <ui-card class="p-5 flex flex-col gap-2">
      @if (thumbnailUrl(); as thumb) {
        <img
          [src]="thumb"
          [alt]="advert().title"
          class="w-full h-40 object-cover rounded-lg border border-border"
        />
      }
      <h3 class="text-body-large font-semibold text-text">{{ advert().title }}</h3>
      @if (advert().description) {
        <p class="text-body-small text-text-secondary line-clamp-2">{{ advert().description }}</p>
      }
      <div class="flex items-center gap-2 mt-1 flex-wrap">
        @if (categoryLabel(); as cat) {
          <span class="text-caption text-action-primary">{{ cat }}</span>
        }
        <ui-badge tone="brand">{{ typeLabel() }}</ui-badge>
        @if (price(); as price) {
          <span class="text-caption text-text-tertiary">{{ price }}</span>
        }
      </div>
      @if (location(); as loc) {
        <span class="text-caption text-text-tertiary">📍 {{ loc }}</span>
      }
      <div class="mt-auto flex items-center justify-between pt-3">
        <span class="text-caption text-text-tertiary">{{ advert().createdAt | date: 'short' }}</span>
        <a
          ui-button
          variant="ghost"
          size="sm"
          class="!h-auto !px-2 !py-1 text-body-small font-medium text-action-primary hover:underline"
          [routerLink]="['/adverts', advert().id]"
        >
          مشاهده
        </a>
      </div>
      <ng-content select="[advert-footer]" />
    </ui-card>
  `,
})
export class UiAdvertCard {
  readonly advert = input.required<Advert>();
  /** Optional category display label (falls back to the raw category id). */
  readonly categoryLabel = input<string>();
  /** Type label; defaults to a localized provider/consumer label. */
  readonly typeLabel = input<string>();
  /** Optional location text (e.g. "تهران، سعادت‌آباد"). */
  readonly location = input<string>();
  /** Label shown after a per-unit price, e.g. "هر متر" (real estate / services). */
  readonly perUnitLabel = input<string>();

  protected readonly thumbnailUrl = computed(() => primaryImage(this.advert())?.url);

  protected readonly price = computed(() =>
    priceText(this.advert().pricing, { perUnitLabel: this.perUnitLabel() }),
  );
}