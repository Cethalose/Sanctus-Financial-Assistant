begin;

create extension if not exists pgcrypto;

insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
)
values
  (
    '00000000-0000-0000-0000-0000000000a1',
    'budget-a@example.test',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-0000000000b2',
    'budget-b@example.test',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  ),
  (
    '00000000-0000-0000-0000-0000000000c3',
    'budget-c@example.test',
    crypt('password', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    'authenticated',
    'authenticated'
  )
on conflict (id) do nothing;

set local role authenticated;
set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000000a1';

insert into public.profiles (id, email)
values ('00000000-0000-0000-0000-0000000000a1', 'budget-a@example.test');

insert into public.budgets (
  user_id,
  monthly_income_cents,
  required_expenses_cents,
  flexible_expenses_cents,
  savings_target_cents,
  currency
)
values (
  '00000000-0000-0000-0000-0000000000a1',
  500000,
  250000,
  100000,
  75000,
  'USD'
);

do $$
declare
  visible_count integer;
begin
  select count(*) into visible_count from public.budgets;
  if visible_count <> 1 then
    raise exception 'user_a expected to see 1 own budget, saw %', visible_count;
  end if;
end $$;

set local "request.jwt.claim.sub" = '00000000-0000-0000-0000-0000000000b2';

do $$
declare
  visible_count integer;
  affected_count integer;
begin
  select count(*) into visible_count from public.budgets;
  if visible_count <> 0 then
    raise exception 'user_b expected to see 0 user_a budgets, saw %', visible_count;
  end if;

  update public.budgets
  set monthly_income_cents = 900000
  where user_id = '00000000-0000-0000-0000-0000000000a1';

  get diagnostics affected_count = row_count;
  if affected_count <> 0 then
    raise exception 'user_b unexpectedly updated % user_a budgets', affected_count;
  end if;
end $$;

do $$
begin
  insert into public.budgets (
    user_id,
    monthly_income_cents,
    required_expenses_cents,
    flexible_expenses_cents,
    savings_target_cents,
    currency
  )
  values (
    '00000000-0000-0000-0000-0000000000c3',
    700000,
    250000,
    100000,
    75000,
    'USD'
  );

  raise exception 'user_b unexpectedly inserted a budget for user_c';
exception
  when insufficient_privilege or check_violation then
    null;
end $$;

insert into public.profiles (id, email)
values ('00000000-0000-0000-0000-0000000000b2', 'budget-b@example.test');

insert into public.budgets (
  user_id,
  monthly_income_cents,
  required_expenses_cents,
  flexible_expenses_cents,
  savings_target_cents,
  currency
)
values (
  '00000000-0000-0000-0000-0000000000b2',
  600000,
  240000,
  120000,
  100000,
  'USD'
);

do $$
declare
  visible_count integer;
begin
  select count(*) into visible_count from public.budgets;
  if visible_count <> 1 then
    raise exception 'user_b expected to see 1 own budget, saw %', visible_count;
  end if;
end $$;

rollback;
