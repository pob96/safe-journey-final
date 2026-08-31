# SafeJourney — FINAL IMPLEMENTATION PROMPT

You are modifying an **existing Figma Make project**, not creating a new design from scratch.

The existing SafeJourney app design is already largely complete and should be treated as the source of truth for the visual design, layout, typography, colors, spacing, navigation style, components, icons, map style, liquid-glass treatment, cards, buttons, and overall UX.

## CRITICAL RULE — DO NOT REDESIGN THE EXISTING APP

Make **ONLY** the changes explicitly listed in this prompt.

Everything that is not explicitly mentioned must remain exactly as it currently is.

Do NOT:

* redesign existing screens;
* change existing colors;
* change the existing typography;
* change the existing visual hierarchy;
* change existing layouts unless specifically instructed;
* replace existing components unnecessarily;
* change navigation unless specifically instructed;
* change existing copy unless specifically instructed;
* add extra features that are not requested;
* remove anything unless specifically instructed;
* “improve” or reinterpret existing screens on your own;
* regenerate existing screens from scratch;
* change the current liquid-glass visual language.

The goal is to make **targeted modifications to the existing app** while preserving everything else.

When creating a new screen, component, card, button, modal, map, form, or interaction, it must look as though it was designed as part of the existing SafeJourney app.

Use the **exact same visual language already present in the project**, including:

* existing color palette;
* existing typography;
* existing corner radii;
* existing spacing system;
* existing liquid-glass effect;
* existing glass transparency;
* existing blur;
* existing shadows;
* existing borders/highlights;
* existing button styling;
* existing icon style;
* existing map styling;
* existing bottom navigation;
* existing card styling.

Do not introduce a new design system.

---

# PART 1 — EXISTING SCREEN MODIFICATIONS

##

---

## 2. Screen: “Plan your journey”

Change this sentence:

Current:
“The app learns what your normal looks like”

New:
“The app knows what your normal looks like”

Remove the **“Skip”** button completely.

Change the image/visual at the top of the screen.

The current map looks too AI-generated. Replace it with a more modern, clean, polished map visual that feels like a real contemporary navigation/safety app.

The new map visual must:

* look realistic and modern;
* be clean and minimal;
* fit the existing SafeJourney aesthetic;
* use the existing visual language;
* not look like an AI-generated fantasy map;
* maintain the same overall visual balance of the screen.

Do not change anything else.

---

## 3. Screen: “Choose your safety buddy”

Remove the **“Skip”** button.

Remove the green decorative element above the word **“your”**.

Fix the liquid-glass effect around the profile circle.

Currently the glass effect extends outside the intended area, especially around the upper-right portion of the profile circle.

Adjust the glass shape so that:

* it stays within the intended profile/card area;
* it does not visually protrude around the profile circle;
* the top-right area is rounded;
* the glass effect looks intentional and polished;
* it remains consistent with the existing liquid-glass style.

The second buddy/profile circle currently showing **“A”** must instead show:

**B**

The name underneath it must change from:

**Ana**

to:

**Buddy**

Do not change anything else.

---

## 4. Screen: “Good evening Petra”

Change:

“Ready for your run?”

to:

“Ready for your journey?”

In the **“Your safety circle”** card, the control/feature for adding another person is currently not aligned with the other profile circles.

Align the **Add person** element with the other circles so they form one clean, straight horizontal line.

Do not otherwise change the safety-circle card.

---

## 5. Screen: Map screen where the user draws/selects a route

Change the activity emojis in the Run, Walk and Cycle options to **women emojis**.

This must become a cohesive app-wide rule:

### Activity emojis must consistently use women emojis throughout the entire SafeJourney app.

Do not mix the current gender-neutral/man-looking versions with women emojis in other screens.

For the cycling option, change the text to:

**cycle/roller**

Make sure this fits comfortably inside the button.

If necessary, allow the text to wrap onto two lines.

If wrapping is necessary, use:

cycle
roller

rather than forcing the slash into an awkward layout.

Do not make the button excessively large just to accommodate the text.

### Long route names

If the selected route name is too long to fit horizontally, it must NEVER extend outside its frame or card.

Instead:

* allow the route name to wrap;
* use 2 or 3 lines when necessary;
* keep the text inside the available frame;
* preserve the existing typography and hierarchy;
* maintain clean spacing.

Do not truncate the route name unless absolutely necessary.

---

# 6. Screen: “Who should watch over you?”

The **“Add trusted contact”** button must now open a new screen.

Create a new **Add Trusted Contact** screen.

The new screen must contain:

### Name

A field where the user enters the person's name.

### Phone number

A field where the user enters the trusted buddy's phone number.

### Relationship

A field where the user enters the relationship to that person.

Examples could be:

* Friend
* Partner
* Family
* Parent

But keep the field flexible so the user can enter their own relationship.

### Confirm button

Add one simple confirmation button:

**Confirm**

Clicking Confirm should represent saving the new trusted contact and return the user to the appropriate previous screen with the new person added.

This is primarily a UI/prototype flow. Keep the implementation simple and ready for later functional programming.

The new screen must look completely native to SafeJourney.

Use the same:

* colors;
* liquid-glass cards;
* liquid-glass buttons;
* typography;
* spacing;
* corner radii;
* icons;
* background treatment.

Remove the existing card that says:

**“No app needed…”**

Do not change anything else on this screen.

---

# 7. Screen: Active/Ongoing Journey

This is the screen where the user's journey is currently ongoing.

## “Stop” and “Off route” states

For both the **Stop** state and the **Off route** state, the available buttons must be exactly:

**I'm okay**

and

**Check in with [buddy name]**

Replace `[buddy name]` dynamically with the selected safety buddy's name.

Do NOT show:

**Return to route**

as a button option.

It should not be presented as a clickable button.

### “I'm okay”

When the user clicks:

**I'm okay**

the intended behavior is that the selected buddy receives a push notification saying that the user is okay.

This will later be implemented in Cursor, so the Figma prototype should clearly represent the interaction/state but does not need real push-notification functionality.

### “Check in with [buddy name]”

When the user clicks this button, it should lead to the phone/contact options flow, such as WhatsApp or other available communication options.

This functionality will later be programmed in Cursor.

---

# 8. Active Journey — “Concern” state

For the Concern state:

Remove the:

**Share location**

button.

In the card above the map, change the message from:

“Ana may want to check in”

to:

**[Buddy name] has been notified**

Use the actual selected buddy's name dynamically.

The **I'm okay** button should represent notifying the buddy that the user is okay.

## Phone fall detection

Add **phone fall detection** as another reason that can trigger the Concern state.

The Concern state should therefore be capable of representing at least these situations:

1. User manually enters a concern state.
2. User goes off route.
3. User stops for the relevant detection period.
4. Phone fall detection detects a possible fall.

When phone fall detection occurs, the buddy must be alerted through the same safety-alert concept.

The fall-detection state should visually fit into the existing Concern experience rather than creating an unrelated design.

Do not add unnecessary features beyond this.

---

# 9. Screen: “You made it”

When this screen appears:

The buddy should receive a push notification indicating that the user's journey has finished.

The location-sharing session should also stop.

These behaviors will later be implemented in Cursor, so represent the correct product behavior/state in the prototype without attempting unnecessary backend implementation.

Remove the celebration emoji from the circle containing the heart.

Keep the heart.

Change that circle so it has a liquid-glass effect consistent with the rest of the app.

The circle should feel like part of the existing design system rather than a flat standalone graphic.

## View journey details

Any **“View journey details”** button on this screen should navigate to:

**Your journeys**

Create/use the Your Journeys screen described below.

---

# 10. Screen: “Your safety circle”

Remove the information showing what type of alerts each individual buddy receives.

Do not show per-buddy alert categories.

All trusted buddies receive all relevant notifications:

* journey started;
* unusual/safety events;
* journey finished.

The UI should simply show the trusted people without displaying individual alert permissions/categories.

## Add person

When the user clicks:

**Add person**

open the same **Add Trusted Contact** screen described earlier.

It must contain:

* Name
* Phone number
* Relationship
* Confirm

When Confirm is clicked, represent saving the new person and return to the safety-circle screen with the person added.

Use the exact same Add Trusted Contact screen/component for both entry points.

Do not create two visually different versions.

---

# 11. Screen: “Privacy and Safety”

In the **Account** card, remove:

**Emergency information**

and:

**Delete journey history**

Leave only:

**Data and Privacy**

and:

**Delete account**

## Data and Privacy

When the user clicks **Data and Privacy**, open a new screen.

Use the following content EXACTLY.

Do not rewrite, shorten, paraphrase, or add legal content.

# How We Use Your Data

We collect and use your personal data to provide the safety and location-sharing features of our app.

## Location Data

When you choose to use our safety or location-sharing features, the app may collect your device's location data, including GPS location, in order to allow your designated Trusted Contact to follow your location while you are using the feature.

Your location is shared with your Trusted Contact only when you have enabled the relevant location-sharing or safety feature. The purpose of collecting and sharing this information is to help your Trusted Contact monitor your location while you are, for example, running, walking, cycling, or otherwise traveling alone.

Depending on the feature you use, location data may be collected while the app is running in the background so that your Trusted Contact can receive an up-to-date view of your location.

We do not use your location data for advertising or sell your location data to third parties.

## Name and Phone Number

We may collect your name and phone number to create and manage your account, identify you within the app, and enable communication and safety features.

Your phone number may also be used to help establish or manage your relationship with your Trusted Contact and to support account verification and security.

## Trusted Contact Information

If you designate another person as your Trusted Contact, we may process information necessary to provide the Trusted Contact functionality, such as their name, phone number, account identifier, or device information required to deliver notifications through the app.

You are responsible for providing accurate information and, where applicable, ensuring that you have the appropriate permission to provide another person's personal information to us.

## Push Notifications

We use push notifications to provide important safety-related updates to you and your Trusted Contact.

For example, when you start or stop a location-sharing session, when a safety feature is activated, or when another relevant event occurs, the app may send a notification to the appropriate user.

To deliver push notifications, we may process technical information associated with the recipient's device, such as a device or push-notification token. These tokens are used to route notifications to the correct device and are not used to determine your physical location.

## How We Use Your Data

We may use your personal data to:

* provide and operate the app and its safety features;
* collect and share your location with your Trusted Contact when you have enabled location sharing;
* allow Trusted Contacts to view your location during an active safety or location-sharing session;
* send safety-related push notifications and alerts;
* create and manage user accounts;
* verify your identity and secure your account;
* communicate with you about the app and its services;
* detect, prevent, and investigate fraud, misuse, security incidents, or unauthorized access;
* maintain, troubleshoot, and improve the app and its functionality; and
* comply with applicable legal obligations.

We only use your personal data for purposes that are relevant to providing, securing, and improving our services, or as otherwise permitted or required by applicable law.

## Your Control Over Location Sharing

Location sharing is under your control. You can choose whether to start or stop a location-sharing or safety session, subject to the functionality of the app.

When location sharing is stopped, we will no longer share your current location with your Trusted Contact through that active session.

You can also manage or remove your Trusted Contact through the app, where this functionality is available.

For more information about the types of personal data we collect, the legal bases for processing, how long we retain your data, who we share it with, and your rights, please see our full Privacy Policy.

### Layout requirements for this screen

Because this is a long privacy document, make it a clean, vertically scrollable screen.

Keep:

* readable line height;
* clear heading hierarchy;
* comfortable margins;
* appropriate spacing between sections;
* existing SafeJourney typography;
* existing background/liquid-glass aesthetic.

Do not make the text unnecessarily tiny just to fit it onto one screen.

---

## Delete account

When the user clicks:

**Delete account**

show a confirmation modal/card or dedicated confirmation screen asking:

**Do you want to permanently delete your account?**

Provide exactly two clear actions:

**Confirm**

and

**Cancel**

Cancel returns to Privacy and Safety.

Confirm represents deleting the complete account and then returns the user to the **first/home onboarding screen** of SafeJourney.

This is the intended product flow. Actual account deletion will be implemented later.

---

# 12. Screen: “Settings”

## Journey Defaults

In the **Journey Defaults** card, remove:

**Default safety buddy**

and:

**Remember default buddy**

Leave ONLY:

**Default duration**

When the user clicks **Default duration**, open a small liquid-glass card/modal.

It should allow the user to enter a preferred journey duration using:

* Hours
* Minutes

Include one simple:

**Confirm**

button.

When Confirm is clicked, return to the Settings screen and represent the selected duration as the new default duration.

Keep this interaction visually simple.

---

## Support

When the user clicks:

**Help and Support**

open a new screen.

Use the following content EXACTLY:

# Help & Support

We're here to help you stay safe and get the most out of the app.

## Need Help?

If you are experiencing a problem or have a question, contact our support team on [safe_journey@gmail.com](mailto:safe_journey@gmail.com).

When contacting support, please include as much relevant information as possible, such as a description of the issue, the device you are using, and the app version. Please do not include unnecessary personal or sensitive information.

## Safety Issues

If the app is not working as expected during an active safety or location-sharing session, do not rely solely on the app to protect you.

If you are in immediate danger or need emergency assistance, contact your local emergency services.

## Privacy Questions

If you have questions about how we collect, use, share, or protect your personal data, please review our Privacy Policy or contact us through the support options provided in the app.

## Feedback

We welcome your feedback. If you have suggestions for improving the app or its safety features, please let us know.

We're continuously working to make the app more reliable, useful, and safe.

Make this screen vertically scrollable and readable.

Keep the same SafeJourney visual style.

---

# PART 2 — NEW ONBOARDING / ACCOUNT SCREEN

## 13. New screen after “Create my first journey”

There is an existing onboarding screen containing the concept/message:

**Privacy comes first**

When the user clicks:

**Create my first journey**

open a NEW account/setup screen.

Do not skip this screen.

The new screen should ask for:

### Name

User's name.

### Email

User's email address.

### Phone number

User's phone number.

The entered information must conceptually become the user's profile information.

## Data and Privacy

Include a clearly visible **Data and Privacy** link.

When clicked, it should open the same Data and Privacy content/screen described earlier.

The user must also have a clear indication that by confirming, they agree to the relevant data/privacy terms.

Use a simple confirmation control rather than creating a complicated legal consent flow.

Then provide one primary button:

**Confirm**

When Confirm is clicked:

1. Save/represent the entered name, email and phone number as the user's account/profile information.
2. Navigate to the next screen.
3. The next screen must be the existing journey-start/home experience that says:

**Good evening [Name]**

Use the name entered by the user dynamically.

The information entered here must also appear in the user's **Profile** section when the user accesses Profile through the bottom navigation.

Do not create a separate visual style for this screen.

---

# PART 3 — YOUR JOURNEYS

## 14. New “Your Journeys” screen

Create a **Your Journeys** screen.

This screen should show the user's past journeys.

It should use the existing SafeJourney card system and liquid-glass aesthetic.

The screen should feel like a natural continuation of the current app.

Each past journey can be represented as a clean journey-history card containing useful existing journey information such as:

* journey name;
* date;
* duration;
* route/activity;
* completion status.

Do not invent unnecessary functionality.

The important requirement is that the screen clearly represents the user's previous journeys and can be reached from:

**View journey details**

on the “You made it” screen.

Use the existing SafeJourney visual language.

---

# PART 4 — BUDDY / TRUSTED CONTACT EXPERIENCE

The app needs a second experience for the person who is acting as the user's buddy/trusted contact.

This must still be the SAME SafeJourney app.

Do not create a separate-looking app.

The buddy experience must use the exact same:

* colors;
* typography;
* liquid-glass effect;
* cards;
* buttons;
* map style;
* navigation style;
* icon language;
* spacing system.

---

# 15. Buddy receives a push notification when a safety event occurs

When a user is currently on a journey, the buddy can receive safety-related push notifications.

The notification can be triggered when:

### Off route

The user has gone off the planned route.

### Stopped

The user has stopped for 10 minutes.

### Phone fall detection

The user's phone has detected a possible fall.

The actual push-notification functionality will be programmed later in Cursor.

For the Figma prototype, create the corresponding screens and navigation states.

---

# 16. Buddy safety-alert tracking screen

When a buddy taps a safety notification, it should open the SafeJourney app directly on a tracking screen.

The tracking screen should contain:

### Map

Show the user's current location on a map.

The map should visually match the existing map shown to the user during an active journey.

Do not create a new map design.

Reuse the same map visual language.

### Detection message

Clearly communicate what triggered the alert.

Examples:

**[User name] is off route**

or

**[User name] has stopped for 10 minutes**

or

**Possible fall detected for [User name]**

The message should be visually prominent but still match the existing SafeJourney hierarchy.

### Call

Add a button:

**Call**

When pressed, it should represent connecting to the phone to call the user's phone number.

Actual phone functionality will be implemented later in Cursor.

### Check in

Directly below Call, add:

**Check in**

When pressed, it should represent opening communication options such as WhatsApp and other available communication methods.

Actual communication functionality will be implemented later in Cursor.

The two buttons must look like native SafeJourney liquid-glass buttons.

---

# 17. Buddy can leave and return to tracking

The buddy must be able to navigate back to the app's home screen from the tracking screen.

They must also be able to return to the active friend's journey later.

Therefore the app needs a permanent bottom-navigation option for tracking.

---

# 18. Bottom navigation change

Where the current bottom navigation contains:

**Journey**

replace that navigation item with:

**Tracking**

The bottom navigation should otherwise remain unchanged.

Do not redesign the bottom navigation.

Only replace the Journey option with Tracking.

The **Tracking** option must always be present.

This is important because the buddy needs an obvious place to return to a currently active friend's journey.

---

# 19. New “Tracking” screen

Create a new **Tracking** screen.

This is the screen opened when the buddy taps **Tracking** in the bottom navigation.

## When a friend is currently sharing their journey

Show the active friend's journey.

Display:

* friend's name;
* current journey status;
* map;
* current location;
* relevant journey/safety information.

The map must be visually the same style as the existing active-journey map.

The buddy should be able to select/view the active friend's current journey.

## When nobody is currently sharing their journey

Show a clean empty state:

**No journeys to track at the moment.**

Keep the empty state visually consistent with the existing SafeJourney app.

Do not add unnecessary illustrations or unrelated features.

---

# 20. Journey-start notification for buddy

When a user starts a journey and has a buddy/trusted contact watching over them, the buddy should receive a push notification indicating that the friend's journey has started.

When the buddy taps that notification, it should open the SafeJourney app directly on the **Tracking** screen showing that friend's current active journey.

This should be the same Tracking experience described above.

The actual push notification will be programmed later in Cursor; the Figma prototype only needs to represent the correct destination/state.

---

# 21. Tracking screen behavior after returning from an alert

If a buddy received an alert and opened the specific alert tracking screen, they should be able to navigate back to the app home screen.

If they later tap:

**Tracking**

in the bottom navigation, they should be able to find the currently active friend's journey again.

Do not require the buddy to rely on the original push notification to find the journey again.

---

# PART 5 — CONSISTENCY RULES

## Dynamic names

Where the app currently uses a fixed example buddy such as “Ana”, make the relevant new flows conceptually dynamic.

For example:

**[Buddy name] has been notified**

**Check in with [buddy name]**

**[User name] is off route**

**[User name] has stopped for 10 minutes**

**Possible fall detected for [User name]**

The actual data/backend behavior will be implemented later.

---

## Activity emoji consistency

Whenever the app uses the Run, Walk, Cycle/Roller activity choices, use women emojis consistently throughout the app.

Do not leave old inconsistent activity emojis elsewhere.

---

## Glass consistency

Every new:

* screen;
* modal;
* card;
* button;
* form;
* profile element;
* tracking component;
* confirmation dialog

must use the SAME liquid-glass design language as the existing app.

Do not invent a second glass effect.

Do not make new elements look flatter, darker, brighter, more opaque, or more colorful than the existing design system.

---

# PART 6 — NAVIGATION / FLOW SUMMARY

Implement the following navigation relationships:

### Onboarding

Privacy comes first
→ **Create my first journey**
→ Account/setup screen
→ Enter Name + Email + Phone
→ Data and Privacy link available
→ Agree/consent
→ **Confirm**
→ Existing **Good evening [Name]** journey home

### Trusted contact

Who should watch over you?
→ **Add trusted contact**
→ Add Trusted Contact screen
→ Name + Phone + Relationship
→ **Confirm**
→ Return to previous screen with person added

Your safety circle
→ **Add person**
→ Same Add Trusted Contact screen
→ **Confirm**
→ Return to safety circle

### Active journey

Active journey
→ Stop / Off route
→ **I'm okay** or **Check in with [buddy name]**

Concern
→ Buddy has been notified
→ **I'm okay**

Fall detection
→ Concern/safety alert state
→ Buddy notified

### Completion

Active journey
→ Journey finished
→ **You made it**
→ Buddy notified
→ Location sharing stops
→ **View journey details**
→ **Your Journeys**

### Privacy

Privacy and Safety
→ Data and Privacy
→ Data/privacy information screen

Privacy and Safety
→ Delete account
→ Confirmation
→ Confirm → first/home onboarding screen
→ Cancel → Privacy and Safety

### Settings

Settings
→ Default duration
→ Hours + Minutes
→ Confirm
→ Settings

Settings
→ Help and Support
→ Help & Support screen

### Buddy experience

Buddy receives journey-start notification
→ SafeJourney opens
→ Tracking screen
→ Current friend's journey/map

Buddy receives off-route/stopped/fall notification
→ SafeJourney opens
→ Alert tracking screen
→ Map + detected event + Call + Check in

Buddy can leave the tracking screen
→ Home

Buddy can always return through bottom navigation
→ Tracking
→ Active friend's journey

If no active journey exists:

Tracking
→ **No journeys to track at the moment.**

---

# FINAL IMPLEMENTATION INSTRUCTION

Before making changes, inspect the existing project and reuse its current components wherever possible.

This is an **existing polished design**.

Prioritize:

1. preserving everything that already works;
2. making only explicitly requested modifications;
3. reusing existing components;
4. keeping all new screens visually identical in style to the existing app;
5. keeping navigation consistent;
6. keeping text inside frames;
7. maintaining clean responsive layouts;
8. avoiding unnecessary design changes.

Do not regenerate the entire app.

Do not redesign screens that are not mentioned.

Do not change existing colors, typography, visual style, liquid-glass treatment, map style, navigation styling, or component styling unless explicitly requested above.

If an existing component can be reused, reuse it instead of creating a visually different version.

If something is not explicitly mentioned in this specification, **leave the existing implementation unchanged**.

The final result should feel like the same SafeJourney app before and after these modifications — just with the requested functionality, corrected copy, corrected layouts, and the new screens/flows added.
