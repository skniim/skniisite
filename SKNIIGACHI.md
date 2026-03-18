# SKNIIGACHI Project Plan

A retro-OS virtual pet (Tamagotchi-style) integrated into the SkniiOS ecosystem. The pet evolves by "consuming" digital data (images, audio, links) and can interact with the desktop environment.

## 1. Core Component: `Skniigachi.tsx`
The primary "home" for the pet.
- [ ] **Window Interface**: A dedicated window (`Skniigachi.tsx`) with a classic handheld toy aesthetic (rounded LCD screen, physical-style buttons).
- [ ] **State Management**:
    - **Vitals**: Hunger, Happiness, Energy, and "Data Saturation".
    - **Identity**: Naming system persisted in `localStorage`.
    - **Evolution Stage**: Egg -> Hatchling -> Child -> Adult -> Specialized (based on diet).
- [ ] **Animations**: Basic pixel-art idle, eating, sleeping, and "walking" loops.

## 2. The "Walk" Mechanic (Desktop Integration)
- [ ] **Escape the Window**: A "Walk" button that minimizes the Skniigachi window and spawns a "Ghost" version of the pet on the desktop layer.
- [ ] **Cursor Following**: The pet follows the `MouseTrail` or cursor with a slight delay and "floaty" physics.
- [ ] **Interaction**: While on a walk, the pet might "nibble" on desktop icons or react to the `MusicPlayer` visualizer.
- [ ] **Recall**: Clicking the pet or the taskbar icon returns it to its window home.

## 3. Feeding & Evolution (The "Data Diet")
- [ ] **Drag-and-Drop Handler**: The window accepts file drops (`Image`, `Audio`).
- [ ] **Trait Extraction**:
    - **Images**: Analyze dominant palette (Color mutation), resolution (Size mutation), and brightness (Personality/Aura).
    - **Audio**: Analyze BPM/Genre if possible, or use filename metadata to trigger "Sonic" traits (e.g., "Metal" -> Spiky, "Lo-fi" -> Chill/Floating).
- [ ] **Evolution Tree**: A branching logic system where specific combinations of "Data Types" unlock unique forms.

## 4. System Integration & UI
- [ ] **Start Menu Access**: Add "SKNIIGACHI.EXE" to the Start Menu.
- [ ] **Context Menu System**:
    - Implement a custom `ContextMenu` component with the "rough surface" / win95-outset theme.
    - Add right-click functionality to Start Menu items.
- [ ] **Taskbar Shortcuts**: 
    - "Pin to Taskbar" functionality via the context menu.
    - Dynamic shortcut area to the right of the SkniiTTY button.

## 5. Technical Tasks
- [ ] Create `src/components/Skniigachi.tsx`.
- [ ] Update `src/components/Taskbar.tsx` to support dynamic shortcuts and the new context menu.
- [ ] Create a `SkniigachiContext.tsx` if state needs to be shared between the Window and the Desktop "Walk" mode.
- [ ] Design/Source base pixel art assets for the pet.

---
*Plan initiated: March 13, 2026*
