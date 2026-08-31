Update the existing Figma app prototype by adding ONLY the subscription/payment flow described below. Do not change, redesign, delete, rename, reposition, or otherwise modify anything else in the existing app. Everything outside of this specific flow is already completed and must remain exactly as it is.

IMPORTANT — PRESERVE THE EXISTING DESIGN
All new screens and UI elements must use the exact same visual language, design system, theme, typography, colors, spacing, components, buttons, icons, border radius, shadows, navigation patterns, and overall aesthetic already used throughout the existing app.

The new screens must feel like they were designed as part of the original app, not added later.

Reuse existing components and styles wherever possible.

Do NOT introduce a new visual style, new colors, new typography, new navigation patterns, or unrelated UI elements.

Do NOT modify any existing screens.

SUBSCRIPTION FLOW
The app currently has an existing account creation flow.

Immediately after the user successfully creates an account, show a new subscription screen.

1. Subscription Plan Screen
Create a new screen that appears immediately after account creation.

This screen should clearly present the available subscription plan.

There is currently ONLY ONE subscription plan:

Monthly subscription

Price: 4,99 €

Unlimited journeys
5 safety buddies
Smart anomaly detection on journeys
Journey history
The screen should include:

Title: Safe Journey

Price

Short, clear description of the benefits/features included

A prominent "Subscribe" button

Do NOT create annual, weekly, lifetime, free, trial, or any other plans.

The purpose of this screen is to make the user understand what they are subscribing to before continuing.

2. Payment Method Screen
When the user clicks "Subscribe", navigate to a dedicated payment screen.

The user must be able to choose between exactly these two payment methods:

Debit Card

PayPal

The payment screen should clearly show:

Selected subscription/monthly plan

Price

Payment method selection

Debit card payment option

PayPal payment option

Clear primary CTA to complete the payment

Debit Card
When Debit Card is selected, show the appropriate payment form fields, such as:

Cardholder name

Card number

Expiration date

CVV/security code

Include appropriate validation/error states where relevant.

PayPal
When PayPal is selected, show a clear PayPal payment option/button that represents connecting or authorizing the user's PayPal account to complete the subscription.

The UI should make it obvious that the user is about to authorize payment and start the subscription.

3. Payment / Subscription Completion
When the user successfully completes the payment:

The subscription should be considered active in the prototype.

The user should NOT remain on the payment screen.

Navigate directly to the existing home screen named:

"Good evening 'user name', ready for your journey?"

Do NOT redesign or modify this existing home screen.

Use the existing screen exactly as it currently exists.

The subscription flow should simply connect into it.

SUBSCRIPTION SETTINGS
Add a "Subscription" option somewhere appropriate inside the app's existing Settings screen.

IMPORTANT:

Do not redesign the Settings screen.

Use the existing Settings design and add only the necessary Subscription entry/option.

When the user opens Subscription, show a subscription management screen consistent with the existing app design.

It should show that the user currently has an active monthly subscription.

Include an option such as:

"Cancel subscription"

The user should be able to cancel their active subscription.

CANCELLATION FLOW
When the user selects "Cancel subscription", show an appropriate confirmation step before actually cancelling.

For example:

Explain that cancelling will end the subscription/access.

Provide a clear confirmation action.

Provide a way to go back without cancelling.

After the user confirms cancellation:

Mark the subscription as cancelled/inactive in the prototype.

Automatically log the user out of the application.

Navigate to the existing first/opening screen named:

"Go anywhere. Feel connected."

Do NOT redesign or modify this existing screen.

This should behave as the application's logged-out/initial state.

IMPORTANT PROTOTYPE BEHAVIOR
The complete flow should work in the Figma prototype:

New user flow:
Account creation
→ Subscription Plan
→ Subscribe
→ Payment Method
→ Debit Card OR PayPal
→ Complete Payment
→ Existing Home Screen: "Good evening, ready for your journey?"

Existing subscribed user:
Settings
→ Subscription
→ View active monthly subscription
→ Cancel subscription
→ Confirmation
→ Subscription cancelled
→ Automatic logout
→ Existing initial screen: "Go anywhere. Feel connected."

STRICT SCOPE — DO NOT CHANGE ANYTHING ELSE
This is extremely important:

ONLY implement the subscription and payment flow described above.

Do NOT:

Redesign existing screens

Change existing layouts

Change existing copy

Change existing navigation

Change existing colors

Change existing typography

Change existing icons

Change existing components

Change existing spacing

Change existing animations

Change existing onboarding

Change existing account creation screens

Change the existing Home screen

Change the existing "Good evening, ready for your journey?" screen

Change the existing "Go anywhere. Feel connected." screen

Add additional subscription plans

Add unrelated features

Add unrelated screens

Remove existing functionality

Replace existing components unnecessarily

Only add the minimum number of new screens/components/interactions required to make the subscription flow work.

The new screens must be visually indistinguishable from the rest of the existing application and must use the existing design system.

Before making changes, inspect the existing file and identify the current design system and reusable components. Reuse them instead of creating new styles.

The final result should feel like a small, native extension of the existing app — not a redesign.