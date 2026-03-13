import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

/**
 * Table relationship definition
 * @link https://rqbv2.drizzle-orm-fe.pages.dev/docs/relations-v1-v2
 */
export const relations = defineRelations(schema, (_r) => ({}));
