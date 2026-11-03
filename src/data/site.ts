// Single source for business details. Edit here, not in pages.
export const site = {
  name: 'JNT Suppliers',
  legalName: 'JNT Suppliers',
  tagline: 'Pressroom chemicals for offset printing',
  description:
    'JNT Suppliers makes and imports fountain solution, plate cleaner, plate gum, roller wash and isopropyl alcohol for offset printers across Sri Lanka.',
  url: 'https://www.jntsuppliers.com',
  phoneDisplay: '+94 77 335 9286',
  phoneHref: 'tel:+94773359286',
  whatsappHref: 'https://wa.me/94773359286',
  email: 'janaka808@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=100063878719205',
  // Google Maps search used by the current site. Replace with the exact place link once confirmed.
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=JNT+Suppliers+Sri+Lanka',
  mapsEmbed: 'https://www.google.com/maps?q=JNT%20suppliers&t=m&z=10&output=embed&iwloc=near',
  // TODO(client): street address and opening hours are not on the current site.
  address: null as null | { street: string; city: string; country: string },
  hours: null as null | string,
  founder: {
    name: 'J. R. Priyadarshana',
    fullName: 'Janaka Priyadarshana',
    title: 'Founder and Proprietor',
  },
  // Claims taken from the current site. Confirm with the client before go-live (see README).
  claims: {
    years: 15,
    islandWideDelivery: true,
  },
};

// Cloudflare's always-pass test key is used unless a real one is set at build time.
export const turnstileSiteKey =
  import.meta.env.PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export const isStaging = import.meta.env.STAGING === '1' || process.env.STAGING === '1';

/** Prefix an internal path with the configured base (so /new/ staging works). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
