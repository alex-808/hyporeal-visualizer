# Hyporeal Spotify Visualizer

## ⚡️ Features

- Live, music-responsive 3D visuals generated with Three.js
- Visual FX event system
- Music data derived and synced with Spotify API for live play
- 4 separate visualization fields:
  - Tonal pitch plane
  - Beat line visualizer
  - Live neographic glyph generation
  - Reactive glitch 3D model

## Preview

## ⚠️ Requirements

- You will need a Spotify API key which you can get from Spotify's developer
  site:
  https://developer.spotify.com/

## 📦 Setup

1. Run `npm install` in root directory to install dependencies

2. (Optional) To make managing your environment variables simpler during
   development it is recommended to install `dotenv` in the project and add your own .env file
   with your own CLIENT_ID, CLIENT_SECRET and REDIRECT_URI

## ⚙️ Running

- If `dotenv` was installed during setup start with:
  ```
  cd spotifyapp
  node server.js
  ```
- Otherwise start with:
  ```
  cd spotifyapp
  CLIENT_ID=<your client id> CLIENT_SECRET=<your client secret> REDIRECT_URI=<your redirect uri> node server.js
  ```
