# Installing learncn.fun

The root page and `/1c/` share `/manifest.webmanifest`, app ID `/`, root scope,
and standalone launch mode. The manifest has 192px/512px PNG icons (the larger
icon supports maskable launchers), an Apple touch icon, and a Penguin shortcut.
The SVG source is `public/icons/app.svg`; all artwork fits inside the maskable
safe circle. The icon depicts 中, with the writing activities' gold start dot.

An install card appears on the app picker and penguin map when the browser
fires `beforeinstallprompt`. A provider retains that one-use event during
lessons. Only tapping Install app opens the browser's confirmation; acceptance,
`appinstalled`, or standalone mode hides the card. Not now or a native dismissal
snoozes reminders for seven days, shared across both pages. Storage failures
still allow dismissal for the current visit. No installation telemetry is sent.

iPhone/iPad visitors get Share → Add to Home Screen instructions instead of
an unsupported programmatic install action. Keep Open as Web App enabled when
that switch is offered. Unsupported browsers remain usable as normal websites.

This change enables installation, not offline downloads. It does not add a
service worker or cache the 44MB voice model. Connectivity is still needed for
uncached lesson assets, writing data, and any network-backed speech voices.

References:
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
- https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios
