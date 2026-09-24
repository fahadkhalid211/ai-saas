# Moving chats, leads and bookings into their own tables (DB_RELATIONAL_MODE)

## Why
By default everything lives in ONE JSON row (`kortex_app_state`). Every save reads and rewrites the whole row (about 1.3 MB today),
two servers saving at once can overwrite each other, and the row keeps only the last 100 messages (older chat history is dropped).

With `DB_RELATIONAL_MODE=true`, conversations, messages, leads, appointments, notifications and unanswered questions have their
own tables: one small insert per item, nothing is overwritten, nothing is truncated, and a unique index stops the same slot being
booked twice even across servers.

Measured on a scratch copy of the live data (10 items each, 200 ms link to the database):

| | one JSON row | own tables |
|---|---|---|
| 10 leads | 10.5 s, 40 calls, 28 MB | 2.1 s, 10 calls, 1 KB |
| 10 chat messages | 12.9 s, 40 calls, 28 MB | 2.1 s, 10 calls, 1 KB |
| two servers writing at once | last writer wins | nothing lost |

## Steps (in this order)
1. Backup: `bash ops/pg-backup.sh` (or `pg_dump`), and keep the file.
2. Create the tables, as the same role the app uses: `npm run db:schema` (idempotent).
3. Copy existing data: `npm run db:backfill` (idempotent; preserves ids and timestamps). Check the counts it prints.
   Appointments that share a slot are rejected by the unique index, so they are reported as "not backfilled": review them.
4. Set `DB_RELATIONAL_MODE=true` in Vercel (Production) and redeploy.
5. Watch System Logs for `db.` errors for a day.

## Rolling back
Unset `DB_RELATIONAL_MODE` and redeploy. The state row keeps a frozen copy of the six collections from the moment of the switch
(new items since then exist only in the tables), so rolling back shows the older data; re-run the backfill in reverse or export
from the tables if you need the newer items.
