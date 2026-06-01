<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly subscription tracking app. A PostHog client was configured in `lib/posthog.ts` using `expo-constants` to securely load credentials from `app.config.js` extras (sourced from `.env`). The `PostHogProvider` was added to the root layout in `app/_layout.tsx`, wrapping the entire app with autocapture for touch events and manual screen tracking using Expo Router's `usePathname`. User identification is called on sign-in and sign-up (via Clerk) and `posthog.reset()` is called on sign-out. Six business events are tracked across five files.

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in with email and password | `app/(auth)/sign-in.tsx` |
| `user_signed_up` | User completes email verification and creates an account | `app/(auth)/sign-up.tsx` |
| `user_signed_out` | User signs out from the Settings screen | `app/(tabs)/settings.tsx` |
| `subscription_created` | User adds a new subscription (name, price, billing, category tracked) | `components/CreateSubscriptionModal.tsx` |
| `subscription_viewed` | User expands a subscription card to see its details | `app/(tabs)/index.tsx` |
| `subscription_searched` | User performs a search on the Subscriptions screen | `app/(tabs)/subscriptions.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1653502)
- [User Sign-ins Over Time](/insights/k0sw7qd7)
- [New User Sign-ups Over Time](/insights/Kj7dwoxo)
- [Subscriptions Created Over Time](/insights/BfDduzZI)
- [Subscriptions by Category](/insights/XA7LvFgM)
- [Sign-up to First Subscription Conversion](/insights/DX6HaphS)

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-expo/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
