# Usage Guide

Quick examples and practical use cases for Alith Notify.

> For installation and setup, see `README.md`

---

## Example Output

When errors are detected in your log file:

```
══════════════════════════════════════════════════════════════════════
🆕 NEW ERRORS DETECTED - 3 line(s)
══════════════════════════════════════════════════════════════════════

🤖 AI ANALYSIS:
──────────────────────────────────────────────────────────────────────
**Database Connection Failure**

The application failed to establish a connection to the PostgreSQL 
database at localhost:5432. After multiple retry attempts, the 
connection was abandoned.

**Root Cause:**
- Database server may be offline or not responding
- Network connectivity issues between app and database
- Incorrect database credentials or configuration

**Recommended Actions:**
1. Verify PostgreSQL service is running: systemctl status postgresql
2. Check database connection string in your configuration
3. Test network connectivity: telnet localhost 5432
4. Review database server logs for additional errors
──────────────────────────────────────────────────────────────────────

📄 ORIGINAL LOGS:
──────────────────────────────────────────────────────────────────────
🔴 [2025-10-27 10:00:00] ERROR: Database connection failed
🔴 [2025-10-27 10:00:05] ERROR: Unable to connect to postgres://localhost:5432
🔴 [2025-10-27 10:00:10] ERROR: Max retries exceeded
──────────────────────────────────────────────────────────────────────

📊 METADATA:
   ⏰ Time: 10/27/2025, 10:00:15 AM
   📏 Original: 195 chars
   📝 Summary: 612 chars
   🤖 Model: gpt-4
══════════════════════════════════════════════════════════════════════
```

**Legend:**
- 🔴 ERROR - Critical errors
- 🟡 WARN - Warnings
- ⚪ INFO - Informational

---

## Common Use Cases

### Monitor Application Logs
```json
{
  "logFile": "./logs/app.log",
  "interval": 30
}
```

### Monitor Web Server Logs
```json
{
  "logFile": "/var/log/nginx/error.log",
  "interval": 60
}
```

### Monitor Database Logs
```json
{
  "logFile": "/var/log/postgresql/postgresql.log",
  "interval": 45
}
```

### Monitor Multiple Logs Simultaneously
```bash
# Terminal 1 - App logs
alith-notify --config app-config.json

# Terminal 2 - Database logs
alith-notify --config db-config.json
```

---

## Testing

### Create Test Log File

**Windows:**
```powershell
@"
[2025-10-27 10:00:00] ERROR: Database connection failed
[2025-10-27 10:00:05] ERROR: Unable to connect to postgres://localhost:5432
[2025-10-27 10:00:10] ERROR: Max retries exceeded
"@ | Out-File -FilePath .\server.log -Encoding utf8
```

**Unix/Linux/Mac:**
```bash
cat > server.log << EOF
[2025-10-27 10:00:00] ERROR: Database connection failed
[2025-10-27 10:00:05] ERROR: Unable to connect to postgres://localhost:5432
[2025-10-27 10:00:10] ERROR: Max retries exceeded
EOF
```

### Add More Errors (While Running)

**Windows:**
```powershell
@"
[2025-10-27 10:05:00] ERROR: Authentication failed for user 'admin'
[2025-10-27 10:05:05] WARN: High memory usage: 95%
"@ | Add-Content -Path .\server.log -Encoding utf8
```

**Unix/Linux/Mac:**
```bash
cat >> server.log << EOF
[2025-10-27 10:05:00] ERROR: Authentication failed for user 'admin'
[2025-10-27 10:05:05] WARN: High memory usage: 95%
EOF
```

---

## Advanced Usage

### Save Analysis to File
```bash
npm start > analysis.log 2>&1
```

### Adjust Check Intervals
For busy logs, increase interval to reduce API costs:
```json
{
  "logFile": "./app.log",
  "interval": 120
}
```

### Change AI Model
Edit `src/summarizer.js`:
```javascript
this.agent = new Agent({
  model: 'gpt-3.5-turbo',  // Faster, cheaper
  preamble: 'Your instructions...',
  apiKey: this.apiKey
});
```

### Customize AI Behavior
Edit the `preamble` in `src/summarizer.js`:

**Security Logs:**
```javascript
preamble: 'You are a security analyst. Focus on security threats and unauthorized access.'
```

**Performance Issues:**
```javascript
preamble: 'You are a performance engineer. Analyze for bottlenecks and optimization opportunities.'
```

**User-Friendly Summaries:**
```javascript
preamble: 'Summarize errors in simple, user-friendly language for non-technical stakeholders.'
```

---

## Tips

1. **Start Small** - Test with sample logs before production
2. **Adjust Intervals** - Balance between responsiveness and API costs
3. **Filter Logs** - Use `grep ERROR` to monitor only errors
4. **Save Output** - Pipe to file for long-term analysis
5. **Multiple Instances** - Monitor different logs with separate configs

---

## Supported Log Formats

Works with any text-based format:

**Standard:**
```
[2025-10-27 10:00:00] ERROR: Connection failed
```

**JSON:**
```json
{"timestamp":"2025-10-27T10:00:00Z","level":"ERROR","message":"Connection failed"}
```

**Custom:**
```
ERROR 2025-10-27 10:00:00 - Connection failed
```

The AI analyzes any format intelligently.

---

## Quick Reference

| Task | Command |
|------|---------|
| Start monitoring | `npm start` |
| Development mode | `npm run dev` |
| Create config | `alith-notify --init` |
| Custom config | `alith-notify --config my-config.json` |
| Show help | `alith-notify --help` |

---

For setup and installation instructions, see `README.md`

