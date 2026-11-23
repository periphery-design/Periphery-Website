// Shapes from the owner's wordmark (src/assets/logo/periphery-studio-o.svg), shared by the big homepage
// wordmark, the small header wordmark and the emblem, so all three line up exactly.
import raw from '../assets/logo/periphery-studio-o.svg?raw';

const paths = [...raw.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
/** Every letter except the "o" of Studio, plus the ® */
export const letters = [...paths.slice(0, 14), paths[15]];
/** The "o" of Studio (outer shape with its counter cut out) */
export const o = paths[14];
/** Just the o's counter: the slot the eye lives in */
export const counter = 'M' + o.split('ZM')[1];
/** The crop around the lettering, the same for the big and small wordmarks */
export const wordViewBox = '128 72 950 222';
/** The crop around the o, for the emblem */
export const oViewBox = '632.5 215.5 121 66.5';
