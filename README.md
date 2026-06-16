# Aurora

A quiet-luxury digital storefront and curated fashion e-commerce platform.

> Live Demonstration: **[aurora-nu-three.vercel.app](https://aurora-nu-three.vercel.app/)**

---

## The Vision: Quiet Luxury, Digital Elegance

Aurora is built as a premier showcase of modern, high-end e-commerce. Rejecting the cluttered grids and aggressive popups of traditional online stores, Aurora focuses on a **minimalist design system** and **editorial storytelling**. It is designed specifically for "The Rare Few" — a target audience that demands premium aesthetics, seamless micro-animations, and visual clarity.

Every interaction, from the smooth transitions between lookbooks to the interactive shopping bag and checkout flows, is crafted to reflect the feeling of stepping into a boutique atelier.

---

## User-Centric Features

*   **Curated Catalog & Custom Filters:** A dynamic, fast-loading storefront featuring products grouped by curated categories. Detail pages provide high-resolution multi-image galleries, sizing matrices, and real-time inventory checks.
*   **Interactive Cart & Guest Checkout:** A sleek slide-out shopping bag that calculates pricing and shipping thresholds in real-time. Customers can purchase either as a guest or by authenticating their accounts.
*   **Database-Driven Lookbook & Stories:** A narrative lookbook carousel and editorial page sections designed to showcase seasonal campaigns directly from the content database.
*   **Customer Wardrobe Portal:** A personal profile area where customers can update their details, view order histories, track statuses, and view detail summaries.
*   **Media Pipelines:** High-fidelity imagery optimized dynamically for web performance, ensuring near-instant page loads without sacrificing detail.

---

## The Journey of Aurora

Aurora’s evolution spans multiple architectural and product phases, transforming a vision of digital quiet luxury into a production-grade codebase:

### Phase 1: Conceptualization & Visual Identity
The journey began with the definition of Aurora’s design tokens and aesthetic framework. Moving away from browser-default layouts, we designed a custom system using typography from Google Fonts (Outfit, Inter) paired with a harmonious HSL-tailored color palette. Micro-animations, responsive layout containers, and glassmorphic overlays were introduced to build a premium first impression.

### Phase 2: Core Storefront Architecture
Next, the database schemas were designed and deployed to support a fully relational e-commerce catalog. We constructed the initial storefront, connecting client-side Zustand state management to allow smooth cart additions and removals. The storefront pages were divided into clean presentation layers and functional containers to preserve performance and scalability.

### Phase 3: Secure E-Commerce Infrastructure
With the storefront visual structures in place, the focus shifted to transactions and account security. We implemented server-side pricing recalculation to verify and recalculate all order details, protecting the platform from client-side pricing manipulation. Robust cookie-based session management, Edge-runtime middleware protection, and rate-limited endpoints were layered in to safeguard customer accounts and payment routes.

### Phase 4: Dynamic Editorial Content & WebP Pipeline
To bridge fashion media with fast load times, we introduced lookbook tables, database-driven story pages, and an automated media compression script. Utilizing `sharp`, product images are optimized into high-density WebP formats, uploaded to InsForge storage buckets, and populated automatically in the Postgres catalog. This allowed visual updates without any frontend code redeployments.

### Phase 5: Architecture Optimization & Custom Hook Consolidation
As features grew, we undertook a thorough cleanup to align with strict coding standards:
*   Unified server-state caching configuration under a single namespace in `queries.ts`.
*   Removed redundant pass-through hooks to simplify authentication store reads.
*   Relocated mathematical pricing helpers to standard utility modules to enforce React’s Rule of Hooks.
*   Reorganized DOM/Window event handlers into a clean `src/hooks/ui/` namespace, optimizing modularity.

---

## Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router, SSR) | Page rendering, Edge middleware, server routes |
| **Language** | TypeScript 5.x & React 19 | Static typing and component architecture |
| **Database** | PostgreSQL | Relational storage for products, lookbook, and orders |
| **Authentication** | Better Auth | Session token management, email verification, password reset flows |
| **BaaS & Infrastructure** | InsForge | PostgreSQL hosting, multi-bucket storage, database APIs |
| **State Management** | Zustand & TanStack Query v5 | Global client-state and cached server-state synchronization |
| **Styling** | Tailwind CSS 4 | Modern, utility-driven layout and typography |
| **Animation** | Framer Motion 12 | Fluid transitions, lookbook slides, and interactive UI |
| **Asset Pipeline** | Sharp | Compression, dynamic resizing, and WebP generation |

---

## Getting Started

Follow these steps to run the Aurora storefront locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/1ewig/aurora
    cd aurora
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the project root and configure your database, InsForge keys, and Better Auth credentials (see `.env.example` for details):
    ```env
    DATABASE_URL="postgresql://username:password@host:port/database"

    NEXT_PUBLIC_INSFORGE_URL="https://your-project.database.insforge.app"
    NEXT_PUBLIC_INSFORGE_ANON_KEY="your-public-anon-key"

    BETTER_AUTH_SECRET="generate-with: openssl rand -base64 32"
    BETTER_AUTH_URL="http://localhost:3000"
    NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` to view the local application.

---

<p align="center">
  Designed and Developed by <a href="https://github.com/1ewig">Moshu</a>
</p>
