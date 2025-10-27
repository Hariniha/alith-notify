# Alith Notify

> AI-powered log monitoring tool that watches your log files and provides intelligent error analysis directly in your console.

## What It Does

**Alith Notify** continuously monitors your log files and uses AI (via Alith Agent SDK with GPT-4) to:
- 🔍 Detect new errors automatically
- 🤖 Analyze them with artificial intelligence
- 📊 Display beautiful summaries in your console
- 💡 Suggest root causes and solutions

No webhooks, no external services - just smart error analysis in your terminal.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Your OpenAI API Key

**Option 1: Using .env file (Recommended)**

Create a `.env` file in the project root:
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Option 2: Using environment variable**
```powershell
# Windows PowerShell
$env:OPENAI_API_KEY = "sk-your-openai-api-key-here"
```

For Unix/Mac:
```bash
export OPENAI_API_KEY="sk-your-openai-api-key-here"
```

### 3. Configure
Edit `alith.config.json`:
```json
{
  "logFile": "./server.log",
  "interval": 30
}
```

### 4. Run
```bash
npm start
```

That's it! The tool will monitor your log file and display AI-powered analysis when errors are detected.

---

## Configuration

### Config File: `alith.config.json`

```json
{
  "logFile": "./server.log",
  "interval": 30
}
```

### Fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `logFile` | Yes | - | Path to log file to monitor |
| `interval` | No | 30 | Check interval in seconds |

**Note:** Alith Agent uses the `OPENAI_API_KEY` environment variable automatically.

---

## Commands

```bash
npm start                           # Start monitoring
npm run dev                         # Development mode (auto-restart)
alith-notify --init                 # Create default config
alith-notify --config my-config.json # Use custom config
alith-notify --help                 # Show help
```

For detailed usage examples, see `USAGE.md`

---

## Features

✅ Real-time log monitoring  
✅ AI-powered error analysis (GPT-4)  
✅ Beautiful console output with color-coding  
✅ Root cause analysis and solutions  
✅ File rotation support  
✅ Zero external dependencies (no webhooks)  

---

## How It Works

1. Watcher monitors your log file every N seconds
2. New errors are sent to Alith Agent (GPT-4)
3. AI analyzes and generates actionable summary
4. Beautiful output displays in your console

---

## Customization

**Change AI Model** - Edit `src/summarizer.js`:
```javascript
model: 'gpt-3.5-turbo'  // Faster, cheaper option
```

**Adjust Interval** - Edit `alith.config.json`:
```json
{ "interval": 60 }  // Check every 60 seconds
```

**Custom AI Instructions** - Edit `preamble` in `src/summarizer.js`

For more examples, see `USAGE.md`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Authentication Error | Set `OPENAI_API_KEY` environment variable |
| Config file not found | Run `alith-notify --init` to create it |
| Log file not found | Tool will wait for file creation |
| Failed to get summary | Check API keys and internet connection |

---

## Requirements

- Node.js >= 18.0.0
- OpenAI API key (Alith Agent uses this automatically)

---

## License

MIT License

---

For detailed examples and use cases, see **`USAGE.md`**

**Built with ❤️ using Alith Agent SDK**
