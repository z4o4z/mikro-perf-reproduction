import { PrimaryKey } from '@mikro-orm/core';

export const Environment = () =>
  PrimaryKey({
    name: 'environment_id',
    type: 'varchar',
    primary: true,
    length: 24,
  });
