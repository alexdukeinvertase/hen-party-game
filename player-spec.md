Here is a clean, copy-paste Markdown instruction focused specifically on UX behaviour for the join system. This is designed so Antigravity / Jules implement the correct behaviour without inventing flows.

You can add this as a section in your UI spec or as a separate file like player-join-ux.md.

⸻


# Player Join UX Specification

This document defines the user experience for how players join the Hens Game App.

The goal is to make joining the game:

- fast
- obvious
- impossible to mess up
- resilient if players refresh or reopen the browser

This is not a traditional signup system.  
Players only need to identify themselves once for the duration of the game.

---

# Join Method

Players join by selecting their name from a predefined list.

There is **no text input signup**.

This prevents:

- spelling variations
- duplicate names
- accidental duplicate players

---

# Eligible Player List

The join screen must show the following names in a dropdown list:

- Abbie G
- Parisa
- Alex
- Sue
- Carole
- Charlotte P
- Nicola K
- Char S
- Grace
- Ruby
- Beth
- Nicola B

These represent the **eligible players**.

However, not every eligible player is required to join the game.

---

# Key UX Rule

The game only counts **players who actually join**.

If someone from the list does not join the app, the game must still proceed normally.

Waiting and results logic must only consider:

- players who joined
- players who completed voting

---

# Join Screen UX

## Layout

The join screen should contain:

1. Title
2. Short explanation
3. Name selector
4. Join button

## Copy

Title  
The Bachelorette

Body  
Choose your name to join the game.

Field Label  
Your name

Join Button  
Join game

Helper text  
Only people who join will be counted in the game.

---

# Join Interaction Flow

1. Player opens the game link
2. Join screen appears
3. Player selects their name from the dropdown
4. Player taps **Join game**
5. The app registers that player as joined
6. The player proceeds to the Rules screen

Joining should take **less than 5 seconds**.

---

# Preventing Duplicate Players

Once a player selects their name, that name becomes linked to their device.

The system must store in localStorage:

playerId
playerName
deviceToken

If the player refreshes or reopens the app:

- the app checks localStorage
- verifies the player with the backend
- resumes the game automatically

The player should **not need to re-select their name** after refreshing.

---

# If Someone Selects an Already-Used Name

If a name is already active on another device:

Display this message:

Name already in use on another device.

Please ask the host if you need to reclaim it.

Do not silently allow duplicate players.

---

# Join State Tracking

Each player has three possible states:

NOT_JOINED
JOINED
COMPLETED

Meaning:

NOT_JOINED  
Player exists in the list but has not opened the game.

JOINED  
Player has entered the game but has not finished voting.

COMPLETED  
Player has answered all questions.

---

# Waiting Screen Behaviour

The waiting screen must show progress based only on players who joined.

Example:

7 of 9 players finished

Not:

7 of 12 players finished

This ensures the game does not get stuck if someone never joins.

---

# Results Trigger

Results should appear when:

completed_players == joined_players

Only players who joined count toward completion.

---

# UX Priorities

The join experience must be:

- extremely fast
- obvious for non-technical users
- forgiving if someone refreshes
- resistant to duplicate players

The entire process should feel effortless during a live party setting.



