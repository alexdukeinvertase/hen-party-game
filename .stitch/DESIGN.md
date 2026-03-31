# Design System: Bachelorette Party Game - Hens App
**Project ID:** 16211909428790895547

# Design System Document

## 1. Overview & Creative North Star: "The Editorial Gala"
The Creative North Star for this system is **"The Editorial Gala."** We are moving away from the "utility-first" look of standard mobile apps and toward the sophisticated, atmospheric feel of a high-end fashion editorial.

This design system rejects the "boxed-in" nature of traditional UI. Instead of rigid grids and navigation bars, we embrace a **Linear Flow**—a singular, continuous journey that feels like flipping through a premium physical invitation. By utilizing intentional asymmetry, overlapping glass elements, and dramatic typographic scales, we create an experience that feels bespoke, intimate, and curated for a once-in-a-lifetime celebration.

---

## 2. Colors: Midnight Sparkle & Muted Velvets
The palette is rooted in a deep, atmospheric charcoal to provide a canvas where the muted jewel tones can glow without ever feeling "neon" or "cheap."

### The Palette (Material Design Tokens)
- **Background / Surface:** `#131313` (Deep Charcoal).
- **Primary (Dusty Rose):** `#FFB2BC` (On-Primary: `#551E29`). Used for romantic highlights and high-priority actions.
- **Secondary (Sage Green):** `#BDCE89` (On-Secondary: `#283501`). Used for grounded, sophisticated secondary elements.
- **Tertiary (Soft Amber):** `#DEBFC2` (On-Tertiary: `#3F2B2E`). Used for "sparkle" details and delicate accents.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Visual boundaries must be defined exclusively through:
1. **Background Color Shifts:** Placing a `surface-container-low` component on a `surface` background.
2. **Tonal Transitions:** Using subtle gradients between `surface-container-lowest` and `surface-container-highest`.
3. **Negative Space:** Using the Spacing Scale to let elements breathe.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, semi-translucent layers.
- **Base Layer:** `surface` (#131313)
- **Elevated Cards:** `surface-container` (#201F1F)
- **Interactive Elements:** `surface-container-high` (#2A2A2A)

### The "Glass & Gradient" Rule
To achieve the "Midnight Sparkle" feel, use **Glassmorphism** for floating tiles.
- **Effect:** 60% opacity of the `surface-variant` color with a `20px` to `40px` backdrop-blur.
- **Gradients:** Use a subtle linear gradient (Top-Left to Bottom-Right) from `primary` (#FFB2BC) to `primary-container` (#C77B86) for main CTAs to give them a velvet-like shimmer.

---

## 3. Typography: High-Contrast Narrative
We use typography not just for readability, but as a primary decorative element.

### Headline & Display: Newsreader
A high-contrast serif that feels literary and expensive.
- **Display-LG (3.5rem):** Use for "The Main Event" or the Bachelorette's name.
- **Headline-MD (1.75rem):** Use for section headers (e.g., "The Bachelors").
*Note: Use italic styles sparingly for emphasis to create a "Vogue" editorial feel.*

### Body & UI: Manrope
A unique, modern sans-serif with a geometric touch that balances the serif’s tradition.
- **Title-LG (1.375rem):** Use for Bachelor names on tiles.
- **Body-MD (0.875rem):** The workhorse for all instructional text.
- **Label-SM (0.6875rem):** All-caps with 0.1rem letter spacing for category tags.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "software-like." This system uses light and glass to imply depth.

- **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface` background creates a natural recession.
- **Ambient Shadows:** When an element must float (like a selection chip), use a shadow color tinted with `on-surface` (#E5E2E1) at 5% opacity, with a blur of `32px`. It should look like a soft glow, not a dark drop-shadow.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline-variant` at 15% opacity. Never use 100% opaque lines.
- **Subtle Sparkle Details:** Use the `tertiary-fixed` (#FBDBDE) color as 1px or 2px "dots" scattered asymmetrically in the background to mimic a night sky.

---

## 5. Components: Editorial Elements

### Large Bachelor Name Tiles
- **Style:** `surface-container-low` cards. Asymmetrical layout: image takes up 70% of the card, with the name in `Newsreader Headline-SM` overlapping the image edge.
- **Interaction:** On tap, the card expands using a "Hero" transition to reveal details—no page loads.

### Buttons (CTAs)
- **Primary:** No border. Gradient fill (`primary` to `primary-container`). White-space heavy (Padding: `spacing-4` vertical, `spacing-8` horizontal).
- **Secondary:** Glassmorphic background with `Newsreader` italic text.

### Chips (Selection)
- **Style:** Pill-shaped (`rounded-full`). Background: `surface-container-high`.
- **Active State:** Background shifts to `secondary` (Sage Green), text color shifts to `on-secondary`.

### Input Fields
- **Style:** Underline only (using `outline-variant` at 20% opacity). Floating labels in `Manrope Label-MD`.
- **Error State:** No red boxes. Use a subtle `error` (#FFB4AB) glow behind the text and an `error` colored label.

### Lists & Cards
- **The "No Divider" Rule:** Forbid the use of horizontal lines. Separate list items using `spacing-3` (1rem) of vertical gap and subtle shifts in background tone.

---

## 6. Do’s and Don’ts

### Do:
- **Use Asymmetry:** Place a headline slightly off-center to create an editorial feel.
- **Embrace the Scroll:** Since there are no headers or footers, ensure the top-most and bottom-most elements have significant breathing room (`spacing-20`).
- **Use Glass:** Overlay text elements on images using a `backdrop-blur` container to ensure legibility while maintaining depth.

### Don't:
- **Don’t Use Neon:** Colors must remain "muted" and "dusty." If a color looks like it belongs in a nightclub, it’s too bright.
- **Don’t Use Dividers:** If you feel the need for a line, use a 4px gap of background color instead.
- **Don’t Center Everything:** Modern editorial design often uses "Left-Heavy" or "Right-Heavy" layouts to create visual tension.
- **Don’t Use Standard Icons:** If an icon is needed, use ultra-thin (1pt) stroke weights to match the elegance of `Newsreader`.