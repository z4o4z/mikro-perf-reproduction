import {
  ArrayType,
  Collection,
  Entity,
  Index,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
  wrap,
} from '@mikro-orm/core';

import type { EntityCreateParams, ToJSONWithForeignKeys } from '@/types';

import { Environment, PostgresCMSTabularEntity } from '../common';
import { IntentEntityAdapter } from './intent-entity.adapter';
import type { UtteranceEntity } from './utterance/utterance.entity';

@Entity()
@Unique({ properties: ['id', 'environmentID'] })
@Index({ properties: ['environmentID'] })
export class IntentEntity extends PostgresCMSTabularEntity {
  static fromJSON<JSON extends Partial<ToJSONWithForeignKeys<IntentEntity>>>(
    data: JSON
  ) {
    return IntentEntityAdapter.toDB<JSON>(data);
  }

  // legacy built-in intents uses type as id, so increase length to 64
  @PrimaryKey({ type: 'varchar', nullable: false, length: 64 })
  declare id: string;

  // to keep composite key correct, environmentID must be defined after id
  @Environment()
  declare environmentID: string;

  @Property({ type: 'text', default: null, nullable: true })
  description: string | null;

  @Property()
  automaticReprompt: boolean;

  @Property({ type: ArrayType })
  entityOrder: string[];

  @OneToMany('UtteranceEntity', (value: UtteranceEntity) => value.intent)
  utterances = new Collection<UtteranceEntity>(this);

  constructor({
    description,
    entityOrder,
    automaticReprompt,
    ...data
  }: EntityCreateParams<IntentEntity>) {
    super(data);

    ({
      description: this.description,
      entityOrder: this.entityOrder,
      automaticReprompt: this.automaticReprompt,
    } = IntentEntity.fromJSON({ description, entityOrder, automaticReprompt }));
  }

  toJSON(): ToJSONWithForeignKeys<IntentEntity> {
    return IntentEntityAdapter.fromDB({
      ...wrap<IntentEntity>(this).toObject(),
      folder: this.folder ?? null,
      updatedBy: this.updatedBy,
      createdBy: this.createdBy,
      assistant: this.assistant,
    });
  }
}
