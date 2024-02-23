import { Entity, PrimaryKey, wrap } from '@mikro-orm/core';

@Entity()
export class UserStubEntity {
  @PrimaryKey({ autoincrement: true })
  id: number = 1;

  toJSON() {
    return wrap(this).toObject();
  }
}
