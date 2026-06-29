-- Safe incremental patch for CMS section field upserts.
-- It removes only exact duplicate section_id/field_key rows after preserving the newest row,
-- then guarantees the conflict target required by Supabase upsert.

with ranked as (
  select
    id,
    row_number() over (
      partition by section_id, field_key
      order by updated_at desc nulls last, created_at desc nulls last, id desc
    ) as duplicate_rank
  from public.section_fields
)
delete from public.section_fields sf
using ranked r
where sf.id = r.id
  and r.duplicate_rank > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.section_fields'::regclass
      and conname = 'section_fields_section_id_field_key_key'
  ) then
    alter table public.section_fields
      add constraint section_fields_section_id_field_key_key unique (section_id, field_key);
  end if;
end $$;
