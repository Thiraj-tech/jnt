# Image prompts

Each placeholder on the site shows a slot number. Generate an image for that slot, save it in
`src/assets/scenes/`, and swap the `<Placeholder>` for an `<Image>` (see "Swapping in an image" below).

## Rules (keep these, they protect the client)

- **General scenes only.** Don't generate the founder, JNT's own premises, or product cans with labels.
  Visitors will read these as real, and the products are chemicals people buy on trust.
- **No text, logos or brand names** in the image. Image models invent fake text.
- **No faces in focus.** Hands, sleeves and backs are fine.
- Use the same style line for every image so they look like one set.

## Style line (add to every prompt)

> Documentary industrial photography, natural window light mixed with warm overhead factory light,
> muted palette of warm off-white, graphite grey and steel, with small accents of process cyan,
> magenta-red and yellow ink. Shallow depth of field, subtle film grain, realistic, not glossy,
> no text, no logos, no watermarks.

## Slots

### 01 · Home page band · 21:8 (export 2520 × 960)
Close-up of a sheet-fed offset printing press in operation, looking along the dampening and inking
rollers, a thin film of water and cyan ink visible on the rollers, a freshly printed sheet with a
colour bar edge blurred in the foreground. + style line

### 02 · About page · 4:3 (export 1600 × 1200)
A quality-control laboratory bench: glass beakers of pale green liquid, a pH meter,
a pipette and a notebook, a gloved hand holding a beaker up to the light. Clean but used, not a
showroom. + style line

### 03 · About page · 4:3 (export 1600 × 1200)
Plain white 5-litre plastic chemical cans with blank labels and blue drums on a wooden pallet,
stacked in the back of a small delivery truck at a loading bay, late-afternoon tropical light.
+ style line

### 04 · Social share image (optional) · 1200 × 630
Overhead flat-lay of offset printing materials on a light grey surface: an aluminium printing
plate, a rubber blanket offcut, a printed colour bar strip and a few drops of cyan, red and yellow
ink. Leave the left third empty for a logo. + style line

## Swapping in an image

```astro
---
import { Image } from 'astro:assets';
import pressBand from '../assets/scenes/01-press.jpg';
---
<!-- replace: <Placeholder id="01" ... /> -->
<Image src={pressBand} alt="Dampening rollers on a sheet-fed offset press" widths={[800, 1600, 2520]} sizes="100vw" format="webp" />
```

Astro resizes and compresses at build time, so a full-size JPEG is fine as the source.
