# Framework Guidance

## React

- Follow the existing router, data-fetching, and component patterns already used by the repo.
- Prefer focused page and component changes over broad refactors.
- Keep state close to where it is used unless the project already relies on shared state primitives.
- For form, navigation, and async UI bugs, verify the behavior in browser after code changes.

## Vue

- Respect the existing composition style in the repo, such as Composition API or Options API.
- Keep template, script, and style responsibilities clear instead of mixing unrelated logic into one large SFC.
- When changing reactive state or watchers, verify the actual rendered behavior rather than assuming the code path is enough.
- For new projects, use Composition API with `<script setup>` syntax.

## Vite

- Treat Vite as the default choice for new Web app setup unless the repo already standardizes on another bundler.
- Keep environment-specific values in `.env` or the project's existing config pattern instead of hardcoding them into UI files.
- Check route base paths, asset paths, and build output behavior before deployment.

## Routing and build defaults

- Use the existing router if present; do not switch routing libraries without an explicit requirement.
- For purely static hosting environments, prefer hash routing when server rewrite support is absent or unknown.
- Make build and preview commands explicit before handing off deployment steps.

## Vue 3 UI Component Libraries

The following libraries are approved for use in Vue 3 projects within this workspace. Choose based on the specific need — prefer headless/unstyled primitives when the project has a custom design system (like the 青花瓷 porcelain theme).

### Headless / Unstyled (preferred for custom design systems)

| Library | GitHub | Purpose |
|---------|--------|---------|
| **Radix Vue** | `radix-vue/radix-vue` | Unstyled, accessible component primitives (Dialog, Dropdown, Tabs, Tooltip, etc.). Pair with custom CSS for full design control. |
| **Headless UI** | `tailwindlabs/headlessui` (Vue branch) | Unstyled interactive components (Listbox, Menu, Switch, Transition). Official Tailwind companion. |
| **VueUse** | `vueuse/vueuse` | Collection of 200+ composable utilities (storage, clipboard, dark mode, intersection observer, etc.). Essential for any Vue 3 project. |

### Animation Libraries

| Library | GitHub | Purpose | When to Use |
|---------|--------|---------|-------------|
| **GSAP** | `greensock/GSAP` | Professional-grade animation engine. Framework-agnostic. | Hero section entrance animations, scroll-triggered parallax, complex timeline sequences. |
| **@vueuse/motion** | `vueuse/motion` | Vue-native animation library, declarative API. | Simple component transitions, hover effects, reactive animations. |
| **Lenis** | `darkroom-engineering/lenis` | Buttery smooth scroll, replaces default browser scroll. | Full-site smooth scrolling experience, especially for culture showcase pages. |
| **Anime.js** | `juliangarnier/anime` | Lightweight animation library, framework-agnostic. | Micro-interactions, number counters, SVG path animations. |

### Data Visualization

| Library | GitHub | Purpose | When to Use |
|---------|--------|---------|-------------|
| **ECharts** | `apache/echarts` | Comprehensive charting library (pie, bar, heatmap, calendar, etc.). | Vocabulary category distribution, learning heatmap calendar, pronunciation tone charts. |
| **D3.js** | `d3/d3` | Low-level data visualization, maximum flexibility. | Custom visualizations like tone contour lines, language relationship graphs, geographic maps. |

### Icons

| Library | GitHub | Purpose |
|---------|--------|---------|
| **Lucide Icons** | `lucide-icons/lucide` | Clean, consistent icon set. Tree-shakeable. Default choice for Vue 3 projects. |
| **Iconify** | `iconify/iconify` | Universal icon framework, access to 200K+ icons from all sets (Material, FontAwesome, etc.). Use via `@iconify/vue`. |

### Design Reference (for AI-assisted development)

| Resource | GitHub / URL | Purpose |
|----------|-------------|---------|
| **awesome-design-md** | `VoltAgent/awesome-design-md` | Collection of 70+ DESIGN.md specs from top products (Linear, Vercel, Stripe, Notion, Apple). Feed these to AI coding assistants to get professional-grade UI output instead of generic AI aesthetics. |

### Project-Specific Library Choices

For the 布依语词典 (Buyi Dictionary) Web frontend, the recommended stack is:

```
Radix Vue          -- Accessible primitives (Dialog, Tabs, Dropdown, Tooltip)
VueUse             -- Composable utilities (storage, dark mode, clipboard)
GSAP               -- Hero animations, scroll-triggered effects
ECharts            -- Data visualization (culture page, learning stats)
Lenis              -- Smooth scrolling
Lucide Icons       -- Icon system
```

Do NOT install libraries that are not listed above without explicit user approval. The project has a strong custom design identity (青花瓷/山水墨韵) — avoid heavy styled component libraries that would override the visual system.
