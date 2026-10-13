# Project Guidance

## User Preferences

- Fokus pada rekap harian nasi dan lauk
- Menonjolkan kondisi kelebihan dan kekurangan

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Frontend: a form seeded only in useState must be keyed by the selected record id to remount when the selection changes.
- Frontend: React Query isLoading is false for disabled queries, so gate loading skeletons on an explicit actor-ready flag too.
- Frontend: a resolved #err Result is not a rejected promise, so delete/update handlers must inspect the Result variant before showing success.
- Backend: OQL Expose auto-derivation resolves <Type>Value.mo _toRow instances only from modules imported top-level in the file that declares the entities; a variant field needs that import or moc reports M0230.
- Backend: with check-limit=1, two pending migrations fail the stable-compatibility check; fold the older pending migration's NewActor into the newer file's OldActor and delete the older file.
- Backend: a triple-quoted multi-line Text literal passed as a call argument is misparsed as a function-call head (M0097); build documents from single-line literals joined with #.
- Backend: Time.now() returns Int; convert with .toNat() for a Nat timestamp field.
- Backend: mops check --fix runs the stable compatibility check and lint fixes in one pass; run mops build then pnpm bindgen from the project root.
