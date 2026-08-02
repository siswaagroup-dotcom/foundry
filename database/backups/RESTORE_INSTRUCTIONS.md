# Railway PostgreSQL Restore Instructions

## Backup File
`foundry_local_20260801_001709.dump`

## Steps

### 1. Set Railway DATABASE_URL
Replace the URL below with your actual Railway connection string from:
Railway Dashboard → PostgreSQL service → Connect tab → Connection URL

```powershell
$RAILWAY_URL = "postgresql://postgres:PASSWORD@HOST:PORT/railway"
```

### 2. Restore the backup
```powershell
$PG_BIN = "C:\Program Files\PostgreSQL\18\bin"
$BACKUP = "database\backups\foundry_local_20260801_001709.dump"

& "$PG_BIN\pg_restore.exe" `
    --dbname="$RAILWAY_URL" `
    --verbose `
    --no-owner `
    --no-acl `
    --single-transaction `
    "$BACKUP"
```

### 3. Apply the two skipped migrations
These were skipped locally due to duplicate V018/V019 version numbers:
```powershell
& "$PG_BIN\psql.exe" "$RAILWAY_URL" -f "database\migrations\V018__settings_dynamic.sql"
& "$PG_BIN\psql.exe" "$RAILWAY_URL" -f "database\migrations\V019__integration_credentials.sql"
```

### 4. Verify
```powershell
& "$PG_BIN\psql.exe" "$RAILWAY_URL" -c "SELECT version, description FROM schema_migrations ORDER BY version;"
& "$PG_BIN\psql.exe" "$RAILWAY_URL" -c "SELECT relname, n_live_tup FROM pg_stat_user_tables WHERE schemaname='public' ORDER BY n_live_tup DESC;"
```
