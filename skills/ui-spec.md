# Hens Game App — UI Specification

This document defines the UI, UX flow, and game content for the Hens Party Game web app.

It should be used alongside `design-system.md`.

If there is any conflict between documents, follow **this spec first**.

---

# Product Goal

Build a simple mobile web app for a bachelorette party game.

The app is a **single-session event tool**, not a reusable product.

It must be:

- simple
- fast
- clear on mobile
- reliable for a small group during a live event

Players will already see photos of the bachelors in the room.  
The mobile app is only used to **submit votes**.

---

# Core Flow

The app must contain **only five screens**.

1. Join
2. Rules
3. Question (voting)
4. Waiting
5. Results

Do not add extra screens or navigation.

---

# Screens NOT allowed

Do not build:

- home dashboard
- lobby cards
- navigation tabs
- profile screens
- play again flow
- onboarding slides
- settings
- feature cards
- decorative filler screens

The flow must remain **linear and simple**.

---

# Player Identity

Each player must be identifiable so refreshes do not break the session.

Store in `localStorage`:

playerId
playerName

On app load:

- if these exist, verify with backend
- resume player progress
- if invalid, return to Join screen

If a user clears storage or changes device, they must enter their name again.

---

# Screen 1 — Join

## Purpose

Identify the player.

## UI

- title
- helper text
- name input
- primary button

## Copy

Title  
The Bachelorette

Body  
Vote on the bachelors. Results appear when everyone finishes.

Label  
Your name

Placeholder  
Enter your name

Button  
Join game

## Behaviour

- button disabled until name entered
- call `joinPlayer()` API
- store `playerId` and `playerName`
- move to Rules screen

---

# Screen 2 — Rules

## Purpose

Explain the game quickly.

## UI

- heading
- short rules list
- start button

## Copy

Title  
How it works

Rules

• There are 10 questions  
• Pick one bachelor each time  
• You cannot change your answer  
• Most votes = Chaotic King  
• Least votes = Husband Material  

Button  
Start voting

## Behaviour

Move to first unanswered question.

---

# Screen 3 — Question (Voting)

## Purpose

Collect one vote per question.

## UI

- progress indicator
- question text
- grid of name tiles
- submit button

## Layout rules

- name-only tiles (no images)
- responsive grid
- large tap targets
- one selection only

Preferred layout:

3 column grid on most phones

Example:

[ Alfie ]   [ Ben ]   [ Theo ]
[ Max ]     [ Harry ] [ Tom ]
[ Jack ]    [ Ollie ] [ James ]
[ Sam ]     [ Ryan ]  [ Chris ]
[ Dom ]     [ Luca ]

## Copy

Progress  
Question {n} of 10

Helper  
Pick one bachelor

Button before selection  
Select an answer

Button after selection  
Submit vote

## Behaviour

- user taps a tile
- only one tile can be selected
- submit sends vote to backend
- move to next unanswered question

If player refreshes:

- fetch answered questions
- resume next unanswered question

---

# Screen 4 — Waiting

## Purpose

Hold the player while others finish voting.

## UI

- heading
- waiting message
- completion count

## Copy

Title  
Votes submitted

Body  
Waiting for everyone to finish…

Status  
{x} of {y} players done

## Behaviour

- poll backend every few seconds
- move automatically to Results when complete

---

# Screen 5 — Results

## Purpose

Display final ranking.

## UI

- title
- Husband Material card
- Chaotic King card
- leaderboard

## Copy

Title  
Results

Section 1  
Husband Material  
Fewest votes

Section 2  
Chaotic King  
Most votes

## Behaviour

Fetch final ranked results.

Do not show replay button.

Refreshing the page should reload results.

---

# Game Content

This content must be used exactly.

Do not generate new names or questions.

---

# Bachelors (Voting Options)

Alfie  
Ben  
Theo  
Max  
Harry  
Tom  
Jack  
Ollie  
James  
Sam  
Ryan  
Chris  
Dom  
Luca  

Total options: **14**

Each option should render as a **NameTile component**.

---

# Questions

The game contains **10 questions**.

---

### Q1

Who’s most likely to say they’re looking for a “high-value woman”?

---

### Q2

Who’s most likely to say they “don’t really like Little Wayne”?

---

### Q3

Who’s most likely to stage a rose scavenger hunt around Hertford on your first date?

---

### Q4

Who’s most likely to ask you to stop sending voice note videos?

---

### Q5

Who’s most likely to DM a footballer “great game today mate”?

---

### Q6

Who’s most likely to start a podcast no one asked for?

---

### Q7

Who’s most likely to “live” in a dilapidated converted mechanics pit?

---

### Q8

Who’s most likely to send an unsolicited pic?

---

### Q9

Who says “all wine tastes the same”?

---

### Q10

Who’s most likely to have a secret subscription to Bonnie Blue’s OnlyFans?

---

# Voting Rules

Each player must:

- answer all 10 questions
- select one bachelor per question
- cannot change answers after submission

Votes are stored as:

playerId
questionId
contestantName
timestamp

A player may only submit **one vote per question**.

---

# Results Calculation

After all players finish:

1. Count votes for each bachelor
2. Rank bachelors by vote count

Rules:

- **Most votes = Chaotic King**
- **Least votes = Husband Material**

Leaderboard example:

	1.	Jack — 24 votes
	2.	Tom — 19 votes
	3.	Alfie — 17 votes

---

# Components

## NameTile

Used for each bachelor option.

States:

- default
- selected
- disabled

Content:

- bachelor name

Selected state:

background: primary pink
text: white
border: primary pink

---

## PrimaryButton

Used for main actions.

Rules:

- full width on mobile
- disabled until valid action
- consistent size across screens

---

## ScreenShell

Shared layout wrapper.

Rules:

- mobile-first
- consistent padding
- centred content
- max width for readability

---

## LeaderboardRow

Used in results.

Content:

- rank
- bachelor name
- vote count

---

# Interaction Rules

- touch-first design
- no hover dependent UI
- selected states must be obvious
- minimal animations only

---

# Technical Constraints

Frontend must:

- work as mobile web app
- integrate with Google Apps Script backend
- persist player identity in localStorage
- support refresh and resume
- prevent duplicate votes per question

