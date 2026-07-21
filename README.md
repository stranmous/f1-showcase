# F1 Cars Showcase

An interactive 3D WebGL experience celebrating the engineering and aerodynamics of Formula 1 cars across generations. 

[Live Demo](http://waqasai.me/f1-showcase/)

## Highlights
- **Interactive 3D Garage**: Spin, zoom, and explore 4 iconic F1 cars spanning from 1988 to 2023.
- **Aero Simulation**: A stunning, real-time aerodynamic smoke particle simulation over the car chassis.
- **Engineering Explorer**: An exploded view allowing users to dissect the chassis, engine, and internal components of the Mercedes W11.
- **Dynamic Performance**: Automatically scales WebGL quality, shadows, and resolution based on device hardware capabilities for a smooth 60fps experience.

---

## Architecture and AI Integration (Codex & GPT-5.6)

Building this project required significant manual engineering to structure the React application, optimize the rendering pipeline, and hand-code the user experience. To accelerate development and tackle some of the more complex mathematical challenges, I integrated OpenAI's models into my workflow:

### How Codex was utilized
I used Codex as an advanced coding assistant to help implement specific WebGL logic. 
- **3D Camera Math**: While I designed the cinematic transitions between the Gallery, Aero, and Explore modes, Codex helped generate the complex quaternion math and trigonometry required to execute them smoothly.
- **Particle Systems**: I conceptualized the aerodynamic smoke effect, and Codex assisted in mathematically modeling the physics so the particles would run without blocking the main browser thread.
- **Asset Optimization Scripts**: Compressing 50MB+ `.glb` files down to web-friendly sizes was a major hurdle. I used Codex to quickly write the Node.js automation scripts that execute the `meshoptimizer` pipelines on the raw 3D files.

### How GPT-5.6 was utilized
I leveraged GPT-5.6 as a sounding board during the architectural planning phases.
- **System Architecture**: I discussed different approaches to React state management with GPT-5.6, using its feedback to ultimately design the chunk-loading and `Suspense` architecture that prevents the browser from freezing on initial load.
- **Performance Tuning**: During performance profiling, I used GPT-5.6 to brainstorm ways to eliminate rendering bottlenecks, which led to my implementation of the `@react-three/drei` `PerformanceMonitor` for dynamic scaling on lower-end devices.

---

## Tech Stack
- **Framework**: React, Vite, TypeScript
- **3D Rendering**: Three.js, React-Three-Fiber, React-Three-Drei
- **AI Models**: OpenAI Codex, GPT-5.6
- **Optimization**: Meshoptimizer
- **Styling**: Vanilla CSS3, Google Fonts

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/stranmous/f1-showcase.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
