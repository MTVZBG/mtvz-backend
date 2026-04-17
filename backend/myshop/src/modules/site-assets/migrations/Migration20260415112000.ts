import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260415112000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "site_asset" add column if not exists "content" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "site_asset" drop column if exists "content";`);
  }
}