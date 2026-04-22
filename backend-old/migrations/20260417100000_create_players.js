/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("players", (t) => {
    t.increments("id").primary();
    t.string("wallet_address", 66).notNullable().unique().index();
    t.integer("soft_currency").notNullable().defaultTo(0);
    t.string("owned_character_ids", 2048).notNullable().defaultTo("[0]");
    t.integer("selected_character_id").notNullable().defaultTo(0);
    t.integer("selected_city_id").notNullable().defaultTo(0);
    t.string("last_daily_claim_utc", 32);
    t.integer("claim_streak").notNullable().defaultTo(0);
    t.string("settings_json", 4096);
    t.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("players");
}
