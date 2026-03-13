---
name: Hens Design System
description: Visual tokens and component specifications for the Hens Game App
---

# Hens Game App — Design System

This document outlines the visual language and UI components for the Bachelorette Party Game, derived from the **Stitch Design System** screen.

## 🎨 Color Palette

### Primary Colors
- **Primary Pink**: `#EC135B` (The main vibrant brand color used for primary buttons and headers)
- **Deep Rose**: `#FF1493` (Secondary accents)

### Neutral & Surface Colors
- **Champagne**: `#F7E7CE` (Background gradient start)
- **Soft Rose**: `#FFB6C1` (Background gradient end)
- **Pearl**: `#FDFCF0` (Clean white-ish backgrounds for inputs)
- **Text Dark**: `#333333` (High contrast text)

## ✍️ Typography

- **Headings**: `Playfair Display`, Serif. (Chosen for a premium, elegant, and festive feel)
- **Body & Controls**: `Epilogue` or `Inter`, Sans-serif. (Focused on legibility and modern clean aesthetics)

## ✨ Visual Effects

### Glassmorphism (The "Glass" Look)
The app uses a signature glass card effect for its main UI containers:
- **Background**: `rgba(255, 255, 255, 0.25)`
- **Blur**: `12px backdrop-filter`
- **Border**: `1px solid rgba(255, 255, 255, 0.4)`
- **Shadow**: Subtle deep blue tint `rgba(31, 38, 135, 0.1)`

### Roundness
- **Standard Cards**: `24px` (Round 8 equivalents)
- **Primary Buttons**: `Pill / Full` (Maximum roundness for a friendly feel)
- **Inputs**: `12px`

## 🧱 UI Components

### Glass Card
The central container for all screens. It should be centered vertically and horizontally on mobile viewports.

### Primary Button
Gradient from `Primary Pink` to `Soft Rose`. Uses a subtle lift on hover (`translateY(-2px)`) and a vibrant pink glow shadow.

### Option Button (Voting)
Ghost-style buttons with white backgrounds and `Soft Rose` borders. Active state triggers a full `Primary Pink` fill.

### Background Sparkles
A subtle overlay of radial-gradient "sparkles" that pulse or drift slightly to add life to the static background gradient.
