# Icon System

## How Icons Work

Icons are provided by the `@init-project/iconsvg` package and rendered via `@iconify/tailwind4` as CSS classes.

The icon set is registered in `src/styles/index.css`:

```css
@plugin "@iconify/tailwind4" {
  icon-sets: from-json(svgicon, './node_modules/@init-project/iconsvg/dist/svgicon.json');
}
```

This loads all icons from the SVG icon JSON into the Iconify engine, making them available as Tailwind utility classes.

## Usage

```tsx
<span className="icon-[svgicon--one] inline-block h-4 w-4" />
```

The classname pattern is:

```
icon-[svgicon--{icon-name}]
```

The three demo icons currently defined are:

- `svgicon--one`
- `svgicon--two`
- `svgicon--fill-msg`

Use `icon-[svgicon--fill-{name}]` for filled-style variants.

## Adding New Icons

1. Define the SVG icon in the `@init-project/iconsvg` package (located at `node_modules/@init-project/iconsvg/` in the source repo).
2. Rebuild the `svgicon.json` manifest in that package.
3. Run `pnpm install` to update the local copy.
4. The new icon is immediately available via `icon-[svgicon--{name}]`.

## Styling Icons

Icons are inline-block elements. Size, color, and other Tailwind utilities apply normally:

```tsx
<span className="icon-[svgicon--one] inline-block h-5 w-5 text-blue-500 hover:text-red-500" />
```

All CSS color utilities work — use `text-{color}` to change the icon color, as SVG icons inherit `currentColor` by default.

## Best Practices

- Always set explicit `h-{size}` and `w-{size}` classes (or equivalent sizing).
- Use `inline-block` or `block` as the display type.
- For conditional styling, use the `cn()` utility from `src/lib/cn.ts`.
- Prefer the `svgicon--fill-*` variant when a filled icon style is needed.
