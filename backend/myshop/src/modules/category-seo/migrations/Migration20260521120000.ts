import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260521120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "category_seo_content" add column if not exists "media_sections" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "category_seo_content" drop column if exists "media_sections";`);
  }

}
