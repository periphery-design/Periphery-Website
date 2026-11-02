import strategyImg from '../assets/projects/biotechne-multiomics/social-triptych.jpg';
import artDirectionImg from '../assets/projects/biotechne-multiomics/billboard.jpg';
import illustrationImg from '../assets/projects/biotechne-immunology/dictionary.jpg';
import brandingImg from '../assets/projects/biotechne-multiomics/literature.jpg';
// Placeholder copy for the wireframe. Swap for real words once they're written.


// Four disciplines. Home: hover-reveal list (name + image). About: Spiegel-style panel (line + tags).
// Images are stand-ins from the case studies; swap for a dedicated image per discipline when ready.
export const capabilities = [
  {
    name: 'Strategy',
    line: 'Finding the truth about a brand that nobody has used yet, and the audience who needs to hear it.',
    tags: ['Insight & research', 'Positioning', 'Audience mapping', 'Campaign platforms'],
    image: strategyImg, alt: 'Three social posts reading “Same Slide.”, “Same Section.” and “Same Moment.”',
  },
  {
    name: 'Art Direction',
    line: 'Making the idea look as sharp as it reads, in every format it has to live in.',
    tags: ['Visual direction', 'Photo & film direction', 'Design systems', 'Typography'],
    image: artDirectionImg, alt: 'Digital billboard of a scientist with fluorescent cells reflected in their safety glasses',
  },
  {
    name: 'Illustration',
    line: 'Placeholder: drawing that carries the idea, from a quick sketch to a whole visual language.',
    tags: ['Hand-drawn systems', 'Icons', 'Scientific illustration', 'Lettering'],
    image: illustrationImg, alt: 'Dictionary-style card for immunology with a hand-written definition and cell sketches',
  },
  {
    name: 'Branding',
    line: 'Placeholder: identities built to flex across every channel without losing themselves.',
    tags: ['Identity systems', 'Brand guidelines', 'Literature', 'Packaging'],
    image: brandingImg, alt: 'A spread of printed brochures with researcher portraits and fluorescent imagery',
  },
];

export const process = [
  { title: 'Listen', body: 'Placeholder: getting under the brief — the business problem, the audience, and what the brand can say that nobody else can.' },
  { title: 'Find the idea', body: 'Placeholder: lots of routes, quickly, then one idea worth backing, sharpened until it fits in a sentence.' },
  { title: 'Make it', body: 'Placeholder: bringing the idea to life across every channel it needs, with craft that matches the ambition.' },
  { title: 'Launch & learn', body: 'Placeholder: putting it into the world, watching what lands, and feeding that back into the next move.' },
];

export const faqs = [
  { title: 'What kind of projects do you take on?', body: 'Placeholder answer: campaign ideas, launches and brand storytelling, for brands of any size that want to be noticed.' },
  { title: 'How long does a campaign take?', body: 'Placeholder answer: a rough range, and what changes it.' },
  { title: 'Do you work with agencies as well as brands?', body: 'Placeholder answer.' },
  { title: 'How do we get started?', body: 'Placeholder answer: send a note with the brief, or a half-formed idea, and we’ll set up a call.' },
];
