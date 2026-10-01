# Shravanam 📿

**Shravanam** is a dedicated spiritual audio library designed to help devotees and seekers cultivate a consistent habit of hearing (*shravanam*) the transcendental teachings of **His Divine Grace A.C. Bhaktivedanta Swami Prabhupada**.

This application is built with a focus on privacy, simplicity, and a distraction-free experience.

## ✨ Features (Version 1)

*   **📚 Extensive Library**: Access to Bhagavad-gita, Srimad-Bhagavatam, and Nectar of Devotion lectures.
*   **🔒 Privacy-First**: No login required. All your progress, bookmarks, and notes are stored locally on your device.
*   **🔥 Streak Tracking**: Visualize your consistency with daily streak tracking and progress rings.
*   **📝 Notes & Reflections**: Take personal notes for each lecture to deepen your understanding.
*   **🔖 Bookmarks**: Save your favorite lectures for easy access.
*   **🎧 Global Audio Player**: Persistent audio player that continues playing while you navigate.
*   **🌘 Dark Mode**, Beautiful "Sage" and "Lotus" themes, and responsive design.
*   **📱 Installable App**: Add it to your phone's home screen (iPhone and Android). Opens full-screen, works offline for browsing, and shows lock-screen playback controls.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Storage**: Browser LocalStorage (No backend required)
*   **Deployment**: Static Export (Ready for Vercel/Netlify)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd apps/frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

This will generate a static `.next` folder ready for deployment.

## 📱 Installing on Your Phone

Shravanam is a Progressive Web App (PWA). Phones only install PWAs from an **HTTPS** address, so deploy it first (e.g. connect the repo to [Vercel](https://vercel.com) with `apps/frontend` as the root directory), then open that URL on your phone:

*   **Android (Chrome)**: tap **Install app** on the banner at the top of the page, or menu ⋮ → **Install app**.
*   **iPhone / iPad (Safari)**: tap **Share** → **Add to Home Screen**.

Once installed, Shravanam opens like a regular app, the library and your progress work offline, and audio keeps playing with the screen locked (internet is still needed to stream lectures).

What makes it installable:
*   `public/manifest.webmanifest` — app name, colours and icons.
*   `public/sw.js` — service worker that caches the app for offline use (production builds only; lecture audio is never cached).
*   `public/icons/` — app icons. Edit the SVGs, then run `node scripts/generateIcons.mjs` to regenerate the PNGs.

To test the service worker locally, use a production build: `npm run build && npm start`.

## 🤝 Credits & Acknowledgments

*   **Srila Prabhupada**: All lectures are the property of the Bhaktivedanta Book Trust (BBT). We offer our humble obeisances to His Divine Grace.
*   **ISKCON Desire Tree**: Gratefully acknowledged as the source of the audio content ([audio.iskcondesiretree.com](https://audio.iskcondesiretree.com)).

## 📄 License & Disclaimer

This is an independent educational tool created for personal sadhana. It is not an official application of ISKCON or the BBT.
All audio content copyrights belong to their respective owners.

---
*Built with devotion.*
