import type { ComponentDefinition } from './types';

export class ComponentRegistry {
  readonly #definitions = new Map<string, ComponentDefinition>();

  constructor(definitions: readonly ComponentDefinition[] = []) {
    for (const definition of definitions) this.register(definition);
  }

  register(definition: ComponentDefinition): this {
    if (this.#definitions.has(definition.type)) {
      throw new Error(
        `Component type "${definition.type}" is already registered.`,
      );
    }

    this.#definitions.set(definition.type, definition);
    return this;
  }

  get(type: string): ComponentDefinition | undefined {
    return this.#definitions.get(type);
  }

  has(type: string): boolean {
    return this.#definitions.has(type);
  }

  getAll(): readonly ComponentDefinition[] {
    return [...this.#definitions.values()];
  }

  getByCategory(category: string): readonly ComponentDefinition[] {
    return this.getAll().filter(
      (definition) => definition.category === category,
    );
  }
}
