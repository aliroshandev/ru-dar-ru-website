import { TestBed } from '@angular/core/testing';
import { DynamicValidatorBootstrap } from './dynamic-validator-bootstrap';
import { DynamicValidatorRegistry } from './dynamic-validator-registry';

describe('DynamicValidatorRegistry', () => {
  let registry: DynamicValidatorRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DynamicValidatorRegistry, DynamicValidatorBootstrap],
    });
    registry = TestBed.inject(DynamicValidatorRegistry);
    TestBed.inject(DynamicValidatorBootstrap).registerValidators();
  });

  it('exposes registered validators by name', () => {
    expect(registry.resolve('phone')).toBeDefined();
    expect(registry.resolve('nationalId')).toBeDefined();
  });

  it('rejects an invalid Persian mobile', () => {
    const check = registry.resolve('phone')!;
    expect(check('09123456789', undefined)).toBeNull();
    expect(check('0990', undefined)).not.toBeNull();
    expect(check('0211234', undefined)).not.toBeNull();
  });

  it('skips empty values (optional validators)', () => {
    const check = registry.resolve('phone')!;
    expect(check(null, undefined)).toBeNull();
    expect(check('', undefined)).toBeNull();
  });

  it('validates national id length', () => {
    const check = registry.resolve('nationalId')!;
    expect(check('0012345678', undefined)).toBeNull();
    expect(check('123', undefined)).not.toBeNull();
  });

  it('enforces non-blank on whitespace-only strings', () => {
    const check = registry.resolve('nonBlank')!;
    expect(check('   ', undefined)).not.toBeNull();
    expect(check('  x ', undefined)).toBeNull();
  });

  it('can register an additional validator after bootstrap', () => {
    const custom = () => 'bad';
    registry.register('customRule', custom);
    expect(registry.resolve('customRule')).toBe(custom);
  });
});