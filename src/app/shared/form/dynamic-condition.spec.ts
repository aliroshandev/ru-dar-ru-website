import { evaluateCondition } from './dynamic-condition';
import type { DynamicFieldCondition } from './dynamic-field.model';

describe('evaluateCondition', () => {
  const values: Record<string, unknown> = { kind: 'rent', floor: 3, apt: '' };

  const resolve = (key: string): unknown => values[key];

  it('matches an equals operator', () => {
    const condition: DynamicFieldCondition = { op: { fieldKey: 'kind', equals: 'rent' } };
    expect(evaluateCondition(condition, resolve)).toBe(true);
    expect(
      evaluateCondition({ op: { fieldKey: 'kind', equals: 'sell' } }, resolve),
    ).toBe(false);
  });

  it('matches a notEquals operator', () => {
    const condition: DynamicFieldCondition = { op: { fieldKey: 'kind', notEquals: 'sell' } };
    expect(evaluateCondition(condition, resolve)).toBe(true);
  });

  it('treats an absent predicate as non-empty match', () => {
    expect(evaluateCondition({ op: { fieldKey: 'floor' } }, resolve)).toBe(true);
    expect(evaluateCondition({ op: { fieldKey: 'apt' } }, resolve)).toBe(false);
  });

  it('evaluates AND groups (all must hold)', () => {
    const condition: DynamicFieldCondition = {
      and: [
        { op: { fieldKey: 'kind', equals: 'rent' } },
        { op: { fieldKey: 'floor', equals: 3 } },
      ],
    };
    expect(evaluateCondition(condition, resolve)).toBe(true);
    const failing: DynamicFieldCondition = {
      and: [
        { op: { fieldKey: 'kind', equals: 'rent' } },
        { op: { fieldKey: 'floor', equals: 99 } },
      ],
    };
    expect(evaluateCondition(failing, resolve)).toBe(false);
  });

  it('evaluates OR groups (at least one holds)', () => {
    const condition: DynamicFieldCondition = {
      or: [
        { op: { fieldKey: 'kind', equals: 'sell' } },
        { op: { fieldKey: 'floor', equals: 3 } },
      ],
    };
    expect(evaluateCondition(condition, resolve)).toBe(true);
  });

  it('treats an empty condition as always true', () => {
    expect(evaluateCondition({}, resolve)).toBe(true);
  });

  it('an absent sibling value never equals a value', () => {
    expect(
      evaluateCondition({ op: { fieldKey: 'nope', equals: null } }, resolve),
    ).toBe(false);
  });
});