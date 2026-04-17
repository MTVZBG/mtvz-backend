import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260415100310 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "site_asset" ("id" text not null, "key" text not null, "scope" text not null, "entity_type" text not null, "entity_handle" text null, "slot" text not null, "label" text not null, "image_url" text not null, "alt_text" text not null, "is_active" boolean not null default true, "sort_order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "site_asset_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_site_asset_deleted_at" ON "site_asset" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "site_asset" cascade;`);
  }

}
