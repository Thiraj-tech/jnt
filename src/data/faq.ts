// Questions and answers for the home page Q&A section and its FAQPage schema.
// Every answer uses only facts already stated in the product data. Confirm new ones with the client first.
import { site } from './site';

export interface Faq {
  q: string;
  a: string;
  /** Optional follow-up link, path without the base. */
  link?: { href: string; text: string };
  /** Product pages (by slug) that also show this question. */
  products?: string[];
}

const allProducts = ['fountain-solution', 'plate-cleaner', 'plate-gum', 'roller-wash', 'isopropyl-alcohol'];

export const faqs: Faq[] = [
  {
    q: 'Which fountain solution is right for my press?',
    a: 'It depends mainly on your incoming water. JNTF-1 is buffered for hard water, JNTF-2 is balanced for soft to medium water, and JNTF-3 is an alcohol replacement fount. Our technical team can recommend a grade and starting dilution for your press, plates and water.',
    link: { href: '/products/fountain-solution/', text: 'Fountain solution technical data' },
    products: ['fountain-solution'],
  },
  {
    q: 'Can we stop using IPA in the dampening system?',
    a: 'Yes. JNTF-3 is formulated to remove alcohol from the dampening system entirely. It works with metal, conventional and non-metal laser plates and is suitable for all offset inks, including UV and EB. We can advise on the transition.',
    products: ['fountain-solution', 'isopropyl-alcohol'],
  },
  {
    q: 'Which plate cleaner should we use?',
    a: 'PJNT-1 is an alkaline cleaner for scratches, scum and oxidation. PJNT-2 is a heavy-duty cleaner for UV and conventional inks. PJNT-3 is a general cleaner for positive and negative aluminium plates. PJNT-4 is an economical cleaner and scratch remover with no abrasives.',
    link: { href: '/products/plate-cleaner/', text: 'Plate cleaner technical data' },
    products: ['plate-cleaner'],
  },
  {
    q: 'How should plate gum be diluted?',
    a: 'For plate processors, dilute 1 part gum to 1 part water. As a fountain solution additive, add it to pre-mixed fount in steps of 0.25% per litre.',
    link: { href: '/products/plate-gum/', text: 'Plate gum directions' },
    products: ['plate-gum'],
  },
  {
    q: 'Do you provide safety data sheets?',
    a: 'Safety data sheets are available on request for every product. For isopropyl alcohol we also provide the product specification and a certificate of analysis.',
    products: allProducts,
  },
  {
    q: 'What pack sizes are available?',
    a: 'Fountain solution, plate cleaner, plate gum and roller wash are supplied in 5 litre cans, with bulk quantities on request. Isopropyl alcohol is supplied in drums, with smaller packs on request.',
    products: allProducts,
  },
  ...(site.claims.islandWideDelivery
    ? [{ q: 'Do you deliver across Sri Lanka?', a: 'Yes. We deliver island-wide, to printers of every scale.' }]
    : []),
  {
    q: 'How do we request a quotation?',
    a: 'Send the enquiry form, message us on WhatsApp or call us. Tell us the products, quantities and delivery location, and we will respond with a recommendation and quotation.',
    link: { href: '/contact/', text: 'Request a quote' },
  },
];

/** Questions for one product page, without links back to the page itself. */
export const faqsFor = (slug: string): Faq[] =>
  faqs
    .filter((f) => f.products?.includes(slug))
    .map((f) => (f.link?.href === `/products/${slug}/` ? { ...f, link: undefined } : f));

export const faqSchema = (items: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});
