import { MikroORM } from '@mikro-orm/sqlite';
import { performance } from 'perf_hooks';
import {
  AssistantEntity,
  IntentEntity,
  UtteranceEntity,
  UserStubEntity,
  WorkspaceStubEntity,
} from '@/postgres';
import { Language } from './common';
import { ObjectId } from 'bson';

let orm: MikroORM;

const activeEnvironmentID = 'test';

const assistantID = new ObjectId().toHexString();
const intentEntities: IntentEntity[] = [];
const utteranceEntities: UtteranceEntity[] = [];

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: ':memory:',
    entities: [
      IntentEntity,
      UserStubEntity,
      AssistantEntity,
      UtteranceEntity,
      WorkspaceStubEntity,
    ],
    debug: ['query', 'query-params'],
    allowGlobalContext: true, // only for testing
  });

  await orm.schema.refreshDatabase();

  const user = await orm.em.create(UserStubEntity, {});
  const workspace = await orm.em.create(WorkspaceStubEntity, {});

  console.log(workspace.id);

  const assistant = new AssistantEntity({
    id: assistantID,
    name: 'test',
    updatedAt: new Date().toJSON(),
    createdAt: new Date().toJSON(),
    workspaceID: workspace.id,
    updatedByID: user.id,
    activeEnvironmentID: 'test',
  });

  orm.em.persist(assistant);

  for (let i = 0; i < 250; i++) {
    const intent = new IntentEntity({
      name: `Intent ${i}`,
      folderID: null,
      assistantID: assistant.id,
      entityOrder: [],
      createdByID: user.id,
      updatedByID: user.id,
      description: Math.random() > 0.5 ? `Description ${i}` : null,
      environmentID: activeEnvironmentID,
      automaticReprompt: false,
    });

    intentEntities.push(intent);

    for (let j = 0; j < 200; j++) {
      const utterance = new UtteranceEntity({
        text:
          Math.random() > 0.5
            ? [{ entityID: `${i}-${j}` }, `text text ${j}`]
            : [`'text text text ${i} ${j}'`],
        intentID: intent.id,
        language: Language.ENGLISH_US,
        assistantID: assistant.id,
        updatedByID: user.id,
        environmentID: activeEnvironmentID,
      });

      utteranceEntities.push(utterance);
    }
  }

  orm.em.persist(intentEntities);
  orm.em.persist(utteranceEntities);

  await orm.em.flush();
});

beforeEach(async () => {
  await orm.em.clear();
});

afterAll(async () => {
  await orm.close(true);
});

test('em.find', async () => {
  const startedAt = performance.now();

  const [intents, utterance] = await Promise.all([
    orm.em.find(IntentEntity, {
      assistant: assistantID,
      environmentID: activeEnvironmentID,
    }),
    orm.em.find(UtteranceEntity, {
      assistant: assistantID,
      environmentID: activeEnvironmentID,
    }),
  ]);

  const endedAt = performance.now();

  console.log('em.find:', {
    time: endedAt - startedAt,
    intents: intents.length,
    utterance: utterance.length,
  });
});

test('qb.execute', async () => {
  const startedAt = performance.now();

  const [intents, utterance] = await Promise.all([
    orm.em
      .qb(IntentEntity)
      .select('*')
      .where({
        assistant: assistantID,
        environmentID: activeEnvironmentID,
      })
      .execute('all'),
    orm.em
      .qb(UtteranceEntity)
      .select('*')
      .where({
        assistant: assistantID,
        environmentID: activeEnvironmentID,
      })
      .execute('all'),
  ]);

  const endedAt = performance.now();

  console.log('qb.execute:', {
    time: endedAt - startedAt,
    intents: intents.length,
    utterance: utterance.length,
  });
});
