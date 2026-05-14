import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260514120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "category_seo_content" ("id" text not null, "category_handle" text not null, "locale" text not null default 'bg', "seo_title" text not null, "seo_description" text not null, "intro_text" text not null, "bottom_text" text not null, "faq" jsonb null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "category_seo_content_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_category_seo_content_deleted_at" ON "category_seo_content" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_category_seo_content_handle_locale" ON "category_seo_content" ("category_handle", "locale") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "category_seo_content" cascade;`);
  }

}
