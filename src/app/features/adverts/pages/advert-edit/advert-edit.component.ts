import { Component, computed, inject, signal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { AdvertRepository } from '../../data/advert.repository';
import type { Advert } from '../../domain/advert.model';
import { CategoryRegistry } from '../../../../shared/category/category-registry';
import {
  advertToFormValues,
  advertUpdateFromForm,
  DynamicFormFactory,
  DynamicFormRenderer,
} from '../../../../shared/form';
import {
  UiAlert,
  UiButton,
  UiCard,
  UiEmptyState,
  UiErrorState,
  UiLoading,
} from '../../../../shared/ui';

/**
 * Advert edit page (Phase 12). Loads an existing advert, seeds the dynamic
 * edit-mode form with its stored values (the inverse of the create serializer),
 * and on submit persists only changed core/location/pricing values plus a
 * rebuilt attributes set. No category-specific branching.
 */
@Component({
  selector: 'app-advert-edit',
  imports: [
    DynamicFormRenderer,
    UiButton,
    UiCard,
    UiEmptyState,
    UiErrorState,
    UiLoading,
    UiAlert,
  ],
  templateUrl: 'advert-edit.component.html',
  styleUrl: 'advert-edit.component.css',
})
export class AdvertEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(AdvertRepository);
  private readonly registry = inject(CategoryRegistry);
  private readonly formFactory = inject(DynamicFormFactory);

  readonly advert = signal<Advert | undefined>(undefined);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly failed = signal(false);
  readonly submitState = signal<{ submitting: boolean; error?: string }>({ submitting: false });

  readonly sections = computed(() => {
    const advert = this.advert();
    if (!advert) return [];
    return this.registry.sections(advert.category, advert.subcategory);
  });

  protected readonly formContext = computed(() => {
    const advert = this.advert();
    const sections = this.sections();
    if (!advert || sections.length === 0) return undefined;
    const fieldKeys = sections.flatMap((s) => s.fields.map((f) => f.key));
    return this.formFactory.build('edit', sections, advertToFormValues(advert, fieldKeys));
  });

  protected readonly formTree = computed<FieldTree<Record<string, unknown>> | undefined>(() => {
    const ctx = this.formContext();
    return ctx ? (ctx.form as FieldTree<Record<string, unknown>>) : undefined;
  });

  constructor() {
    this.route.params.subscribe((params) => this.load(params['id']));
  }

  private load(id: string | undefined): void {
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.failed.set(false);
    this.notFound.set(false);
    this.repository
      .getById(id)
      .pipe(
        tap((advert) => this.advert.set(advert)),
        catchError((err: unknown) => {
          const message = err instanceof Error ? err.message : 'load error';
          this.notFound.set(/not found/i.test(message));
          this.failed.set(!/not found/i.test(message));
          return of(undefined);
        }),
      )
      .subscribe(() => this.loading.set(false));
  }

  protected retry(): void {
    this.load(this.route.snapshot.params['id']);
  }

  onSubmit(): void {
    const advert = this.advert();
    const ctx = this.formContext();
    if (!advert || !ctx) return;
    const fieldKeys = this.sections().flatMap((s) => s.fields.map((f) => f.key));
    const request = advertUpdateFromForm(advert, ctx.values(), fieldKeys);
    this.submitState.set({ submitting: true });
    this.repository
      .update(advert.id, request)
      .pipe(
        tap((updated) => this.router.navigate(['/adverts', updated.id])),
        catchError(() => {
          this.submitState.set({ submitting: false, error: 'ذخیره تغییرات ناموفق بود.' });
          return of(undefined);
        }),
      )
      .subscribe((updated) => {
        if (updated) this.submitState.set({ submitting: false });
      });
  }
}