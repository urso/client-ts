import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import { XataClient } from '../../packages/codegen/example/xata';
import { setUpTestEnvironment, TestEnvironmentResult } from '../utils/setup';

let xata: XataClient;
let hooks: TestEnvironmentResult['hooks'];

beforeAll(async (ctx) => {
  const result = await setUpTestEnvironment('summarize');

  xata = result.client;
  hooks = result.hooks;

  await hooks.beforeAll(ctx);

  const [pet1, pet2, pet3] = await xata.db.pets.create([
    { name: 'Otis', type: 'dog', num_legs: 4 },
    { name: 'Toffee', type: 'cat', num_legs: 4 },
    { name: 'Lyra', type: 'dog', num_legs: 3 }
  ]);

  await xata.db.users.create([
    { full_name: 'A', name: 'A', index: 10, rating: 10.5, settings: { plan: 'paid', dark: true }, pet: pet1.id },
    { full_name: 'B', name: 'B', index: 10, rating: 10.5, settings: { plan: 'free' }, pet: pet2.id },
    { full_name: 'C', name: 'C', index: 30, rating: 40.0, settings: { plan: 'paid' }, pet: pet3.id }
  ]);
});

afterAll(async (ctx) => {
  await hooks.afterAll(ctx);
});

beforeEach(async (ctx) => {
  await hooks.beforeEach(ctx);
});

afterEach(async (ctx) => {
  await hooks.afterEach(ctx);
});

describe('summarize', () => {
  test('group by', async () => {
    const result = await xata.db.users.summarize({
      columns: ['index', 'rating'],
      sort: [{ column: 'index', direction: 'asc' }]
    });

    expect(result.summaries).toEqual([
      { index: 10, rating: 10.5 },
      { index: 30, rating: 40.0 }
    ]);
  });

  test('group by without any common groups', async () => {
    const result = await xata.db.users.select(['name', 'rating']).sort('name', 'asc').summarize();

    expect(result.summaries).toEqual([
      { name: 'A', rating: 10.5 },
      { name: 'B', rating: 10.5 },
      { name: 'C', rating: 40.0 }
    ]);
  });

  test('group by with wildcard columns', async () => {
    const result = await xata.db.users
      .select(['settings.*'])
      .sort('settings.plan', 'asc')
      .sort('settings.dark', 'asc')
      .summarize();

    expect(result.summaries).toEqual([
      { settings: { plan: 'free', labels: null, dark: null } },
      { settings: { plan: 'paid', labels: null, dark: true } },
      { settings: { plan: 'paid', labels: null, dark: null } }
    ]);
  });

  test('group by with a link', async () => {
    const result = await xata.db.users
      .select(['name', 'settings.plan', 'pet.type', 'pet.num_legs'])
      .summarize({ sort: [{ column: 'name', direction: 'asc' }] });

    expect(result.summaries).toEqual([
      { name: 'A', settings: { plan: 'paid' }, pet: { type: 'dog', num_legs: 4 } },
      { name: 'B', settings: { plan: 'free' }, pet: { type: 'cat', num_legs: 4 } },
      { name: 'C', settings: { plan: 'paid' }, pet: { type: 'dog', num_legs: 3 } }
    ]);
  });

  test('count without groups', async () => {
    const result = await xata.db.users.summarize({
      summaries: {
        all: { count: '*' },
        col: { count: 'name' },
        obj_with_null: { count: 'settings.dark' },
        link: { count: 'pet.type' }
      }
    });

    expect(result.summaries).toEqual([
      {
        all: 3,
        col: 3,
        obj_with_null: 1,
        link: 3
      }
    ]);
  });

  test('count with groups', async () => {
    const result = await xata.db.users.select(['index', 'pet.num_legs']).summarize({
      summaries: { nl: { count: 'pet.num_legs' } },
      sort: [{ column: 'index', direction: 'asc' }]
    });

    expect(result.summaries).toEqual([
      { index: 10, pet: { num_legs: 4 }, nl: 2 },
      { index: 30, pet: { num_legs: 3 }, nl: 1 }
    ]);
  });

  test('count with sort on group', async () => {
    const result = await xata.db.users.select(['index', 'pet.type']).summarize({
      summaries: { nl: { count: 'pet.num_legs' } },
      sort: [
        { column: 'index', direction: 'asc' },
        { column: 'pet.type', direction: 'desc' }
      ]
    });

    expect(result.summaries).toEqual([
      { index: 10, pet: { type: 'dog' }, nl: 1 },
      { index: 10, pet: { type: 'cat' }, nl: 1 },
      { index: 30, pet: { type: 'dog' }, nl: 1 }
    ]);
  });

  test('count with sort on summary', async () => {
    const result = await xata.db.users.select(['index']).summarize({
      summaries: { total: { count: '*' } },
      sort: [{ column: 'total', direction: 'desc' }]
    });

    expect(result.summaries).toEqual([
      { index: 10, total: 2 },
      { index: 30, total: 1 }
    ]);
  });

  test('count with sort on group and count', async () => {
    const result = await xata.db.users.summarize({
      columns: ['pet.name'],
      summaries: { dark_set: { count: 'settings.dark' } },
      sort: [
        { column: 'dark_set', direction: 'desc' },
        { column: 'pet.name', direction: 'asc' }
      ]
    });

    expect(result.summaries).toEqual([
      { pet: { name: 'Otis' }, dark_set: 1 },
      { pet: { name: 'Lyra' }, dark_set: 0 },
      { pet: { name: 'Toffee' }, dark_set: 0 }
    ]);
  });

  test('summarize with no results', async () => {
    const result = await xata.db.users.summarize({
      columns: ['name'],
      summaries: { total: { count: '*' } },
      filter: { id: 'nomatches' }
    });

    expect(result.summaries).toEqual([]);
  });

  test('filter on id', async () => {
    const user1 = await xata.db.users.filter({ name: 'A' }).getFirst();

    const result = await xata.db.users.summarize({
      columns: ['name'],
      summaries: { total: { count: '*' } },
      filter: { id: user1?.id ?? '' }
    });

    expect(result.summaries).toEqual([{ name: 'A', total: 1 }]);
  });

  test('filter should create joins', async () => {
    const result = await xata.db.users.summarize({
      columns: ['name'],
      summaries: { dark_set: { count: 'settings.dark' } },
      sort: [{ dark_set: 'desc' }],
      filter: { 'pet.name': 'Toffee' }
    });

    expect(result.summaries).toEqual([{ name: 'B', dark_set: 0 }]);
  });

  test('group by, count, sort, filter', async () => {
    const result = await xata.db.users.summarize({
      columns: ['pet.name'],
      summaries: { dark_set: { count: 'settings.dark' } },
      sort: [{ column: 'pet.name', direction: 'asc' }],
      filter: { 'pet.type': 'dog' }
    });

    expect(result.summaries).toEqual([
      { pet: { name: 'Lyra' }, dark_set: 0 },
      { pet: { name: 'Otis' }, dark_set: 1 }
    ]);
  });
});
