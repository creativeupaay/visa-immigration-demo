# VisaFlow (E360) - Visual Identity & Design System

## Overview for AI Context
This document outlines the core visual identity, design tokens, and aesthetic principles of the **VisaFlow (E360)** application. 

**Purpose & Strict Directive:** When generating new UI components, styling features, or writing frontend code for this application, any new or modified AI-generated code must strictly adhere to these design guidelines. This ensures absolute visual consistency, maintains the established brand identity, and preserves the premium user experience expected by the app's target demographic.

## Brand Vibe & Aesthetic
- **Trustworthy & Professional:** High-stakes processes like international immigration require an interface that instills deep confidence. Layouts must be clean, highly structured, and entirely free of clutter.
- **Premium, Modern & "Regal" ("VIP Concierge"):** The combination of deep purple and golden yellow gives the application an exclusive, high-end, and regal feel, deliberately standing apart from typical, sterile government portals or basic SaaS templates. 
- **Accessible & Clear:** Heavy use of modern sans-serif typography, distinct semantic status colors, and logical accordion menus ensures that complex, legally heavy information (like complicated document requirements) is easily digestible for the end-user.

---

## 1. Color Palette

### Primary / Action Color: Golden Yellow
Used for primary call-to-actions (CTAs), active navigation states, highlights, and the custom scrollbars. It provides a warm, energetic, and premium contrast to the darker secondary brand color.
- **Core Hex:** `#F7C228` (MUI Primary Main)
- **Tailwind Scale Integration:**
  - `50`: `#fffceb` (Subtle active backgrounds or hover rows)
  - `100`: `#fff7d7`
  - `200`: `#ffefb1`
  - `300`: `#fbe181`
  - `400`: `#f7c228` (Default Action / Core Button Color)

### Secondary / Brand Anchor Color: Deep Purple
Used for strong branding moments, primary headers, or structural elements that require a powerful, trustworthy, and sophisticated anchor.
- **Core Hex:** `#691B99` (MUI Secondary Main)

### Neutral / Grayscale / Backgrounds
Used for canvas backgrounds, structural dividers, text placeholders, and subtle shading.
- **Backgrounds & Light Elements:** `#f6f5f5` (50), `#e8e7e5` (100)
- **Borders & Dividers:** `#d3d1ce` (200), `#b4b0ac` (300)
- **Icons & Muted Elements:** `#8d8883` (400), `#726d68` (500)
- **Deepest Neutral:** `#292826` (950)

### Typographic Colors
- **Primary Text:** `#201f1e` (Near-black for maximum contrast & sustained readability)
- **Secondary Text / Descriptions:** `#6A6464` (Subdued aesthetic grey for descriptions, helper text, and timestamps)

### Semantic / Status Colors
Crucial for a status-driven application like Visa processing.
- **Success (Approved, Completed, Cleared):** `#64AF64`
- **Warning (Pending, Action Required, In Progress):** `#FFC95C`
- **Error (Rejected, Missing, Delayed):** `#F44336`

---

## 2. Typography
A dual clean, modern Sans-Serif approach to maximize screen legibility and modern aesthetics.
- **Primary CSS Font:** `Inter`, sans-serif. Used generally across the body, tables, and paragraphs for excellent readability.
- **MUI Theme Override:** `Montserrat`, sans-serif. Used for robust, slightly wider, geometric headings, titles, and primary UI elements, lending an elegant, strong, and modern flair.

---

## 3. Key UI Components & Layout Structures

### Layout Archetypes
- **Admin Layout:** Features a vertical sidebar navigation with a fixed top header, allowing extensive nested routing (Dashboard, Leads, Invoices, Team Management) while maintaining global context.
- **Customer Layout:** A deeply simplified and focused interface emphasizing the core user journey—Dashboard (Progress timeline), Vault (Secure file uploads), and Settings.

### Signature Components
- **Custom Scrollbars:** The application strictly utilizes custom-styled Webkit scrollbars across overflowing containers, featuring a light track (`#f1f1f1`) and a beautifully rounded Golden Yellow thumb (`#F7C228`), adding a polished, highly customized branded touch to long lists.
- **Progress Steppers (`CustomStepper`):** Core visual horizontal or vertical timelines indicating exactly where an applicant is in their multi-stage visa lifecycle. They lean heavily on success/warning/primary colors to instantly communicate status without making the user read dense text.
- **Accordions (`DocumentVaultAccordion`, `CategoryWiseDocumentsAccordion`):** Relied upon heavily to prevent overwhelming users. Massive lists of required visa documents are cleanly grouped into expandable sections based on category.
- **Data Grids (`CustomTable`):** Used extensively in the admin portal for managing tables of users, leads, and tasks. Features clean horizontal rows, ample padding, and pill-shaped status badges.
- **Floating Chatbot (`ChatbotPanel`):** A distinct chat interface overlaying the bottom corner of the application for quick, contextual assistance.

### Component Styling Directives for AI Generators
- **Framework Strategy:** ALWAYS use a hybrid of Tailwind CSS utility classes and native Material-UI (MUI) structural components customized via the application's established `theme.ts`.
- **Custom Variables:** Leverage the custom CSS variable tokens defined in `index.css` (e.g., `bg-golden-yellow-400`, `border-neutrals-200`) using Tailwind instead of raw hex codes.
- **Avoid Defaults:** NEVER use generic primary blues or default framework styling. Strictly enforce the Golden Yellow and Deep Purple palette.
- **Spacing Guidelines:** Maintain generous, airy padding (e.g., `p-4`, `p-6`) to create a breathable, "luxury" layout. Avoid dense, cramped UI elements.
- **Borders & Radii:** Use subtle, light borders (`border-neutrals-200` or `100`) and soft shadows for cards and elevated panels. Apply rounded corners (`rounded-lg`, `rounded-xl`, `borderRadius: 8px`) universally to soften the interface and make it welcoming.
