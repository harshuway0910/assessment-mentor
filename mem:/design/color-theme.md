---
name: Light-blue colour theme
description: EduCheck AI uses a light-blue "Glacier Desk" palette with semantic tokens; never hardcode colours.
type: design
---
The app's colour theme is light blue, chosen by the user, with these details chosen for them:

- Paper/background: pale ice blue. Cards: near-white with a cool tint. Text: deep navy.
- Lead accent: a confident mid blue. A slightly cyan-leaning second blue is used only for variety in dashboard tiles.
- Status meanings: amber = waiting on the teacher, teal-sage = approved/healthy, coral-clay = similarity or integrity flag.
- All colours are semantic tokens in `src/styles.css`; components use token classes only — never hex values or utilities like `bg-white`/`text-white`.
- Tone classes (`soft-*`, `icon-*`, `tone-*`, `chart-*`, `bar-*`, `dot-*`) are written by hand in a components layer because they are assembled at runtime and Tailwind's scanner never sees them. New tone values need entries there too.
