import { ComponentRegistry } from './ComponentRegistry';
import { BoxDefinition } from './components/BoxDefinition';
import { ButtonDefinition } from './components/ButtonDefinition';
import { CardContentDefinition } from './components/CardContentDefinition';
import { CardDefinition } from './components/CardDefinition';
import { ContainerDefinition } from './components/ContainerDefinition';
import { DividerDefinition } from './components/DividerDefinition';
import { GridDefinition } from './components/GridDefinition';
import { PaperDefinition } from './components/PaperDefinition';
import { StackDefinition } from './components/StackDefinition';
import { TypographyDefinition } from './components/TypographyDefinition';

export function createDefaultRegistry(): ComponentRegistry {
  return new ComponentRegistry([
    BoxDefinition,
    StackDefinition,
    GridDefinition,
    ContainerDefinition,
    PaperDefinition,
    CardDefinition,
    CardContentDefinition,
    TypographyDefinition,
    DividerDefinition,
    ButtonDefinition,
  ]);
}
