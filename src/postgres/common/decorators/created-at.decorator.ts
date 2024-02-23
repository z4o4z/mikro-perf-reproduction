import { Property } from '@mikro-orm/core';

export const CreatedAt = (options?: Parameters<typeof Property>[0]) =>
  Property({ defaultRaw: 'CURRENT_TIMESTAMP', ...options });
