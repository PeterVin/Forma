import { z, type ZodType } from 'zod';

import { BREAKPOINT_KEYS } from '../../editor/responsive/types';

const BreakpointKeySchema = z.enum(BREAKPOINT_KEYS);

export function looseComponentProps<T extends z.ZodRawShape>(shape: T) {
  return z.looseObject(shape);
}

export function responsiveProp<T extends ZodType>(schema: T) {
  return z.union([schema, z.partialRecord(BreakpointKeySchema, schema)]);
}
