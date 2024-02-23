import { ManyToOne } from '@mikro-orm/core';

export const Assistant = () =>
  ManyToOne('AssistantEntity', { name: 'assistant_id', deleteRule: 'cascade' });
