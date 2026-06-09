# My-Quran 📖 — Global Islamic Companion

> *Muslim Pro in your chat pocket — no app install needed.*

An AI-powered Islamic companion MCP server for the **Poke** platform.
Built by **HANS Labs**. Works worldwide in **35+ languages**.

## Features (v0.4.0 — 22 Tools)

| # | Tool | Description |
|---|------|-------------|
| F1 | `get_daily_ayah` | Random daily Quran verse — Arabic + translation + audio |
| F2 | `search_quran` | Search by keyword, surah name, or `2:255` reference |
| F3 | `list_surahs` / `get_surah` | Browse all 114 surahs with pagination |
| F4 | `ask_question` | Islamic Q&A grounded in Quran text (30+ language keywords) |
| F5 | `get_prayer_times` | Prayer times for **any city worldwide** or GPS coordinates |
| F6 | `get_dua` / `list_dua_categories` | 30+ duas in 14 categories (Arabic + transliteration + translation) |
| F7 | `get_preferences` / `set_preference` | Personalization: language, city, reading streak, daily ayah time |
| F8 | `get_qibla` | Qibla bearing from any GPS location |
| F9 | `get_99names` / `get_name_detail` | 99 Names of Allah (Asmaul Husna) with detail |
| F10 | `get_hijri_date` / `islamic_events` | Today's Hijri date + upcoming Islamic holidays |
| F11 | `calculate_zakat` | Zakat calculator — any currency, gold/silver nisab |
| F12 | `get_quote` / `list_quote_themes` | 26 Quran & Hadith quotes across 15 themes |
| F13 | `find_mosques` | Nearest mosques from any city or GPS (via Overpass API) |
| F14 | `hajj_guide` / `umrah_guide` | Step-by-step Hajj & Umrah guides with duas |
| F15 | `get_imsak_times` / `tarawih_info` / `laylatul_qadr_info` | Ramadhan suite: imsak, tarawih, laylatul qadr |
| — | `get_ayah_audio` | Audio recitation URL (5 world-renowned reciters) |

## Quick Start

```bash
cd mcp-server
pnpm install && pnpm build

# Stdio MCP server (local use)
node dist/index.js

# HTTP/SSE server (Poke tunnel)
node dist/server-http.js
```

## Deploy via Poke

```bash
# Terminal 1: Start MCP server
cd mcp-server && pnpm build && node dist/server-http.js

# Terminal 2: Start Poke tunnel
npx poke login
npx poke tunnel http://localhost:3000/mcp -n my-quran
```

**PM2 production:**
```bash
pm2 start "node dist/server-http.js" --name my-quran --cwd mcp-server
pm2 start "npx poke tunnel http://localhost:3000/mcp -n my-quran" --name poke-tunnel
```

## Project Structure

```
my-quran/
├── recipe.json                    # Poke Kitchen recipe (v0.4.0)
├── README.md
├── assets/                        # Favicon & app icons
├── docs/
│   ├── PRD.md                     # Product requirements
│   └── ONBOARDING.md              # User onboarding flow
└── mcp-server/
    ├── package.json
    ├── src/
    │   ├── index.ts                # Stdio entry (MCP)
    │   ├── server-http.ts          # HTTP/SSE entry (Poke)
    │   ├── tools-registry.ts       # Shared tool registration
    │   ├── tools/
    │   │   ├── quran.ts            # F1-F3
    │   │   ├── prayer.ts           # F5, F8, F10
    │   │   ├── dua.ts              # F6
    │   │   ├── question.ts         # F4
    │   │   ├── quotes.ts           # F12
    │   │   ├── zakat.ts            # F11
    │   │   ├── mosques.ts          # F13
    │   │   ├── hajj-umrah.ts       # F14
    │   │   ├── ramadan.ts          # F15
    │   │   └── personalization.ts  # F7
    │   ├── services/
    │   │   ├── alquran-cloud.ts    # Quran API (35+ editions)
    │   │   ├── aladhan.ts          # Prayer/Qibla/Hijri API
    │   │   ├── overpass.ts         # OpenStreetMap mosque finder
    │   │   ├── languages.ts        # Multi-language keyword mapping
    │   │   └── cache.ts            # SQLite response cache
    │   └── data/
    │       ├── duas.json           # Core duas (13)
    │       ├── duas-extra.json     # Additional duas (17)
    │       ├── quotes.json         # 26 Quranic & Hadith quotes
    │       ├── 99names.json        # Full 99 Asmaul Husna
    │       ├── hajj-guide.json     # Hajj step-by-step
    │       ├── umrah-guide.json    # Umrah step-by-step
    │       └── ramadan.json        # Ramadhan data
    └── tests/smoke.ts              # 22/22 passing
```

## Smoke Test: 22/22 ✅

```
F1-F3:   Quran: Daily Ayah, Search, Browse Surah   ✅
F4:      Islamic Q&A (30+ language keywords)        ✅
F5:      Prayer Times (London, Dubai, NYC, Tokyo)   ✅
F6:      Duas (30 duas, 14 categories)              ✅
F7:      Personalization (SQLite, streak)           ✅
F8:      Qibla Direction (any GPS)                  ✅
F9:      99 Names + Detail                          ✅
F10:     Hijri Date + Islamic Events                ✅
F11:     Zakat Calculator (any currency)            ✅
F12:     Quotes (26 quotes, 15 themes)              ✅
F13:     Mosque Finder (London, Jakarta, Dubai)     ✅
F14:     Hajj & Umrah Guides                        ✅
F15:     Ramadhan Suite (Imsak, Tarawih, Qadr)      ✅
Audio:   Reciter URLs                               ✅
```

## External APIs (all free, no API key)

| API | Purpose |
|-----|---------|
| [Al-Quran Cloud](https://alquran.cloud) | Quran text, translations (35+ editions) |
| [Al-Adhan](https://aladhan.com) | Prayer times, Hijri, Qibla |
| [Overpass](https://overpass-api.de) | OpenStreetMap mosque finder |
