import { Injector, inject, runInInjectionContext, Service, signal, untracked } from '@angular/core';
import { form } from '@angular/forms/signals';
import type { FormField, ValidationError } from '@angular/forms/signals';
import { disabled, email, hidden, max, maxLength, min, minLength, pattern, required, validate } from '@angular/forms/signals';
import type { AdvertSectionDefinition } from '../category/advert-category.model';
import { evaluateCondition } from './dynamic-condition';
import type { DynamicFieldCondition, DynamicFieldDefinition, DynamicFieldValidator } from './dynamic-field.model';
import type { DynamicFormContext, DynamicFormMode } from './dynamic-form-schema';
import { DynamicValidatorRegistry } from './dynamic-validator-registry';

/**
 * Builds a Signal Forms `FieldTree` + value model from category sections/fields.
 * The SAME schema drives create/edit/search/preview; only validity semantics
 * differ per mode (search-mode fields are optional — Section 9/6).
 * This factory is domain-agnostic — it never branches on a category id.
 */
@Service()
export class DynamicFormFactory {
  private readonly validatorRegistry = inject(DynamicValidatorRegistry);
  private readonly injector = inject(Injector);

  /**
   * Build a form context for the given sections.
   * @param mode create|edit|search|preview
   * @param initialValues optional seeded values (edit/preview)
   */
  build(
    mode: DynamicFormMode,
    sections: readonly AdvertSectionDefinition[],
    initialValues: Readonly<Record<string, unknown>> = {},
  ): DynamicFormContext {
    const fields = flattenFields(sections);
    const model = signal<Record<string, unknown>>(buildModel(fields, initialValues));

    // `form()` from @angular/forms/signals both injects an Injector AND creates
    // internal effects. Callers may invoke `build()` from a `computed()` body,
    // which is neither an injection context nor a safe place to create effects.
    // So we (1) run it inside the factory's Injector and (2) wrap the tree
    // creation in `untracked()` to escape the surrounding reactive context —
    // otherwise the effects `form()` registers throw NG0602.
    const tree = runInInjectionContext(this.injector, () =>
      untracked(() =>
        form(model, (path) => {
          // Accessing `path[key]` yields a SchemaPath *proxy object*, which is
          // what `valueOf(sibling)` requires — a raw string key would be used
          // as a WeakMap key internally and throw "Invalid value used as weak
          // map key". Build a key → SchemaPath proxy map once at compile time.
          const pathOf = new Map<string, unknown>();
          for (const field of fields) {
            pathOf.set(field.key, (path as unknown as Record<string, unknown>)[field.key]);
          }
          for (const field of fields) {
            // buildModel guarantees every field exists on the model.
            const fieldNode = pathOf.get(field.key);
            if (!fieldNode) continue;
            this.applyAvailability(fieldNode, field, pathOf);
            this.applyValidators(fieldNode, field, mode, pathOf);
          }
        }),
      ),
    );

    return { mode, form: tree as unknown as FormField<unknown>, values: model, fields };
  }

  /**
   * Applies conditional availability via the native `disabled`/`hidden` rules
   * driven by `disabledWhen`/`visibleWhen`. Logic stays data-driven; the rules
   * react to sibling field values through the shared condition resolver.
   */
  private applyAvailability(
    node: unknown,
    field: DynamicFieldDefinition,
    pathOf: Map<string, unknown>,
  ): void {
    if (field.disabledWhen) {
      disabled(node as never, { when: this.whenResolver(field.disabledWhen, pathOf) });
    }
    if (field.visibleWhen) {
      hidden(node as never, { when: this.visibleWhenLogic(field, pathOf) });
    }
  }

  /** `hidden()` is the inverse of `visibleWhen` — visible when condition is false. */
  private visibleWhenLogic(
    field: DynamicFieldDefinition,
    pathOf: Map<string, unknown>,
  ): (ctx: unknown) => boolean {
    const condition = field.visibleWhen!;
    return (ctx) => {
      const valueOf = (key: string): unknown => {
        const path = pathOf.get(key);
        return path === undefined
          ? undefined
          : (ctx as { valueOf(path: never): unknown }).valueOf(path as never);
      };
      return !evaluateCondition(condition, valueOf);
    };
  }

  private applyValidators(
    node: unknown,
    field: DynamicFieldDefinition,
    mode: DynamicFormMode,
    pathOf: Map<string, unknown>,
  ): void {
    const validators = this.validatorsFor(field, mode);
    // All validators for a field share the same conditional trigger, driven by
    // `requiredWhen` (i.e. the built-in validators only run once that condition
    // holds). A `when` resolver reads sibling values by key from the context.
    const when = this.whenResolver(field.requiredWhen, pathOf);
    for (const validator of validators) {
      const message = validator.message;
      switch (validator.name) {
        case 'required':
          required(node as never, { message, when });
          break;
        case 'email':
          email(node as never, { message, when });
          break;
        case 'min':
          min(node as never, minNumber(validator), { message, when });
          break;
        case 'max':
          max(node as never, maxNumber(validator), { message, when });
          break;
        case 'minLength':
          minLength(node as never, minLengthValue(validator), { message, when });
          break;
        case 'maxLength':
          maxLength(node as never, maxLengthValue(validator), { message, when });
          break;
        case 'pattern':
          pattern(node as never, new RegExp(String(validator.params)), { message, when });
          break;
        case 'custom':
          this.applyCustomValidator(node, validator, when);
          break;
        case 'async':
          // Async checks share the registry; a later phase may debounce I/O.
          this.applyCustomValidator(node, validator, when);
          break;
        default:
          // Unknown validator names are ignored so adding a new validator never
          // requires changes in data or here beyond a registry registration.
          break;
      }
    }
  }

  /**
   * Registered/custom validators (registry lookup by name) via the public
   * `validate(path, FieldValidator)` API. The check is pure; logic lives only
   * in the registry — never in category data. When the field is conditional
   * (`requiredWhen`), the check is skipped unless the condition holds.
   */
  private applyCustomValidator(
    node: unknown,
    validator: DynamicFieldValidator,
    when: ((ctx: unknown) => boolean) | undefined,
  ): void {
    const check = this.validatorRegistry.resolve(validator.name);
    if (!check) return; // Unknown name: skipped; no cycle in category data.
    validate(node as never, (ctx) => {
      if (when && !when(ctx as never)) return null;
      const message = check(ctx.value(), validator.params);
      if (message == null) return null;
      const error: ValidationError = { kind: validator.name, message };
      return error;
    });
  }

  /**
   * Builds a `when` LogicFn from a field's `requiredWhen` condition. Returns
   * undefined when there is no condition (validator always applies). For
   * built-in validators the built-in applies only when the condition holds.
   * An absent condition => the provided `when` always returns true.
   */
  private whenResolver(
    condition: DynamicFieldCondition | undefined,
    pathOf: Map<string, unknown>,
  ): ((ctx: unknown) => boolean) | undefined {
    if (!condition) return undefined;
return (ctx) => {
        const valueOf = (key: string): unknown => {
          // `valueOf` requires a SchemaPath proxy object (a sibling field path),
          // never a raw string key — strings are invalid WeakMap keys. Guard
          // against references to keys unknown to this schema.
          const path = pathOf.get(key);
          return path === undefined
            ? undefined
            : (ctx as { valueOf(path: never): unknown }).valueOf(path as never);
        };
        return evaluateCondition(condition, valueOf);
      };
  }

  /**
   * Returns the validators that apply in the given mode.
   * Search/preview: required is dropped (field existing ≠ field required).
   */
  private validatorsFor(
    field: DynamicFieldDefinition,
    mode: DynamicFormMode,
  ): readonly DynamicFieldValidator[] {
    const fieldValidators = field.validators ?? [];
    if (mode === 'search' || mode === 'preview') {
      return fieldValidators.filter((v) => v.name !== 'required');
    }
    return fieldValidators;
  }
}

function flattenFields(sections: readonly AdvertSectionDefinition[]): DynamicFieldDefinition[] {
  return sections.flatMap((section) => section.fields);
}

function buildModel(
  fields: readonly DynamicFieldDefinition[],
  initialValues: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const model: Record<string, unknown> = {};
  for (const field of fields) {
    model[field.key] = initialValues[field.key] ?? defaultValueFor(field);
  }
  return model;
}

function defaultValueFor(field: DynamicFieldDefinition): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  switch (field.type) {
    case 'number':
    case 'currency':
    case 'range':
      return null;
    case 'checkbox':
      return false;
    case 'multi-select':
      return [] as unknown[];
    default:
      return '';
  }
}

function numericParam(validator: DynamicFieldValidator): number | undefined {
  return typeof validator.params === 'number' ? validator.params : undefined;
}

function minNumber(v: DynamicFieldValidator): number {
  return numericParam(v) ?? 0;
}
function maxNumber(v: DynamicFieldValidator): number {
  return numericParam(v) ?? Number.MAX_SAFE_INTEGER;
}
function minLengthValue(v: DynamicFieldValidator): number {
  return numericParam(v) ?? 0;
}
function maxLengthValue(v: DynamicFieldValidator): number {
  return numericParam(v) ?? Number.MAX_SAFE_INTEGER;
}