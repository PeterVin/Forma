import { describe, expect, it } from 'vitest';

import { ComponentRegistry } from './ComponentRegistry';
import { ButtonDefinition } from './components/ButtonDefinition';
import { ButtonPropsSchema } from './components/ButtonDefinition';
import { BoxDefinition } from './components/BoxDefinition';
import { StackPropsSchema } from './components/StackDefinition';
import { createDefaultRegistry } from './createDefaultRegistry';
import { validateNodeProps } from './validation';

describe('ComponentRegistry', () => {
  it('returns a registered component', () => {
    const registry = new ComponentRegistry([BoxDefinition]);
    expect(registry.get('mui.box')).toBe(BoxDefinition);
  });

  it('returns undefined for an unknown component', () => {
    const registry = new ComponentRegistry();
    expect(registry.get('mui.unknown')).toBeUndefined();
  });

  it('lists definitions by category', () => {
    const registry = createDefaultRegistry();
    expect(
      registry.getByCategory('Layout').map((definition) => definition.type),
    ).toEqual(
      expect.arrayContaining([
        'mui.box',
        'mui.stack',
        'mui.grid',
        'mui.container',
      ]),
    );
  });

  it('validates supported props while preserving passthrough props', () => {
    const registry = createDefaultRegistry();
    const result = validateNodeProps(
      {
        id: 'button',
        type: ButtonDefinition.type,
        children: [],
        props: { content: 'Save', variant: 'invalid', 'data-testid': 'save' },
        style: {},
      },
      registry,
    );
    expect(result.success).toBe(false);
  });

  it('uses Zod 4 loose objects to preserve unknown MUI props', () => {
    const parsed = ButtonPropsSchema.parse({
      content: 'Save',
      variant: 'contained',
      'data-testid': 'save-action',
      disableElevation: true,
    });
    expect(parsed['data-testid']).toBe('save-action');
    expect(parsed.disableElevation).toBe(true);
  });

  it('rejects invalid known props and invalid nested responsive entries', () => {
    expect(ButtonPropsSchema.safeParse({ variant: 'invalid' }).success).toBe(
      false,
    );
    expect(
      StackPropsSchema.safeParse({
        direction: { xs: 'column', md: 'sideways' },
      }).success,
    ).toBe(false);
    expect(
      StackPropsSchema.safeParse({
        spacing: { xs: 1, md: 2 },
        futureMuiProp: { nested: true },
      }).success,
    ).toBe(true);
  });
});
