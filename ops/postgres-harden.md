# Hardening the Oracle Postgres server

Your database is reachable from the whole internet on port 5432 (Vercel has no fixed address to allow-list),
so the protection has to come from the database itself: **encrypted connections, a limited login, a long
random password, and no remote superuser.** Do the steps in this order so the app never loses its connection.

Run the commands on the **database VM** (SSH in). Replace `pg` with your container name (`docker ps`).

## 1. Turn on TLS (no restart needed)

```bash
mkdir -p ~/pgcerts && cd ~/pgcerts
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -subj "/CN=Crescelo DB CA" -out ca.crt
openssl genrsa -out server.key 2048
openssl req -new -key server.key -subj "/CN=155.248.251.71" -out server.csr
printf "subjectAltName=IP:155.248.251.71\n" > san.ext      # add ,DNS:db.yourdomain.com if you use a name
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 825 -sha256 -extfile san.ext

PGDATA=$(docker exec pg printenv PGDATA)      # usually /var/lib/postgresql/data
docker cp server.crt pg:$PGDATA/server.crt
docker cp server.key pg:$PGDATA/server.key
docker exec -u root pg chown postgres:postgres $PGDATA/server.crt $PGDATA/server.key
docker exec -u root pg chmod 600 $PGDATA/server.key
docker exec -u postgres pg psql -U postgres \
  -c "ALTER SYSTEM SET ssl = 'on'" \
  -c "ALTER SYSTEM SET ssl_cert_file = 'server.crt'" \
  -c "ALTER SYSTEM SET ssl_key_file = 'server.key'" \
  -c "SELECT pg_reload_conf()"
docker exec pg psql -U postgres -c "SHOW ssl"          # -> on
```

The certificate lasts 825 days: put a reminder in your calendar to reissue it (same commands).

Now change `DATABASE_URL` (Vercel **and** your local `.env`) from `sslmode=disable` to `sslmode=require`, and add
`DATABASE_SSL_CA` with the contents of `ca.crt` (`cat ~/pgcerts/ca.crt`; in Vercel you can paste it with real line
breaks). With the CA set, the app also checks it is talking to *your* server, not an impostor. Redeploy and open the
dashboard to confirm it still works.

## 2. Give the app a limited login (stop using `postgres`)

Generate a password: `openssl rand -hex 24`

```bash
docker exec -u postgres pg psql -U postgres <<'SQL'
CREATE ROLE crescelo_app LOGIN PASSWORD 'PASTE_THE_NEW_PASSWORD'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION CONNECTION LIMIT 25;
GRANT ALL ON SCHEMA public TO crescelo_app;
ALTER TABLE kortex_app_state OWNER TO crescelo_app;
-- if you later enable relational mode, give it the other kortex_* tables too:
-- DO $$ DECLARE t text; BEGIN FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'kortex_%' LOOP EXECUTE format('ALTER TABLE %I OWNER TO crescelo_app', t); END LOOP; END $$;
REVOKE ALL ON DATABASE postgres FROM PUBLIC;
GRANT CONNECT ON DATABASE postgres TO crescelo_app;
SQL
```

Point `DATABASE_URL` at it: `postgresql://crescelo_app:NEW_PASSWORD@155.248.251.71:5432/postgres?sslmode=require`,
redeploy, confirm the dashboard works. **The old `postgres` password is now only for you, on the server.**

## 2b. Switch on the real tables (stops lost data and double bookings)

Today everything lives in one JSON row that every write replaces, so two visitors chatting on two servers can
overwrite each other's messages, and two people can book the same slot. The relational tables fix that (including a
database-level "one booking per slot" rule). With `DATABASE_URL` pointing at `crescelo_app`:

```bash
npm run db:schema                       # creates the tables (safe to run twice)
npx tsx scripts/backfill-relational.ts  # copies the existing chats/leads/bookings across
npm run db:verify                       # everything under "relational schema" should now be OK
```

Then set `DB_RELATIONAL_MODE=true` in Vercel and redeploy. (If you ran `db:schema` as `postgres` instead, give the tables
to the app role first: run the commented `DO $$ ... OWNER TO crescelo_app` block from step 2.)

**Use a separate database for development.** Your local `.env` currently points at the same database as production, so
every local test writes fake accounts into it (there are about 40 now). Create one: `CREATE DATABASE crescelo_dev OWNER crescelo_app;`
and put `.../crescelo_dev` in your local `.env` only. Then run `npm run db:schema` against it.

## 3. Close the doors

Only after steps 1 and 2 work in production:

```bash
docker exec -u postgres pg sh -c '
cp $PGDATA/pg_hba.conf $PGDATA/pg_hba.conf.bak
sed -i -E "s/^host\s+all\s+all\s+all\s+scram-sha-256\s*$/hostssl postgres crescelo_app all scram-sha-256/" $PGDATA/pg_hba.conf
psql -U postgres -c "SELECT pg_reload_conf()"
'
docker exec pg psql -U postgres -c "SELECT type, database, user_name, address, auth_method FROM pg_hba_file_rules"
```

The last rule should read `hostssl | postgres | crescelo_app | all | scram-sha-256`. Now the internet can only reach
the database over TLS, and only as `crescelo_app`. The `postgres` superuser can log in only from the server itself.
Finally set `DATABASE_REQUIRE_TLS=true` in Vercel so the app refuses to connect in plain text.

If anything goes wrong: `docker exec -u postgres pg sh -c 'cp $PGDATA/pg_hba.conf.bak $PGDATA/pg_hba.conf && psql -U postgres -c "SELECT pg_reload_conf()"'`.

## 4. Back up (the free VM is a single point of failure)

Copy `ops/pg-backup.sh` to the VM, then `chmod +x` it and add it to cron:

```bash
( crontab -l 2>/dev/null; echo '15 3 * * * /home/ubuntu/pg-backup.sh >> /home/ubuntu/backups/backup.log 2>&1' ) | crontab -
```

Copy a backup **off** the VM regularly (Oracle Object Storage, or `scp` to your own computer). A backup on the same
disk does not survive losing the VM. Test a restore once: `gunzip -c file.sql.gz | psql ...` into a scratch database.

## 5. The VM itself

- Oracle security list: keep only ports 22, 5432 (and 80/443 on the voice VM). Restrict 22 to your own IP if it is stable.
- SSH: keys only (`PasswordAuthentication no` in `/etc/ssh/sshd_config`).
- `sudo apt-get install -y unattended-upgrades fail2ban && sudo dpkg-reconfigure -plow unattended-upgrades`.
- Keep the Postgres image current: `docker pull` the same tag, recreate the container on the same data volume.
