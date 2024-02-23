import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  PrimaryKeyProp,
  Property,
  Ref,
  Unique,
  wrap,
} from '@mikro-orm/core';

import type { AssistantEntity } from '@/postgres/assistant';
import {
  Assistant,
  Environment,
  PostgresCMSObjectEntity,
} from '@/postgres/common';
import type {
  CMSCompositePK,
  EntityCreateParams,
  ToJSONWithForeignKeys,
} from '@/types';

import { IntentEntity } from '../intent.entity';
import { UtteranceEntityAdapter } from './utterance-entity.adapter';
import type { UtteranceText } from './utterance-text.dto';
import { UtteranceTextType } from './utterance-text.dto';
import { Language } from '@/common';

@Entity()
@Unique({ properties: ['id', 'environmentID'] })
@Index({ properties: ['environmentID'] })
export class UtteranceEntity extends PostgresCMSObjectEntity {
  static fromJSON<JSON extends Partial<ToJSONWithForeignKeys<UtteranceEntity>>>(
    data: JSON
  ) {
    return UtteranceEntityAdapter.toDB<JSON>(data);
  }

  @Property({ type: UtteranceTextType })
  text: UtteranceText;

  @ManyToOne(() => IntentEntity, {
    name: 'intent_id',
    deleteRule: 'cascade',
    fieldNames: ['intent_id', 'environment_id'],
  })
  intent: Ref<IntentEntity>;

  @Enum(() => Language)
  language: Language;

  @Assistant()
  assistant: Ref<AssistantEntity>;

  @Environment()
  environmentID: string;

  [PrimaryKeyProp]?: CMSCompositePK;

  constructor(data: EntityCreateParams<UtteranceEntity>) {
    super(data);

    ({
      text: this.text,
      intent: this.intent,
      language: this.language,
      assistant: this.assistant,
      environmentID: this.environmentID,
    } = UtteranceEntity.fromJSON(data));
  }

  toJSON(): ToJSONWithForeignKeys<UtteranceEntity> {
    return UtteranceEntityAdapter.fromDB({
      ...wrap<UtteranceEntity>(this).toObject(),
      intent: this.intent,
      updatedBy: this.updatedBy,
      assistant: this.assistant,
    });
  }
}
