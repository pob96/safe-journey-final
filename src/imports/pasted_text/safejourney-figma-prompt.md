# SafeJourney — Final Figma Make Implementation Prompt

## 0. PRIMARY OBJECTIVE

Update the **existing SafeJourney mobile app in this Figma Make project**.

This is a refinement of an existing product, **not a redesign**.

The goal is to make the current prototype feel like a coherent, production-ready mobile app with correct navigation, realistic state logic, consistent UI, correct copy, and complete Buddy tracking functionality.

### CRITICAL RULE

**Do not create a new visual language.**

Before changing anything, inspect the existing screens and components in this project and reuse them wherever possible.

Preserve:

* Existing visual design
* Existing typography
* Existing colors
* Existing spacing
* Existing cards
* Existing buttons
* Existing icons
* Existing map design and map treatment
* Existing journey-state indicators
* Existing navigation
* Existing component styling
* Existing visual hierarchy
* Existing animations/interactions where appropriate

Only change the elements specifically requested below.

If an existing component already solves a requirement, **reuse that component rather than creating a visually different replacement.**

Do not redesign unrelated screens.

---

# 1. IMPORTANT PRODUCT MODEL

SafeJourney has two different roles:

### USER / RUNNER

The person who is currently taking a journey.

Their experience is:

> "I'm going somewhere → something happens → I can respond to it."

### BUDDY

The trusted person monitoring the journey.

Their experience is:

> "My friend is taking a journey → something happens → I need to understand their status."

These two roles should use the **same visual system**, but the content and available actions must reflect the role.

---

# 2. BUDDY TRACKING EXPERIENCE

The existing project already contains journey-state screens for the person taking the journey:

* Normal
* Stop
* Off Route
* Fall

These existing screens are the **visual source of truth**.

Do not redesign these states from scratch.

Create Buddy versions by adapting the existing screens.

The Buddy should see the same map treatment, cards, indicators, hierarchy, typography, colors and overall design language.

Only change:

* Perspective
* Copy
* Role-specific information
* Role-specific controls

---

# 3. TRACKING MENU LOGIC

The **Tracking** item in the main menu must open the Tracking screen.

The Tracking screen has two main conditions.

## CONDITION A — NO ACTIVE SHARED JOURNEY

If the Buddy currently has no friend actively sharing a journey/location with them:

Show the existing empty state:

> **No journeys to track at the moment.**

Keep the existing supporting text/design that already exists in the project.

Do not create a new empty-state design.

---

## CONDITION B — ACTIVE SHARED JOURNEY

If a friend is actively sharing a journey/location with the Buddy:

Show the Buddy tracking experience.

The Buddy tracking state depends on the runner's current journey state:

```text
Normal → Buddy Normal
Stop → Buddy Stop
Off Route → Buddy Off Route
Fall → Buddy Fall
```

The selected journey must belong to the relevant user who is sharing their journey with the Buddy.

---

# 4. BUDDY TRACKING — NORMAL

Reuse the existing **Normal journey screen** as the visual foundation.

Adapt it for the Buddy perspective.

The Buddy should see:

* Runner's current location
* Planned route
* Runner's progress
* Current journey status
* Relevant distance
* Relevant time information
* Clear indication that the runner is okay
* Clear indication that the runner is currently on track

Use Buddy-oriented messaging.

Examples:

> **[Runner name] is on the planned route**

> **[Runner name] is moving normally**

The exact wording should fit the existing design and available space.

### IMPORTANT

Do NOT show:

* "I'm okay"
* Runner-specific confirmation controls
* Other actions intended only for the person taking the journey

The Buddy is an observer.

---

# 5. BUDDY TRACKING — STOP

Reuse the existing **Stop / stopped-too-long screen**.

Adapt the copy and controls for the Buddy.

Show:

* Runner's current location
* Planned route
* Current position
* Duration of the stop
* Clear warning that the runner has stopped longer than expected

Example:

> **[Runner name] has stopped**

> **Stopped for 8 minutes**

The duration must be dynamic in the actual product implementation.

The Figma prototype can use realistic example values.

### CONTROLS

Remove:

* "I'm okay"
* Runner-specific controls

KEEP:

> **Call [Runner name]**

This is a Buddy action and must remain available.

---

# 6. BUDDY TRACKING — OFF ROUTE

Reuse the existing **Off Route screen**.

Adapt it for the Buddy.

Show:

* Runner's current location
* Planned route
* Clear indication that the runner is outside the planned route
* Warning/status information
* Appropriate Buddy-perspective messaging

Example:

> **[Runner name] is off the planned route**

### CONTROLS

Remove:

* "I'm okay"
* Runner-specific controls

KEEP:

> **Call [Runner name]**

---

# 7. BUDDY TRACKING — FALL

Reuse the existing **Fall screen**.

Adapt it for the Buddy.

Show:

* Runner's detected/last known location
* Planned route
* Clear warning that a possible fall has been detected
* Appropriate explanatory messaging

Example:

> **Possible fall detected**

> **We detected a possible fall during [Runner name]'s journey.**

This should remain the highest-priority warning state.

### CONTROLS

Remove:

* "I'm okay"
* Runner-specific controls

KEEP:

> **Call [Runner name]**

---

# 8. BUDDY TRACKING DEVELOPMENT STATE SWITCHER

Add a temporary development/demo state switcher so every Buddy state can be previewed in Figma Make / Mirror.

The switcher must allow:

1. No active journey
2. Active journey — Normal
3. Active journey — Stop
4. Active journey — Off Route
5. Active journey — Fall

This is strictly a **development/prototype tool**.

It must not be treated as part of the final production UI.

Keep it visually separate from the production experience.

---

# 9. BUDDY PUSH NOTIFICATIONS

Add the notification content/specification for Buddy tracking.

## CRITICAL

Do NOT create a custom in-app notification component pretending to be an iOS or Android system notification.

Native push notification appearance is controlled by iOS/Android.

Figma should define:

* Notification title
* Notification body
* Severity
* Notification event
* Tap behavior
* Destination state

Create a small **Push Notifications** specification/demo section in the project showing the three notification examples.

The examples should be clearly labeled as approximate platform notification examples.

---

# 10. PUSH NOTIFICATION — OFF ROUTE

### Title

> ⚠️ [User name] is off route

### Body

> [User name] has moved outside the planned route.

### When tapped

Navigate directly to:

```text
Tracking
→ relevant active journey
→ Buddy Off Route state
```

Then:

* Select the relevant runner/journey
* Open the Off Route state
* Center the map on the runner's current location

The Buddy should immediately understand:

* Who is off route
* That this is a warning
* Where the runner currently is

---

# 11. PUSH NOTIFICATION — STOPPED TOO LONG

### Title

> ⚠️ [User name] has stopped

### Body

> [User name] hasn't moved for [X] minutes.

### When tapped

Navigate directly to:

```text
Tracking
→ relevant active journey
→ Buddy Stop state
```

Then:

* Select the relevant runner/journey
* Open the Stop state
* Center the map on the runner's current location

---

# 12. PUSH NOTIFICATION — POSSIBLE FALL

### Title

> 🚨 Possible fall detected

### Body

> A possible fall was detected during [User name]'s journey.

### When tapped

Navigate directly to:

```text
Tracking
→ relevant active journey
→ Buddy Fall state
```

Then:

* Select the relevant runner/journey
* Open the Fall state
* Center the map on the runner's detected/last known location

This is the highest-priority notification.

---

# 13. NORMAL STATE NOTIFICATION

Do NOT create or send a push notification simply because the runner is:

* Running normally
* Moving normally
* Remaining on route

Normal status is primarily displayed inside the Tracking screen.

---

# 14. PUSH NOTIFICATION PROTOTYPE FLOW

Add temporary prototype/demo controls allowing me to trigger/select:

* Off Route notification
* Stopped Too Long notification
* Possible Fall notification

When I select/tap a notification in the prototype:

```text
Notification
→ Tracking
→ Relevant active journey
→ Correct Buddy state
```

The correct user/journey must be selected conceptually from the notification data.

These prototype controls are temporary and are **not production UI**.

The actual push infrastructure will later be implemented in code/backend.

---

# 15. ROLE-SPECIFIC CALL ACTIONS

There are two separate call behaviors in the app.

## Runner perspective

On the runner's active journey screen:

Replace every:

> Check in with buddy

button with:

> **Call buddy**

The button should use the existing button component/style.

It should conceptually call the Buddy's saved phone number.

The saved Buddy phone number should be the destination.

In Figma Make, prototype the interaction as far as possible.

The actual phone call integration will later be implemented in Cursor/native code.

---

## Buddy perspective

On Buddy Tracking:

For Stop, Off Route and Fall:

Keep:

> **Call [Runner name]**

This must use the runner's saved phone number.

Again, the actual phone integration can later be implemented in Cursor.

Do not create a fake custom phone interface.

---

# 16. RUNNER ACTIVE JOURNEY — STATUS OPTIONS

On the existing active journey screen, the status options must be:

* **Normal** — green dot
* **Stop** — yellow dot
* **Off Route** — red dot
* **Fall** — red dot

Remove:

> Concern

There should be no separate Concern option.

All non-Normal states represent a concern.

---

# 17. RUNNER ACTIVE JOURNEY — NOTIFICATION MESSAGING

For Stop, Off Route and Fall, update the card above the map.

Instead of:

> Something changed

show:

> **[Buddy name] has been notified**

The text underneath:

> **Buddy has been notified**

can remain as it currently exists if that is the existing supporting text/design.

Apply this consistently to:

* Stop
* Off Route
* Fall

Do not change the existing visual hierarchy unnecessarily.

---

# 18. RUNNER ACTIVE JOURNEY — END JOURNEY

All four active journey states must contain:

> **End journey**

below the Call buddy button.

This applies to:

* Normal
* Stop
* Off Route
* Fall

The wording should be exactly:

> **End journey**

Use the existing styling/component system.

---

# 19. ONBOARDING — "GO ANYWHERE. FEEL CONNECTED"

Update the existing screen.

### Title

Change the title so it appears in exactly **two rows**:

> Go anywhere.
> Feel connected.

Each sentence should occupy one row.

Do not allow it to wrap into three rows.

Preserve the existing typography/style.

### Skip behavior

The Skip button must check authentication/account state.

If the user:

* Already has an account
* Is already signed in

→ navigate to:

> **Good evening**

If the user does not have an account/sign-in:

→ navigate to:

> **Create your account**

Do not force an already-authenticated user through account creation again.

---

# 20. CHOOSE YOUR SAFETY BUDDY

On the existing **Choose your safety buddy** screen:

In the first contact circle, replace:

> P

with:

> Y

Do not change anything else on this screen.

---

# 21. PRIVACY FIRST

On the existing **Privacy first** screen:

When the user taps:

> **Create my first journey**

check whether they already have an account.

If they already have an account / are already signed in:

→ Do NOT open **Create your account**.

Instead navigate to the appropriate signed-in journey-start flow, using the existing app flow. If the existing signed-in destination is **Good evening**, use that.

If they do not have an account:

→ continue to **Create your account**.

---

# 22. CREATE YOUR ACCOUNT — DATA AND PRIVACY

When the user taps:

> **Data and Privacy**

open the existing Data and Privacy content screen.

The content is long.

Make the screen vertically scrollable so the user can read the **entire text from beginning to end**.

Do not truncate, clip or hide text.

Preserve the existing design.

---

# 23. CREATE YOUR ACCOUNT — BACK NAVIGATION

When the user opens Data and Privacy from **Create your account** and then taps the back button:

The back button must return to:

> **Create your account**

It must NOT return to:

> Good evening

The navigation stack should preserve the screen from which Data and Privacy was opened.

The user must return to the Create your account form and continue entering their details.

---

# 24. GOOD EVENING — RECENT JOURNEYS

The Recent Journeys section must only display **real completed/recent journey data**.

Do not use fake placeholder journeys as if they were real.

If the user has no recent journeys:

Show:

> **No recent journeys yet.**

Do not show fake journey entries.

When real journey data exists, display it using the existing journey-entry design.

---

# 25. JOURNEY PLANNING MAP

On the screen where the user draws/plans a journey on the map:

The travel-mode options include:

* Walk
* Run
* Cycle
* Roller/etc.

Because Cycle/Roller is displayed across two rows, do not add an unnecessary slash `/`.

Use the existing labels cleanly.

---

# 26. JOURNEY DISTANCE AND ESTIMATED TIME

Distance and estimated journey time should conceptually be calculated from the actual map route.

The calculation must depend on:

* Actual planned route
* Travel mode
* Walking speed
* Running speed
* Cycling speed
* Roller/other applicable mode

Do not hard-code one generic estimated time for all journey types.

For the Figma prototype, use realistic representative values and make the data structure ready to be replaced by real map calculations later.

The actual routing, distance and ETA calculations will later be implemented in Cursor.

---

# 27. "YOU MADE IT" SCREEN

Change:

> Journey completed normally

to:

> **Journey completed**

Do not change the surrounding design unless necessary.

---

# 28. YOUR JOURNEYS

The **Your journeys** screen must only show **real completed journeys**.

Do not show fake or placeholder journeys as real history.

Every displayed journey must contain truthful data based on the journey that actually occurred.

For example:

* Journey type
* Walk/run/cycle/etc.
* Morning/evening/etc.
* Duration
* Estimated time
* Actual outcome
* Status
* Relevant unusual event if one occurred

---

## NORMAL COMPLETION

If a journey was ended from the **Normal** state:

Show:

* Green status dot
* Completed journey
* Correct duration
* Correct estimated time
* Correct activity type
* Correct time/context such as morning/evening

Use the existing journey-history visual style.

---

## UNUSUAL COMPLETION

If a journey ended in:

* Stop
* Off Route
* Fall

show what actually happened.

Preserve the existing example on the Your journeys screen that demonstrates an unusual journey outcome.

Use that existing design pattern consistently.

Show relevant information such as:

* What happened
* Whether the user confirmed they were okay
* Whether the user called the Buddy
* Appropriate status

Only show information that actually applies to that journey.

Do not fabricate outcomes.

---

# 29. YOUR SAFETY CIRCLE — EDIT BUDDY

On **Your Safety Circle**, when the user taps:

> Edit

next to a Buddy:

Open a screen based on the existing:

> **Add trusted contact**

screen.

Reuse the exact same layout/components.

Only change the title to:

> **Edit trusted contact**

The user must be able to edit:

* Buddy name
* Phone number
* Relationship

When the user taps:

> **Confirm**

save the changes and immediately reflect them on:

> **Your Safety Circle**

Use the updated information everywhere the Buddy appears.

---

# 30. YOUR SAFETY CIRCLE — REMOVE BUDDY

When the user taps:

> **Remove**

the Buddy should be immediately removed from the trusted contacts/safety circle.

Update the Safety Circle screen immediately.

Do not leave stale Buddy information visible.

---

# 31. PRIVACY AND SAFETY — DATA AND PRIVACY

On **Privacy and Safety**, when the user taps:

> **Data and Privacy**

the complete existing text must be readable.

Make the content screen vertically scrollable.

The user must be able to scroll all the way to the end.

Do not clip or truncate the text.

Preserve the existing visual design.

---

# 32. SETTINGS — DEFAULT JOURNEY DURATION

In Settings, the existing Default Duration option currently allows the user to choose:

* Hours
* Minutes

Keep this functionality.

Add another option:

> **Estimated by maps**

This means the journey duration will be automatically estimated from the route and selected travel mode.

### IMPORTANT DEFAULT

**Estimated by maps must be the default option for every new user.**

The user can manually switch to a fixed/default duration if desired.

When "Estimated by maps" is selected:

```text
Route drawn on map
→ route distance calculated
→ travel mode considered
→ estimated journey duration calculated
→ estimated duration used for the journey
```

The real map calculation will later be implemented in Cursor.

---

# 33. SETTINGS — HELP AND SUPPORT

When the user taps:

> **Help and Support**

the opened screen must be vertically scrollable.

All existing Help and Support content must be readable from beginning to end.

Do not clip, truncate or hide text.

---

# 34. SETTINGS — ABOUT SAFEJOURNEY

When the user taps:

> **About SafeJourney**

open a new About screen.

The screen must be vertically scrollable so the entire text can be read.

Use the existing SafeJourney visual language.

Use exactly this content:

## About Us

We created this app with one simple thought in mind: everyone should feel free to go wherever they want, while the people who care about them can have peace of mind.

The idea came from something very personal. My younger sister loves going for runs and walks on her own, and, like many older sisters, I often found myself checking her location just to make sure she was okay. I realized there had to be a better way. One that didn’t require me, or anyone else, to constantly watch a map.

That’s how the idea for our app was born.

Instead of asking someone to follow your every move, the app lets you plan your journey, choose a trusted buddy, and simply go. Your buddy knows when you start, but they don’t need to watch your location throughout the journey. The app quietly keeps an eye on the things that matter, and if something unexpected happens, such as leaving the planned route, staying in one place for too long, or detecting a fall, your buddy is alerted right away.

Because safety shouldn’t mean giving up your freedom. And caring about someone shouldn’t mean constantly worrying about them.

Whether you’re going for a run, taking a walk, rollerblading, hiking, or simply heading out on your own, we want you to feel confident knowing that someone you trust will know if something changes.

We built this for our sisters, daughters, friends, partners, and for anyone who wants to explore the world independently while knowing that someone has their back.

Go your way. We’ll help keep someone you trust in the loop.

---

# 35. DATA / STATE MODEL FOR THE PROTOTYPE

Where possible, structure the prototype as if these are real data objects rather than independent static screens.

Conceptually, a journey should have information such as:

```text
Journey
- runner/user
- buddy
- route
- current location
- travel mode
- distance
- estimated duration
- actual duration
- start time
- end time
- current status
- completed status
- notification status
- user response
- unusual event
```

Possible journey statuses:

```text
normal
stopped
offRoute
fall
completed
```

This will make the prototype easier to translate into real application logic later.

---

# 36. NAVIGATION RULES

Navigation must preserve context.

Examples:

```text
Onboarding
→ Skip
→ signed in = Good evening
→ not signed in = Create your account
```

```text
Create your account
→ Data and Privacy
→ Back
→ Create your account
```

```text
Tracking
→ no active shared journey
→ No journeys to track
```

```text
Tracking
→ active shared journey
→ Buddy Normal / Stop / Off Route / Fall
```

```text
Push notification
→ Tracking
→ specific user
→ specific active journey
→ specific journey state
```

```text
Your Safety Circle
→ Edit
→ Edit trusted contact
→ Confirm
→ updated Safety Circle
```

```text
Your Safety Circle
→ Remove
→ Buddy removed immediately
```

Do not route users through unrelated screens.

---

# 37. IMPORTANT: REAL DATA VS DEMO DATA

Use realistic demo data only where necessary for the Figma prototype.

However, do not visually present fake journeys as if they are real historical user data.

The UI/data structure should clearly support:

* Empty state
* One active journey
* Multiple potential journeys
* Completed journeys
* Unusual journeys
* Different Buddy names
* Different journey statuses

The actual backend/data persistence will later be implemented in Cursor.

---

# 38. WHAT MUST NOT BE CHANGED

Do not unnecessarily change:

* Existing navigation structure
* Existing brand identity
* Existing colors
* Existing typography
* Existing map visual treatment
* Existing journey-state visual design
* Existing component styling
* Existing onboarding visual style
* Existing cards
* Existing spacing system
* Existing icons
* Existing screens that are not mentioned in this prompt

Do not create a new design system.

Do not replace the existing map with a different visual style.

Do not redesign the runner journey-state screens when adapting them for Buddy.

---

# 39. IMPLEMENTATION PRIORITY

When making changes, follow this priority order:

### Priority 1 — Preserve the existing design

Reuse existing components and screens.

### Priority 2 — Correct role logic

Clearly distinguish Runner from Buddy.

### Priority 3 — Correct navigation

Users must always be taken to the appropriate screen based on authentication, journey and notification state.

### Priority 4 — Correct journey states

Normal, Stop, Off Route and Fall must work consistently.

### Priority 5 — Correct data representation

Do not show fake completed journeys as real history.

### Priority 6 — Prototype interactions

Make the flows demonstrable in Figma Make / Mirror.

### Priority 7 — Future-code readiness

Structure states and interactions so they can later be implemented cleanly in Cursor.

---

# 40. FINAL QUALITY CHECK — DO THIS BEFORE FINISHING

Before considering the implementation complete, inspect the entire project and verify every requirement below.

### Tracking

* [ ] Tracking menu opens Tracking
* [ ] Empty state works
* [ ] Buddy Normal works
* [ ] Buddy Stop works
* [ ] Buddy Off Route works
* [ ] Buddy Fall works
* [ ] Buddy states reuse existing runner UI
* [ ] Buddy does not see "I'm okay"
* [ ] Buddy can call the runner on warning states
* [ ] Development state switcher can preview all five states

### Notifications

* [ ] Off Route notification exists
* [ ] Stopped Too Long notification exists
* [ ] Possible Fall notification exists
* [ ] Normal does not generate a notification
* [ ] Notification content is platform-appropriate
* [ ] Notifications are clearly only approximate native examples
* [ ] Notification tap goes directly to the correct Tracking state
* [ ] Correct user/journey is selected
* [ ] Map centers on the relevant runner
* [ ] Temporary notification demo controls work

### Onboarding / account

* [ ] Go anywhere title is exactly two rows
* [ ] Skip correctly checks authentication
* [ ] Signed-in user goes to Good evening
* [ ] New user goes to Create your account
* [ ] Safety Buddy first circle says Y
* [ ] Privacy First does not unnecessarily send existing users to account creation
* [ ] Data and Privacy screens scroll fully
* [ ] Create account → Data and Privacy → Back returns to Create your account

### Journeys

* [ ] Good evening only shows real recent journeys
* [ ] Empty recent journeys state works
* [ ] Journey planning labels are correct
* [ ] Map route data supports real distance/ETA later
* [ ] Estimated by maps is the default duration setting
* [ ] You Made It says "Journey completed"
* [ ] Your Journeys only shows completed journeys
* [ ] Completed journey information is truthful
* [ ] Normal completion has green status
* [ ] Stop/Off Route/Fall outcomes are represented correctly

### Safety Circle

* [ ] Edit opens Edit trusted contact
* [ ] Existing Buddy information is pre-filled
* [ ] Name can be edited
* [ ] Phone can be edited
* [ ] Relationship can be edited
* [ ] Confirm saves changes
* [ ] Updated information immediately appears in Safety Circle
* [ ] Remove immediately removes the Buddy

### Settings

* [ ] Default Duration still supports hours/minutes
* [ ] Estimated by maps exists
* [ ] Estimated by maps is default
* [ ] Help and Support scrolls fully
* [ ] About SafeJourney screen exists
* [ ] About SafeJourney contains the exact provided text
* [ ] About SafeJourney scrolls fully

---

# 41. FINAL INSTRUCTION

Treat this entire prompt as an update to the **existing SafeJourney product**, not as a request to create a new app.

**Inspect the existing project first.**

Identify the existing:

* Normal journey screen
* Stop journey screen
* Off Route journey screen
* Fall journey screen
* Tracking screen
* Maps
* Cards
* Buttons
* Status indicators
* Navigation
* Trusted contact screens
* Account screens
* Journey history screens
* Settings screens

Then modify and connect those existing components.

When there is a choice between creating something new and reusing an existing component, **reuse the existing component**.

The final result should feel as though all of these features were part of SafeJourney from the beginning.

Do not leave placeholder screens where a requested screen should exist.

Do not create unrelated redesigns.

Do not duplicate the same UI unnecessarily.

Do not create fake native notification UI.

Do not expose development controls as production functionality.

Make the prototype fully demonstrable in Figma Make / Mirror while keeping the architecture and state logic clear enough to implement later in Cursor.

The final experience should communicate one consistent product idea:

> **The user is free to go their way, while someone they trust is kept in the loop when something important happens.**
