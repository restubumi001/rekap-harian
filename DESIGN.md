# Design Brief

## Direction

Dapur Ledger — a calm Indonesian kitchen notebook where surplus and shortfall of rice and side dishes read at a glance.

## Tone

Editorial/utilitarian hybrid: ledger-precise data density wrapped in a warm, confident pantry palette — never a generic food-app.

## Differentiation

Every quantity is set in tabular mono numerals and every surplus/shortfall is a color-coded ledger chip (leaf green / coral red), so the page reads like a balanced kitchen account book, not a form.

## Color Palette

| Token      | OKLCH      | Role                              |
| ---------- | ---------- | --------------------------------- |
| background | 0.975 0.006 250 | cool off-white ledger paper  |
| foreground | 0.19 0.02 255   | ink text                     |
| card       | 1 0.003 250     | elevated ledger cards        |
| primary    | 0.46 0.16 262   | pantry indigo — actions     |
| accent     | 0.72 0.15 78    | turmeric highlight           |
| muted      | 0.945 0.01 250  | table stripes / quiet zones  |
| success    | 0.52 0.14 150   | kelebihan (surplus)          |
| destructive| 0.55 0.2 26     | kekurangan (shortfall)       |

## Typography

- Display: Space Grotesk — headings, summary numbers, section titles
- Body: DM Sans — labels, table cells, paragraphs, UI text
- Mono: JetBrains Mono — porsi quantities, tabular alignment
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase text-muted-foreground`, body `text-base`

## Elevation & Depth

Two-tier shadow: `shadow-subtle` on table/rows, `shadow-elevated` on summary cards; depth via layered off-white surfaces, never flat.

## Structural Zones

| Zone    | Background       | Border     | Notes                              |
| ------- | ---------------- | ---------- | ---------------------------------- |
| Header  | bg-card          | border-b   | indigo brand mark + nav pills      |
| Content | bg-background    | —          | alternate `bg-muted/30` sections   |
| Footer  | bg-muted/40      | border-t   | quiet ledger note + totals         |

## Spacing & Rhythm

Section gaps `py-10 md:py-14`; summary cards in a tight `gap-4` grid; table rows `px-4 py-3`; micro-spacing `gap-2` inside chips and stat groups.

## Component Patterns

- Buttons: `rounded-lg`, primary indigo with `hover:bg-primary/90`, ghost for secondary actions, `transition-smooth`
- Cards: `rounded-xl bg-card border border-border shadow-subtle`, summary cards `shadow-elevated`
- Badges: pill `rounded-full`, surplus `bg-surplus-soft text-surplus border-surplus`, shortfall `bg-shortfall-soft text-shortfall border-shortfall`
- Table: striped `bg-muted/30` header, mono tabular numbers, colored selisih column

## Motion

- Entrance: staggered `fade-up` on cards (0.4s ease-out, 60ms delay)
- Hover: cards lift to `shadow-elevated`; rows tint `bg-muted/50` (0.2s)
- Decorative: `fade-up` keyframe only — no bounce, no glow

## Constraints

- Light mode primary; dark mode is a fully tuned warm-charcoal inversion
- Colors only via semantic tokens — no raw hex, no arbitrary values
- Surplus = green token, shortfall = red token, never swapped
- No CSV/Excel export, no email surfaces reserved

## Signature Detail

Tabular mono numerals in colored ledger chips make every quantity a balanced account entry — a typographic treatment, not decoration.
