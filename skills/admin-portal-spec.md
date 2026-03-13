# Hens Game App — Admin Portal Specification

This document defines the **host/admin experience** for controlling the game.

The admin portal exists to give the host simple control over the game flow during the event.  
It must remain extremely lightweight and should not introduce unnecessary complexity.

This portal is **not a full dashboard**. It is a small control panel used during the live game.

---

# Purpose

The admin portal allows the host to:

1. Start the game
2. Monitor who has joined
3. Monitor who has finished voting
4. End voting if necessary
5. Reveal the results

This prevents the game from getting stuck if someone never joins or finishes voting.

---

# Game State Model

The game operates using a simple global state.

JOINING
VOTING
RESULTS

These states control what players see.

---

## JOINING

Default state when the app first loads.

Player behaviour:
- players can select their name
- players cannot vote yet

Player screen shows:

Waiting for the host to start the game

Admin can:
- see who has joined
- start the game

---

## VOTING

Game is active.

Player behaviour:
- players can answer questions
- players progress through all 10 questions

Waiting screen behaviour:

{completed} of {joined} players finished

Admin can:
- see join progress
- see completion progress
- end voting manually

---

## RESULTS

Voting is finished.

Player behaviour:
- results screen appears
- leaderboard displays

Admin action that triggers this state:

Reveal results

---

# Admin Portal Access

The admin portal should be accessible via a separate route.

Example:

/admin

This page should not be linked in the main UI.

Access can be protected using a simple host code.

Example:

Enter host code

The host code can be stored in the backend configuration.

---

# Admin Portal Layout

The admin portal should be extremely simple.

Sections:

1. Game status
2. Player status
3. Game controls

---

# Section 1 — Game Status

Display the current game state.

Example:

Game Status: JOINING

or

Game Status: VOTING

or

Game Status: RESULTS

---

# Section 2 — Player Status

Display the current players and their progress.

Example table:

| Name | Joined | Completed |
|-----|------|------|
| Grace | ✓ | ✓ |
| Ruby | ✓ | ✓ |
| Beth | ✓ | ✓ |
| Sue | ✓ | ○ |
| Nicola B | ○ | ○ |

Meaning:

✓ joined or completed
○ not yet joined or not yet completed

This helps the host quickly see who is still playing.

---

# Section 3 — Game Controls

Admin controls should be clearly separated.

---

## Start Game

Visible when state is `JOINING`.

Button:

Start voting

Action:

SET GAME_STATE = VOTING

Players immediately move to the first question.

---

## End Voting

Visible when state is `VOTING`.

Button:

End voting

Action:

SET GAME_STATE = RESULTS

This is useful if players take too long.

---

## Reveal Results

Also visible when state is `VOTING`.

Button:

Reveal results

This transitions players to the results screen.

---

# Player Experience with Admin Control

## When game is JOINING

Players see:

Waiting for the host to start the game

---

## When game switches to VOTING

Players automatically move to:

Question 1 of 10

---

## When game switches to RESULTS

Players automatically see:

Results screen

---

# Backend Requirements

The backend must maintain a global game state.

Example data model:

GameState
state: JOINING | VOTING | RESULTS
updatedAt

Players table should track:

playerId
name
joined
completed
joinTime
deviceToken

Votes table:

playerId
questionId
contestantName
timestamp

---

# Admin UX Principles

The admin interface must be:

- simple
- readable on mobile
- fast to operate
- impossible to misuse

Do not add:

- analytics
- charts
- history logs
- complex configuration

This interface exists only to **run the game smoothly during the event**.

---

# Expected Game Flow

1. Host opens admin portal
2. Players join the game
3. Host presses **Start voting**
4. Players answer questions
5. Host presses **Reveal results**
6. Results screen appears for all players