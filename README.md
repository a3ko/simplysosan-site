# Simply Sosan site

A proposed rebuild of the public pages of [simplysosan.com](https://simplysosan.com/), for Sosan Hua to review.
Nothing here is live: the domain still points at the current GoHighLevel site.

## What's here

    public/
      index.html       home: offer overview, why a coach, member quotes, about Sosan, newsletter signup
      programs.html    signature programs and seasonal resets, with one waitlist form for all of them
      membership.html  the Simply Wellness Club: monthly cycle, pricing, FAQ
      podcast.html     the show, listen buttons, and the latest episodes read live from the feed
      resources.html   free guides, recipes and archived articles
      about.html       Sosan's story, credentials and media
      login.html       points members to the Kajabi members' site (no password form on a preview)
      privacy.html     her privacy policy, word for word from the current site
      terms.html       her terms and conditions, word for word from the current site
      styles.css       every colour and font comes from the tokens at the top; light and dark themes
      site.js          English / 中文 toggle (remembered per browser) and the preview-only form message
      img/             Sosan's own photos and logo, taken from the current site and resized for the web
    worker/index.js    runs only for /api/*: GET /api/episodes turns the podcast RSS feed into JSON

Plain HTML and CSS, no build step. Every menu and footer link stays inside the preview; only the join
buttons, the members' site, the podcast apps and individual recipe and article posts go to other sites. Every page carries both languages: English in `lang="en"` elements and
Traditional Chinese in `lang="zh-Hant"`, and the toggle hides one. Add both whenever you add text.

To look at it locally:

    npx wrangler dev    # then open http://localhost:8787 (pages plus /api/episodes)

## Left as it is on the current site

- **Membership checkout** is ThriveCart (`simplysosan.thrivecart.com/swc-membership2025/`). The preview's join
  buttons go to the current sales page instead, so nobody pays from a preview by accident.
- **Member area** stays on Kajabi (`client.simplysosan.com`), plus the private Facebook group.
- **Podcast, YouTube, privacy policy and terms** link to the existing pages.

## Needed from Sosan before any of this goes live

1. Dates and prices for the seasonal resets and both signature programs.
2. Where signups should go: which email tool she uses now (GoHighLevel or another), and her welcome
   and waitlist emails. The forms show a "preview only" message until this is connected.
3. Permission from Candy, Jane and Gabrielle to quote them. Their words are copied from the current
   membership page, trimmed but not reworded.
4. A read of every Chinese sentence. Most reuse her existing copy, but some lines were written for
   this preview and need her eye.
5. Confirmation that $68 and $680 are Canadian dollars, so the pages can say so.
6. Access to the domain's DNS when she decides to switch.

## Previews

Every pull request gets its own preview URL on Cloudflare, posted as a comment by
`.github/workflows/preview.yml`, the same as `capgaze-app`. It needs a `CLOUDFLARE_API_TOKEN` repository
secret (Workers Scripts:Edit); without one the job warns and skips. Previews send `noindex` and
`robots.txt` disallows everything, so search engines never list a copy of her site.

There is no production deploy yet, on purpose: `wrangler.jsonc` has no routes and `workers_dev` off,
so nothing is reachable except per-PR previews. Going live means adding simplysosan.com to `routes`
and a deploy workflow, once Sosan has approved it.
