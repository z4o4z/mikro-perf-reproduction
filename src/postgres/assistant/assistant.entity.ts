import {
  Entity,
  ManyToOne,
  Ref,
  Property,
  Unique,
  wrap,
} from '@mikro-orm/core';

import type { EntityCreateParams, ToJSONWithForeignKeys } from '@/types';

import { PostgresCMSObjectEntity } from '../common/entities/postgres-cms-object.entity';
import { WorkspaceStubEntity } from '../stubs/workspace.stub';
import { AssistantEntityAdapter } from './assistant-entity.adapter';

@Entity()
@Unique({ properties: ['id'] })
export class AssistantEntity extends PostgresCMSObjectEntity {
  static fromJSON<JSON extends Partial<ToJSONWithForeignKeys<AssistantEntity>>>(
    data: JSON
  ) {
    return AssistantEntityAdapter.toDB<JSON>(data);
  }

  @Property()
  name: string;

  @ManyToOne(() => WorkspaceStubEntity, {
    name: 'workspace_id',
    deleteRule: 'cascade',
  })
  workspace: Ref<WorkspaceStubEntity>;

  @Property({ name: 'active_environment_id', type: 'varchar', length: 24 })
  activeEnvironmentID: string;

  constructor(data: EntityCreateParams<AssistantEntity>) {
    super(data);

    ({
      name: this.name,
      workspace: this.workspace,

      activeEnvironmentID: this.activeEnvironmentID,
    } = AssistantEntity.fromJSON(data));
  }

  toJSON(): ToJSONWithForeignKeys<AssistantEntity> {
    return AssistantEntityAdapter.fromDB({
      ...wrap<AssistantEntity>(this).toObject(),
      updatedBy: this.updatedBy,
      workspace: this.workspace,
    });
  }
}
