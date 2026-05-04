<div align="center">

<img src="https://img.shields.io/badge/NASA-Space%20Apps%20Challenge%202025-0B3D91?style=for-the-badge&logo=nasa&logoColor=white" />
<img src="https://img.shields.io/badge/Team-CosmoMinds-14b8a6?style=for-the-badge" />
<img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Three.js-r180-black?style=for-the-badge&logo=three.js" />
<img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />

<br/><br/>

# 🚀 CosmoMinds — Terra Earth Explorer

### *25 Years of NASA Terra Satellite Data, Explored Through Animated Storytelling*

<br/>

> **"What if children could fly through space, land on any country, and watch our planet change over 25 years — through the eyes of an animated astronaut kid?"**

<br/>

[🌍 Live Demo](#) &nbsp;·&nbsp; [📖 Features](#-features) &nbsp;·&nbsp; [🛠️ Setup](#-getting-started) &nbsp;·&nbsp; [👥 Team](#-team)

</div>

---

## 📖 About the Project

**CosmoMinds** is an interactive, story-driven web platform built for the **NASA Space Apps Challenge 2025**. It transforms 25 years of complex Earth observation data from NASA's **Terra satellite** into beautiful, animated, kid-friendly stories — making climate science accessible and exciting for the next generation.

The platform combines a **real-time 3D globe**, **animated character storytelling**, **satellite sensor data visualisation**, a **canvas space game**, and an **AI-powered chatbot** — all wrapped in a cinematic space experience built with React, Three.js, and Framer Motion.

---

## ✨ Features

### 🌍 Interactive 3D Globe — Home Page
- Photorealistic **Blue Marble Earth** rendered with Three.js + WebGL
- **Custom GLSL shader atmosphere** — realistic limb glow around the planet
- Orbiting **NASA Terra satellite** with animated solar panels and antenna
- Live **animated data arcs** connecting countries across the globe
- Click any **glowing country dot** to explore 25 years of satellite data
- Smooth auto-rotation with drag, pinch-zoom, and physics damping
- Animated **Kid** and **Astronaut** characters on screen with cycling story dialogue

### 📖 Animated Story Explorer — `/story`
- Fully animated **kid astronaut character** — walks, blinks, bounces, changes mood based on content
- **Pure CSS keyframe animations** — buttery smooth at 60fps, zero JS frame counters
- **Typewriter text effect** — story pages reveal one character at a time
- **10 countries** with unique illustrated stories:
  🇧🇩 Bangladesh · 🇰🇪 Kenya · 🇯🇵 Japan · 🇦🇷 Argentina · 🇺🇸 United States · 🇦🇺 Australia · 🇧🇷 Brazil · 🇨🇦 Canada · 🇨🇱 Chile · 🇬🇧 United Kingdom
- Kid's **mood adapts** to story content — hopeful 🌱, sad 😟, or excited 🎉
- **Quiz at the end of every story** — animated questions, instant correct/wrong feedback, medal scoring, confetti celebration on completion

### 🎮 Terra Space Rescue — `/space-game`
- **Canvas-based space game** — fly your rocket through an asteroid field
- Dodge asteroids, collect glowing **NASA data orbs** (ASTER · CERES · MISR · MODIS)
- Each orb collected shows a **real NASA Terra scientific fact** as an animated toast
- Lives system, progressive difficulty ramp, **high score** persisted in localStorage
- Mobile **touch controls** — tap top half to go up, bottom half to go down
- Kid's face visible inside the rocket window 👦

### 🛰️ Satellite Data Modal
- Click any country on the globe → full-screen animated modal with kid character
- **4 sensor tabs**: 🌡️ ASTER · ☀️ CERES · 🌈 MISR · 🌿 MODIS
- **Year timeline slider** (2000–2024) with play button — watch satellite data animate over time
- Real satellite imagery per year per sensor + parsed scientific data fields
- Direct links to country story and space game from inside the modal

### 🤖 AI ChatBot — `/chatbot`
- Ask anything about NASA Terra, climate, or Earth science
- Streaming AI responses with full **Markdown rendering** (code blocks, tables, lists)
- Suggested starter questions, animated typing indicator, clear chat button

### 👥 About — `/about`
- Animated team member profiles
- Animated stat counters (countries, years of data, sensors)
- Full project description, tech stack display
- Collapsible FAQ section

---

## 🛰️ NASA Terra Instruments

| Sensor | Full Name | What It Measures |
|--------|-----------|-----------------|
| 🌡️ **ASTER** | Advanced Spaceborne Thermal Emission and Reflection Radiometer | Surface temperature anomalies, land cover, deforestation rates |
| ☀️ **CERES** | Clouds and Earth's Radiant Energy System | Earth's radiation budget — shortwave & longwave energy (W/m²) |
| 🌈 **MISR** | Multi-angle Imaging SpectroRadiometer | Aerosols, air quality, NDVI vegetation index |
| 🌿 **MODIS** | Moderate Resolution Imaging Spectroradiometer | Forests, wildfires, ocean temperature, ice extent |

---

## 🗂️ Project Structure

```
CosmoMinds/
├── public/
│   └── datas/
│       ├── aster.json              # ASTER surface temp data per country per year
│       ├── ceres.json              # CERES radiation budget data
│       ├── misr.json               # MISR NDVI + aerosol data
│       ├── modis.json              # MODIS vegetation + fire data
│       ├── all-countries-data.json
│       └── book_cover_pic.json
│
├── src/
│   ├── components/
│   │   ├── GlobeComponent.jsx      # 3D globe — Three.js satellite, GLSL atmosphere shader
│   │   ├── LocationModal.jsx       # Country modal — sensor tabs, year timeline, safe data renderer
│   │   ├── TerraBook.jsx           # Flipbook component
│   │   └── Alert.jsx
│   │
│   ├── constants/
│   │   ├── locationsData.js        # Country coordinates, arc generator, star generator
│   │   └── globeConfig.js
│   │
│   ├── data/
│   │   ├── terraBookData_bgd.js    # Bangladesh — story pages + images
│   │   ├── terraBookData_ken.js    # Kenya
│   │   ├── terraBookData_jpn.js    # Japan
│   │   ├── terraBookData_arg.js    # Argentina
│   │   ├── terraBookData_usa.js    # United States
│   │   ├── terraBookData_aus.js    # Australia
│   │   ├── terraBookData_bra.js    # Brazil
│   │   ├── terraBookData_can.js    # Canada
│   │   ├── terraBookData_chl.js    # Chile
│   │   └── terraBookData_uk.js     # United Kingdom
│   │
│   ├── routes/
│   │   └── Router.jsx              # React Router DOM v6 — createBrowserRouter
│   │
│   ├── sections/
│   │   ├── Hero.jsx                # Home — globe + animated characters + story panel
│   │   ├── Navbar.jsx              # Animated navigation with active-pill indicator
│   │   ├── AnimatedStory.jsx       # Story explorer + end-of-story quiz
│   │   ├── SpaceGame.jsx           # Canvas space game
│   │   ├── Chatbot.jsx             # Streaming AI chatbot
│   │   ├── NotFound.jsx            # 404 page
│   │   └── About/
│   │       ├── AboutUs.jsx
│   │       ├── About.jsx
│   │       └── Contact.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx                    # RouterProvider entry point
│   └── index.css                   # Global styles + all CSS keyframe animations
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
└── package.json
```

---

## 🛣️ Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | **Home** | 3D globe with animated kid + astronaut storytelling characters |
| `/story` | **Animated Stories** | Country storybook with animated kid + quiz at the end |
| `/space-game` | **Space Game** | Asteroid dodge + NASA data orb collector |
| `/chatbot` | **AI ChatBot** | Streaming AI assistant for Terra satellite questions |
| `/about` | **About Us** | Team, project description, tech stack |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0
- **npm** ≥ 9.0

### Installation

```bash
# 1. Unzip the project
unzip CosmoMinds-upgraded.zip
cd CosmoMinds

# 2. Install all dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Production Build

```bash
npm run build     # Builds to /dist
npm run preview   # Preview production build locally
```

---

## 🧰 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 18.3 |
| **Routing** | React Router DOM | 6.x |
| **3D / Globe** | Three.js + react-globe.gl | r180 / 2.36 |
| **Animations** | Framer Motion | 12.x |
| **Styling** | Tailwind CSS | 3.4 |
| **Charts** | Chart.js + react-chartjs-2 | 4.5 |
| **Build Tool** | Vite | 7.x |
| **Email** | @emailjs/browser | 4.x |
| **Confetti** | canvas-confetti | 1.9 |
| **Audio** | Howler.js | 2.x |
| **Icons** | Lucide React | 0.544 |

---

## ⚡ Performance Architecture

The UI is engineered to be smooth even on mid-range devices:

| Problem | Solution |
|---------|----------|
| Laggy character animations | **100% CSS keyframes** — `kidBob`, `legSwing`, `armSwing`, `flamePulse`, `blink` — zero JS |
| Starfield causing re-renders | **Pure canvas RAF** — 200 stars, runs off the main thread |
| Globe hover re-renders on every mouse move | `useRef` to track hover ID, `setState` only on actual change |
| Resize cascades | **100ms debounce** on the resize handler |
| Quiz reshuffling every render | `useMemo(() => buildQuiz(), [country])` — built once, never changes |
| MISR/CERES JSON containing nested objects | `SafeValue` renderer — recursively handles any object/array field safely |
| Satellite data crashing on missing fields | `Promise.allSettled` + null-safe optional chaining everywhere |
| Character components re-rendering with parent | All wrapped in `React.memo()` |

---

## 📡 Data Sources

| Source | Description |
|--------|-------------|
| **NASA Terra ASTER** | Land surface temperature anomalies (°C) + deforestation % per country per year |
| **NASA Terra CERES** | Shortwave radiation stats (mean/min/max W/m²) per year |
| **NASA Terra MISR** | NDVI values + vegetation assessment per year |
| **NASA Terra MODIS** | Vegetation, fire activity, land cover changes |
| **NASA Blue Marble** | Globe texture via [unpkg three-globe](https://unpkg.com/three-globe) |
| **Topology DEM** | Bump map for 3D terrain relief |

All satellite imagery and data covers **2000–2024** (25 years).

---

## 👥 Team

| Name | Role |
|------|------|
| 🧑‍💻 **Asif Zaman** | AI/ML Engineer |
| 🧑‍💻 **Afridi Akbar Ifty** | Full-Stack Developer |
| 📖 **Robiul Hasan** | Project Storyteller |
| 🎨 **Abrar Hossain** | UI/UX Designer |
| 🔬 **Kazi Tahera Jannat** | Researcher |

---

## 🏆 NASA Space Apps Challenge 2025

Built for the **NASA International Space Apps Challenge 2025** — the world's largest global hackathon.

**Our challenge:** *"Celebrating 25 Years of NASA's Terra Satellite"*

We chose to tell the story of Terra's data through the eyes of a child — because the planet's future belongs to them.

```
"Every glowing dot on the globe is a story waiting to be told."
                                              — Team CosmoMinds
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

Made with ❤️ and 🚀 by **Team CosmoMinds** · NASA Space Apps 2025

[![GitHub](https://img.shields.io/badge/GitHub-TeamCosmoMinds-181717?style=flat-square&logo=github)](https://github.com/asif4762/TeamCosmoMinds)

</div>
