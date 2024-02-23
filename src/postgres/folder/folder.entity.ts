import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  PrimaryKeyProp,
  Property,
  Unique,
  Ref,
  wrap,
} from '@mikro-orm/core';

import type {
  CMSCompositePK,
  EntityCreateParams,
  ToJSONWithForeignKeys,
} from '@/types';

import type { AssistantEntity } from '../assistant/assistant.entity';
import { Assistant } from '../common/decorators/assistant.decorator';
import { Environment } from '../common/decorators/environment.decorator';
import { PostgresCMSObjectEntity } from '../common/entities/postgres-cms-object.entity';
import { FolderEntityAdapter } from './folder-entity.adapter';
import { FolderScope } from './folder-scope.enum';

@Entity()
@Unique({ properties: ['id', 'environmentID'] })
@Index({ properties: ['environmentID'] })
export class FolderEntity extends PostgresCMSObjectEntity {
  static fromJSON<JSON extends Partial<ToJSONWithForeignKeys<FolderEntity>>>(
    data: JSON
  ) {
    return FolderEntityAdapter.toDB<JSON>(data);
  }

  @Property()
  name: string;

  @Enum(() => FolderScope)
  scope: FolderScope;

  @ManyToOne(() => FolderEntity, {
    name: 'parent_id',
    default: null,
    deleteRule: 'cascade',
    nullable: true,
    fieldNames: ['parent_id', 'environment_id'],
  })
  parent: Ref<FolderEntity> | null = null;

  @Assistant()
  assistant: Ref<AssistantEntity>;

  @Environment()
  environmentID: string;

  [PrimaryKeyProp]?: CMSCompositePK;

  constructor(data: EntityCreateParams<FolderEntity>) {
    super(data);

    ({
      name: this.name,
      scope: this.scope,
      parent: this.parent,
      assistant: this.assistant,
      environmentID: this.environmentID,
    } = FolderEntity.fromJSON(data));
  }

  toJSON(): ToJSONWithForeignKeys<FolderEntity> {
    return FolderEntityAdapter.fromDB({
      ...wrap<FolderEntity>(this).toObject(),
      parent: this.parent ?? null,
      updatedBy: this.updatedBy,
      assistant: this.assistant,
    });
  }
}
