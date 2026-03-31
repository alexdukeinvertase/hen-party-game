# Application Specification: The Bachelorette - Hens Game App

This document provides building instructions for the **Hens Game App**, a "Most Likely To" voting game for a bachelorette party. It details the game flow, UI/UX requirements, and functional behavior to be used as a design reference for Stitch.

---

## 1. Visual Design Foundation
The app follows the **Playful Elegance** theme defined in `DESIGN.md`.

*   **Primary Action**: Lime (#B0CD00) for "Proceed" actions and highlights.
*   **Accent Color**: Blush (#F7C3C5) for cards and soft sections.
*   **Secondary Accent**: Pale Yellow (#FAE8A7).
*   **Headings**: Fraunces (Serif).
*   **Body**: Be Vietnam Pro (Sans-serif).
*   **UI Components**: Large rounded corners (`rounded-2xl` to `3rem`), glassmorphism cards (`bg-white/40` with `backdrop-blur-[10px]`), and pill-shaped buttons.

---

## 2. Core Game Flow (Players)

### State 1: Join Screen
**Goal**: Identify the player without a formal signup.
*   **UX Rule**: Players select their name from a pre-defined list (dropdown). No text input.
*   **List of Players**: Abbie G, Parisa, Alex, Sue, Carole, Charlotte P, Nicola K, Char S, Grace, Ruby, Beth, Nicola B.
*   **Persistence**: Once selected, the name is saved to `localStorage` (playerId, playerName, deviceToken). Refreshing the app should skip this screen.
*   **Error State**: If a name is already taken on another device, show: *"Name already in use on another device. Please ask the host if you need to reclaim it."*

### State 2: Rules / Intro Screen
**Goal**: Explain the game.
*   **Content**: 
    1. 10 rounds of "Most Likely To..." voting.
    2. Choose one bachelor per round from the grid.
    3. Results revealed by the host at the end.
*   **Action**: A "Ready" state or just a waiting message if the host hasn't started the game.

### State 3: Voting Screen (10 Rounds)
**Goal**: The core interactive loop.
*   **Layout**:
    - **Header**: "Question X of 10" (in Lime or Maroon).
    - **Prompt**: Large Serif heading (e.g., *"Who’s most likely to start a podcast no one asked for?"*).
    - **Interaction**: A grid (e.g., 3 columns) of **14 bachelor tiles**. 
    - **Bachelors**: Alfie, Ben, Theo, Max, Harry, Tom, Jack, Ollie, James, Sam, Ryan, Chris, Dom, Luca.
    - **Selection**: Tapping a tile highlights it clearly. 
    - **Action**: A "Submit Vote" pill button (Lime) that becomes active once a tile is selected.

### State 4: Waiting Screen
**Goal**: Bridge the gap between rounds or after all votes are in.
*   **Content**: *"Waiting for the host..."* or *"All votes submitted! Waiting for results..."*.
*   **Visual**: Show progress (e.g., "7 / 10 players finished") to build anticipation.

### State 5: Results Screen
**Goal**: The grand reveal.
*   **Layout**: A vertically scrolling list (or animated cards) showing each bachelor ranked by vote count.
*   **Style**: The winner (#1) should have a distinct, celebratory visual (e.g., Blush background, larger font).
*   **Content**: Bachelor Name + "X votes".

---

## 3. Host / Admin Portal
**Route**: Accessed via `/admin`.
*   **Authentication**: Simple host code input.

### Admin Dashboard Features:
1.  **Game State Toggles**: Buttons to switch the entire app state for all players:
    - **SET JOINING**: Moves players to the Join screen.
    - **START VOTING**: Moves players to the Voting screen.
    - **REVEAL RESULTS**: Moves players to the Results screen.
2.  **Live Player Table**:
    - Displays all 12 eligible names.
    - **Joined Status**: (Checkmark/Icon) if they've selected their name.
    - **Progress Status**: (X/10) or "Done" if they've finished voting.
    - **Reset Action**: A per-player "Reset" button to clear their device token/progress (useful if someone joins as the wrong person).

---

## 4. Key UX Principles
-   **Speed**: Screens must load fast; transitions should feel soft but responsive.
-   **Clarity**: Non-technical users should never wonder "What do I do next?".
-   **Resilience**: The app must handle refreshes gracefully, mid-vote or in the waiting room.
-   **Thematic Consistency**: Every screen should feel like part of a premium "Bachelorette" experience, avoiding default browser styles.
