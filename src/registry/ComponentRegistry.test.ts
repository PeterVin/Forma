import { describe, expect, it } from 'vitest';

import { ComponentRegistry } from './Componentregistry';
import { BoxDefinition } from './components/BoxDefinition';

describe('ComponentRegistry', () => {
  it('returns a registered component', () => {
    const registry = new ComponentRegistry([BoxDefinition]);
    expect(registry.get('mui.box')).toBe(BoxDefinition);
  });

  it('returns undefined for an unknown component', () => {
    const registry = new ComponentRegistry();
    expect(registry.get('mui.unknown')).toBeUndefined();
  });
});
