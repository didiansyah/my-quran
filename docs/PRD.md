# PRD: My-Quran — Poke Recipe (Al-Quran Companion)

**Author:** HANS Labs
**Date:** 2026-06-09
**Status:** Draft v1.0
**Project Path:** `/root/my-quran`

---

## 1. Vision

An AI-powered Islamic companion accessible via chat (Telegram, WhatsApp, iMessage) through the Poke platform. Inspired by **Poke Bible Recipe** (daily scripture + Q&A + personalization) and **Muslim Pro** (comprehensive Islamic features). 

> *"Muslim Pro di kantong chat lo — tanpa install app."*

---

## 2. Competitive Reference

### 2.1 Poke Bible Recipe
| Feature | Description |
|---------|------------|
| Daily scripture | Kirim daily passage via text |
| Explore & ask | User bisa tanya apa aja tentang Bible |
| Personalization | Learning user preferences over time |

### 2.2 Muslim Pro Features (full list)
| Feature | Chat-Ready? |
|---------|-------------|
| Waktu Sholat, Kiblat, Adzan | ✅ |
| Al-Quran (40+ terjemahan) | ✅ |
| Tanya AiDeen (AI Islamic bot) | ✅ |
| Duas Harian | ✅ |
| Kutipan Inspiratif | ✅ |
| Kalkulator Zakat | ✅ |
| Pencari Masjid | ⚠️ (via location share) |
| Pencari Makanan Halal | ⚠️ (via location share) |
| Kartu Ucapan | ❌ |
| Permintaan Doa | ✅ |
| 99 Nama Allah | ✅ |
| Makkah Live | ❌ |
| Kalender Hijriah | ✅ |
| Panduan Haji & Umrah | ✅ |
| Artikel Blog | ❌ |
| Qalbox (video streaming) | ❌ |

---

## 3. Architecture

```
┌─────────────────┐     ┌──────────┐     ┌──────────────────┐
│  User (Telegram) │────▶│ Poke Cloud│────▶│  npx poke tunnel │
│  WA / iMessage   │◀────│          │◀────│  (port 3000)     │
└─────────────────┘     └──────────┘     └──────┬───────────┘
                                                 │
                                        ┌────────▼───────────┐
                                        │  MCP Server        │
                                        │  (mcp-quran)       │
                                        │  Node.js/TS        │
                                        │  Port 3000         │
                                        └──────┬───────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                   ┌──────▼──────┐    ┌───────▼───────┐   ┌───────▼───────┐
                   │ Quran API   │    │ Prayer Times  │   │ Hijri Calendar│
                   │ alquran.    │    │ API           │   │ API           │
                   │ cloud       │    │ (aladhan.com) │   │ (aladhan.com) │
                   └─────────────┘    └───────────────┘   └───────────────┘
```

---

## 4. Features — Phased Roadmap

### Phase 1: MVP (Chat-Core) 🚀

| ID | Feature | MCP Tool | Description |
|----|---------|----------|-------------|
| F1 | **Daily Ayah** | `get_daily_ayah` | Kirim 1 ayat + terjemahan ID/EN + tafsir singkat, auto-personalized based on reading history |
| F2 | **Al-Quran Search** | `search_quran` | Cari ayat by keyword, surah name, surah:ayah reference. Return Arabic + translation + tafsir |
| F3 | **Browse Surah** | `get_surah`, `list_surahs` | List surah, baca per surah dengan pagination (per halaman) |
| F4 | **AI Islamic Q&A** | `ask_question` | Tanya apa aja tentang Islam — Quran, hadith, fiqh, sejarah. Grounded in authentic sources |
| F5 | **Prayer Times** | `get_prayer_times` | By city name or coordinates. Returns all 5 prayer times + sunrise + current timezone |
| F6 | **Daily Duas** | `get_daily_dua`, `list_dua_categories` | Morning/evening duas, situational duas (travel, eating, etc.) |
| F7 | **Personalization** | (internal state) | Remember user's preferred language, last read ayah, prayer city, reading streak |

### Phase 2: Rich Features ⭐

| ID | Feature | MCP Tool | Description |
|----|---------|----------|-------------|
| F8 | **Qibla Direction** | `get_qibla` | Return qibla bearing from user's location (lat/lng or city) |
| F9 | **99 Names of Allah** | `get_names`, `get_name_detail` | List all 99 names with transliteration, meaning, and virtues |
| F10 | **Hijri Calendar** | `get_hijri_date`, `islamic_events` | Today's Hijri date, upcoming Islamic events (Ramadhan, Eid, etc.) |
| F11 | **Zakat Calculator** | `calculate_zakat` | Input assets (cash, gold, silver, trade goods) → calculate nisab & zakat owed |
| F12 | **Inspirational Quotes** | `get_quote` | Random or themed Quran quotes / hadith |

### Phase 3: Location & Guides 🗺️

| ID | Feature | MCP Tool | Description |
|----|---------|----------|-------------|
| F13 | **Mosque Finder** | `find_mosques` | User shares location → nearest mosques with distance |
| F14 | **Hajj & Umrah Guide** | `hajj_guide`, `umrah_guide` | Step-by-step guides, checklist, dua for each step |
| F15 | **Ramadhan Suite** | `get_imsak`, `tarawih_info` | Imsak times, tarawih guide, laylatul qadr tracking |

---

## 5. MCP Server Specification

### 5.1 Tech Stack
- **Language:** TypeScript (Node.js 18+)
- **Framework:** `@modelcontextprotocol/sdk`
- **Transport:** stdio (for Poke tunnel compatibility)
- **Package manager:** pnpm

### 5.2 Tool Definitions (MVP)

```typescript
// F1: Daily Ayah
{
  name: "get_daily_ayah",
  description: "Get today's daily Quran verse with translation and brief tafsir. Returns Arabic text, Indonesian and English translations.",
  inputSchema: {
    type: "object",
    properties: {
      language: { type: "string", enum: ["id", "en"], default: "id" }
    }
  }
}

// F2: Search Quran
{
  name: "search_quran",
  description: "Search the Quran by keyword, surah name, or specific reference (e.g. 'Al-Baqarah:255'). Returns matching verses with translations.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search term, surah name, or reference like '2:255'" },
      language: { type: "string", enum: ["id", "en"], default: "id" },
      limit: { type: "number", default: 5, maximum: 10 }
    },
    required: ["query"]
  }
}

// F3a: List Surahs
{
  name: "list_surahs",
  description: "List all 114 surahs with name, translation, and number of verses.",
  inputSchema: {
    type: "object",
    properties: {
      language: { type: "string", enum: ["id", "en"], default: "id" }
    }
  }
}

// F3b: Get Surah
{
  name: "get_surah",
  description: "Get a specific surah by number or name, optionally with pagination.",
  inputSchema: {
    type: "object",
    properties: {
      surah: { type: "string", description: "Surah number (1-114) or name" },
      offset: { type: "number", default: 0 },
      limit: { type: "number", default: 10 },
      language: { type: "string", enum: ["id", "en"], default: "id" }
    },
    required: ["surah"]
  }
}

// F5: Prayer Times
{
  name: "get_prayer_times",
  description: "Get Islamic prayer times for a city. Returns Fajr, Dhuhr, Asr, Maghrib, Isha times.",
  inputSchema: {
    type: "object",
    properties: {
      city: { type: "string", description: "City name (e.g. 'Jakarta', 'Surabaya')" },
      country: { type: "string", default: "Indonesia" },
      date: { type: "string", description: "Date in YYYY-MM-DD format, defaults to today" }
    },
    required: ["city"]
  }
}

// F6: Daily Duas
{
  name: "get_dua",
  description: "Get daily duas or search by category (morning, evening, travel, eating, etc.)",
  inputSchema: {
    type: "object",
    properties: {
      category: { type: "string", enum: ["morning", "evening", "travel", "eating", "sleep", "protection", "forgiveness"] },
      random: { type: "boolean", default: true }
    }
  }
}
```

### 5.3 External APIs

| API | Purpose | Base URL | Rate Limit |
|-----|---------|----------|------------|
| Al-Quran Cloud | Quran text, translations, audio | `api.alquran.cloud/v1` | Free, no key needed |
| Al-Adhan | Prayer times, Hijri calendar | `api.aladhan.com/v1` | Free, no key needed |
| Quran.com API v4 | Tafsir, advanced search | `api.quran.com/api/v4` | Free, rate-limited |

---

## 6. Recipe Setup (Poke Kitchen)

### 6.1 Recipe Metadata
- **Name:** My-Quran
- **Description:** *Your AI Quran companion. Daily ayah, prayer times, duas, and Islamic Q&A — right in your chat.*
- **Tags:** Faith, Education, Community
- **Chef:** HANS Labs

### 6.2 Onboarding Message
```
Assalamualaikum warahmatullahi wabarakatuh! 🤲

I'm your Quran companion. Here's what I can do:

📖 *Daily Ayah* — I'll send you a verse every day with translation and tafsir
🕌 *Prayer Times* — Just tell me your city (e.g. "Jakarta")
🔍 *Search Quran* — Ask me anything: "cari ayat tentang sabar" or "Al-Baqarah:255"
🤲 *Duas* — "beri aku doa pagi" or "doa sebelum makan"
💬 *Ask Islam* — Any question about Quran, hadith, or Islamic knowledge

To get started, tell me:
• Your city for prayer times
• Preferred language (Indonesian / English)
• What time you'd like your daily ayah

_Jazakallahu khairan!_
```

### 6.3 First Message (Prefilled)
```
Hi! I'm [Your Name]. I'd like to set up My-Quran:
• City: [your city]
• Language: Indonesian
• Daily Ayah: Morning (7 AM)
```

### 6.4 Integrations
- **My-Quran MCP Server** (via tunnel or hosted)

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Recipe installs | 500+ in first 30 days |
| Daily active users | 40% retention after 7 days |
| Avg. messages/user/day | 3+ |
| Payout revenue | Track via Poke Kitchen dashboard |

---

## 8. Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| Al-Quran Cloud API unstable | Cache frequently accessed surahs in local SQLite |
| Islamic Q&A accuracy | Ground responses in Quran text + tafsir only; flag speculative answers |
| User trust (religious content) | Always cite sources (surah:ayah); never give fatwa |
| Poke tunnel reliability | Phase 2: deploy MCP server to hosted environment |

---

## 9. Project Structure

```
/root/my-quran/
├── docs/
│   └── PRD.md                    # This document
├── mcp-server/                   # MCP server (Node.js)
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # Entry point (stdio)
│   │   ├── tools/
│   │   │   ├── quran.ts          # F1-F3: Quran tools
│   │   │   ├── prayer.ts         # F5: Prayer times
│   │   │   ├── dua.ts            # F6: Daily duas
│   │   │   └── question.ts       # F4: Islamic Q&A
│   │   ├── services/
│   │   │   ├── alquran-cloud.ts  # Quran API client
│   │   │   ├── aladhan.ts        # Prayer times API
│   │   │   └── cache.ts          # SQLite cache
│   │   └── data/
│   │       ├── duas.json         # Static duas data
│   │       └── 99names.json      # 99 names of Allah
│   └── tests/
├── scripts/
│   └── start-tunnel.sh           # npx poke tunnel starter
└── README.md
```
