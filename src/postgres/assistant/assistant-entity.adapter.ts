import { createSmartMultiAdapter } from 'bidirectional-adapter';

import { PostgresCMSObjectEntityAdapter } from '@/postgres/common/adapters/postgres-cms-object-entity.adapter';
import type { EntityObject, ToJSONWithForeignKeys } from '@/types';

import { WorkspaceStubEntity } from '../stubs/workspace.stub';
import type { AssistantEntity } from './assistant.entity';
import { ref } from '@mikro-orm/core';

export const AssistantEntityAdapter = createSmartMultiAdapter<
  EntityObject<AssistantEntity>,
  ToJSONWithForeignKeys<AssistantEntity>,
  [],
  [],
  [['workspace', 'workspaceID']]
>(
  ({ workspace, ...data }) => ({
    ...PostgresCMSObjectEntityAdapter.fromDB(data),

    ...(workspace !== undefined && { workspaceID: workspace.id }),
  }),
  ({ workspaceID, activeEnvironmentID, ...data }) => ({
    ...PostgresCMSObjectEntityAdapter.toDB(data),

    ...(workspaceID !== undefined && {
      workspace: ref(WorkspaceStubEntity, workspaceID),
    }),

    ...(activeEnvironmentID !== undefined && {
      activeEnvironmentID,
    }),
  })
);
