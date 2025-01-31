import { RecordColumnTypes } from '@xata.io/client';
import { z } from 'zod';

// We need to do this because of problems with Zod and recursive types https://www.npmjs.com/package/zod#recursive-types
export type Column = {
  name: string;
  type: (typeof RecordColumnTypes)[number];
  unique?: boolean;
  notNull?: boolean;
  defaultValue?: string;
  description?: string;
  link?: {
    table: string;
  };
  vector?: {
    dimension: number;
  };
  columns?: Column[];
};

export const columnSchema: z.ZodSchema<Column> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.enum(RecordColumnTypes),
    unique: z.boolean().optional(),
    notNull: z.boolean().optional(),
    defaultValue: z.string().optional(),
    description: z.string().optional(),
    link: z
      .object({
        table: z.string()
      })
      .optional(),
    vector: z
      .object({
        dimension: z.number()
      })
      .optional(),
    columns: z.array(columnSchema).optional()
  })
);

export const revlinkSchema = z.object({
  table: z.string(),
  column: z.string()
});

export const tableSchema = z.object({
  name: z.string(),
  columns: z.array(columnSchema),
  revLinks: z.array(revlinkSchema).optional()
});

export type Table = z.infer<typeof tableSchema>;

export const xataDatabaseSchema = z.object({
  tables: z.array(tableSchema)
});

export type XataDatabaseSchema = z.infer<typeof xataDatabaseSchema>;

export const parseSchemaFile = (input: string) => {
  return xataDatabaseSchema.safeParse(JSON.parse(input));
};
