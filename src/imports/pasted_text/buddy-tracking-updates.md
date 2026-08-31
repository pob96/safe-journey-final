# SafeJourney — Final UI/UX Changes

## CRITICAL RULE — DO NOT CHANGE ANYTHING ELSE

This is a **final refinement pass**, not a redesign.

**Only make the changes explicitly described in this prompt. Do not modify, redesign, rearrange, rename, remove, add, or “improve” anything that is not explicitly mentioned below.**

Preserve all existing:

* screens and navigation flows
* UI components
* layouts that are not mentioned
* typography
* colors
* spacing
* icons
* buttons
* text and labels
* interactions
* animations
* liquid glass effects
* visual hierarchy
* UX behavior
* existing functionality

If something is not mentioned in this prompt, **leave it exactly as it is**.

Do not introduce new design patterns or make aesthetic changes based on your own interpretation.

---

# 1. KEEP THE ENTIRE DESIGN SYSTEM COHESIVE

Throughout every change, preserve the existing SafeJourney visual language.

All modified screens must feel like they belong to the **same existing app**.

Keep the existing:

* color palette
* typography
* font hierarchy
* liquid glass / glassmorphism effect
* transparency and blur effects
* border treatments
* corner radii
* shadows
* button styling
* icon style
* spacing system
* map styling
* overall visual hierarchy
* interaction patterns

Do **not** create a new visual style for the modified screens.

When adapting the Buddy web view layout to the Active journey screens, reuse the existing components and styling wherever possible rather than creating visually different replacements.

---

# 2. UPDATE THE "ACTIVE JOURNEY" SCREENS USED WHEN A BUDDY IS TRACKING A FRIEND

There are existing **Active journey** screens that represent the situation where a buddy is tracking another user's journey.

These screens already have UX/interaction behavior that I like.

However:

* I prefer the **UI and layout of the "Buddy web view" screen**.
* I prefer the **UX and functionality of the existing "Active journey" tracking screens**.

Therefore, **combine these two existing designs**:

### Keep from the existing Active journey tracking screens:

* their tracking behavior
* their interactions
* their journey-state logic
* their overall functionality
* the way the different journey situations work

### Take from the Buddy web view screen:

* its layout
* its visual hierarchy
* its UI structure
* its positioning and presentation of information
* its overall composition

The result should look like the **Buddy web view**, while behaving like the existing **Active journey tracking experience**.

Do not redesign the tracking experience from scratch.

---

# 3. JOURNEY STATES — MUST BE CONSISTENT

The Buddy tracking experience must correctly represent these four possible journey states:

1. **Normal**
2. **Stop**
3. **Off route**
4. **Fall**

For each state, make sure that **all visible information, text, indicators, buttons, status messages, colors, icons, and map information correspond to that exact state**.

Do not mix information from one state with another.

For example:

* A Normal state must not contain messaging or indicators suggesting a fall, stop, or off-route situation.
* A Stop state must clearly represent that the tracked person has stopped.
* An Off route state must clearly represent that the tracked person has deviated from the planned route.
* A Fall state must clearly represent the fall/emergency state and use the appropriate existing emergency UI treatment.

Use the existing SafeJourney design language and existing components for these states.

**Do not invent additional journey states.**

---

# 4. REPLACE THE STATIC/DRAWN MAP WITH A REAL INTERACTIVE MAP

On **all of the Buddy tracking / Active journey screens described above**:

Remove the current stationary map that looks like a static drawing.

Replace it with a **real interactive map**.

The map must:

* be an actual interactive map rather than a static illustration
* allow the user to zoom in
* allow the user to zoom out
* support normal map interaction
* visually fit the existing SafeJourney UI
* preserve the existing liquid-glass/UI treatment around the map where applicable

The map should still communicate the relevant journey information and route for the current state.

For the different states, the map content must correspond to the state:

* **Normal:** show the normal journey/route situation.
* **Stop:** show the relevant stopped position/status.
* **Off route:** clearly represent the deviation from the planned route.
* **Fall:** clearly represent the relevant fall/emergency location/status.

Do not use another static illustrated map as a substitute.

---

# 5. BUTTONS ON BUDDY TRACKING SCREENS

On all of the modified Buddy tracking / Active journey screens:

### REMOVE:

**Details**

The Details button should not appear anywhere on these screens.

### KEEP:

**Call [user name]**

There should be only one primary action button in this area:

**Call [user name]**

The actual user's name should remain dynamically/appropriately represented according to the existing design.

Do not add another replacement button for Details.

Do not change the existing Call [user name] functionality.

---

# 6. PRESERVE ACCOUNT CREATION DATA WHEN NAVIGATING TO DATA & PRIVACY

Fix the existing bug in the account creation flow.

Current behavior:

1. The user enters information into the account creation fields.
2. The user opens/checks the **Data and Privacy** information.
3. The user presses the back arrow to return to account creation.
4. Previously entered information has been deleted.

### Required behavior:

When the user returns from **Data and Privacy** to the account creation screen, **all previously entered information must remain exactly as it was**.

Do not clear or reset the form when navigating to Data and Privacy and back.

The following must be preserved:

* all text entered into fields
* all selected options
* all previously completed information
* the current form state

The user should be able to:
**enter information → open Data & Privacy → go back → continue creating the account without re-entering anything.**

Do not change the visual design of the account creation screen unless necessary to fix this behavior.

---

# 7. SETTINGS — DEFAULT JOURNEY DURATION TEXT CONTRAST

In Settings, under the **Default duration of journeys** option:

The text:

**Hours**

and

**Minutes**

is currently too light and difficult to read against the background.

Change these labels to **black** so they have sufficient contrast and are clearly readable.

Also change the following text to **black**:

**Duration estimated from route and travel made**

Do not change the layout, font, size, spacing, controls, background, or any other part of this Settings screen.

Only change the text color of the specified text.

---

# 8. FINAL QUALITY CONTROL / ACCEPTANCE CRITERIA

Before considering the work finished, verify all of the following:

### Scope

* No unrequested screens have been changed.
* No unrequested UI elements have been changed.
* No existing functionality has been removed or altered unless explicitly requested above.
* No new redesign decisions have been introduced.

### Visual consistency

* The entire app still feels like one cohesive SafeJourney product.
* Modified screens use the existing SafeJourney design system.
* Liquid glass effects remain consistent.
* Colors, typography, buttons, icons, spacing, and components remain visually consistent.

### Buddy tracking

* Active journey tracking screens now use the Buddy web view's preferred UI/layout.
* Existing Active journey tracking functionality is preserved.
* Normal, Stop, Off route, and Fall states are correctly represented.
* Text and UI always match the current journey state.
* The map is a real interactive map.
* The map can be zoomed in and out.
* The Details button is completely removed from these screens.
* Only the Call [user name] action remains in that button area.

### Account creation

* Entered account information survives navigation to Data & Privacy and back.
* No previously entered information is lost or reset.

### Settings

* "Hours" is black.
* "Minutes" is black.
* "Duration estimated from route and travel made" is black.
* Nothing else on that Settings screen is changed.

## MOST IMPORTANT FINAL INSTRUCTION

**Do not make any additional improvements beyond the changes listed in this prompt.**

If an existing element, screen, interaction, text, layout, color, animation, or component is not explicitly mentioned as needing a change, **preserve it exactly as it currently is**.

The goal is to make these specific final corrections while leaving the rest of the SafeJourney app untouched.
