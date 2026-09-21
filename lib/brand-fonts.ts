import { EB_Garamond, Figtree } from 'next/font/google';

// Same families as the public /welcome page so the app and the marketing site read as one brand.
const serif = EB_Garamond({ subsets: ['latin'], display: 'swap', variable: '--font-kx-serif' });
const sans = Figtree({ subsets: ['latin'], display: 'swap', variable: '--font-kx-sans' });

/** Class names that expose the brand font variables. Add to a `.kx-app` root. */
export const brandFontClasses = `${serif.variable} ${sans.variable}`;
