import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260527120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_site_asset_key_unique_not_deleted" ON "site_asset" ("key") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_site_asset_key_unique_not_deleted";`);
  }
}
