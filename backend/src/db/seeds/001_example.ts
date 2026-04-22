import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const exists = await knex('app_meta').where({ key: 'seed_version' }).first();
  if (exists) return;

  await knex('app_meta').insert({
    key: 'seed_version',
    value: '1',
    updated_at: knex.fn.now(),
  });
}
