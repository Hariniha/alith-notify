# Alith Notify

> Capture terminal errors, summarize with AI, and automatically send to GitHub Copilot for fixing.

## What It Does

**Alith Notify** captures errors from your terminal and uses AI to help you fix them:

1. 🔍 **Captures** all terminal errors automatically (stderr, console.error, exceptions)
2. 📝 **Logs** them to a file for review
3. 🤖 **Summarizes** using AI (Alith Agent SDK with GPT-4)
4. 🚀 **Auto-sends** to GitHub Copilot Chat (no copy/paste!)
5. 🔧 **Copilot fixes** the issues with AI-powered suggestions

No manual work - just automatic error capture and AI-powered fixes!

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

### 3. Run the Capture System
```bash
npm start
```

### 4. Generate Errors (in another terminal)
```bash
npm run test:errors
```

That's it! The system will capture errors, summarize them, and generate prompts for Copilot.

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
✅ **AI-powered error fixing** (GPT-4)  
✅ Beautiful console output with color-coding  
✅ **Root cause analysis and specific fixes**  
✅ **Confidence ratings** for each suggested fix  
✅ File rotation support  
✅ Zero external dependencies (no webhooks)  
✅ Brief, actionable fix descriptions  

---

## How It Works

1. Watcher monitors your log file every N seconds
2. New errors are sent to Alith Agent (GPT-4)
3. **AI analyzes errors and suggests specific fixes**
4. **Each fix includes: error, root cause, solution, and confidence level**
5. Beautiful output displays in your console with brief fix descriptions

---

## Customization

**Change AI Model** - Edit `src/fixer.js`:
```javascript
model: 'gpt-3.5-turbo'  // Faster, cheaper option
```

**Adjust Interval** - Edit `alith.config.json`:
```json
{ "interval": 60 }  // Check every 60 seconds
```

**Custom AI Instructions** - Edit `preamble` in `src/fixer.js`

For more examples, see `USAGE.md` and `ERROR-FIXING-MODE.md`

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
