/** @type {import('tailwindcss').Config} */

/*
 * AARAMBH — public-sector portal theme.
 *
 * Deep petrol navy carries the institutional weight; a warm terracotta is the
 * brand accent (links, figures, primary actions). Status colour stays semantic
 * and separate: emerald = certified, amber = pending, rose = rejected.
 *
 * Tailwind's stock slate / emerald / amber / rose / blue ramps are untouched —
 * the dashboard markup was authored against them. Only brand scales move.
 */

const navy = {
  50:  '#EEF3F6',
  100: '#D5E1E8',
  200: '#AAC2CF',
  300: '#7699AE',
  400: '#43708C',
  500: '#1E5A76',
  600: '#14495F',   // primary
  700: '#103C4E',
  800: '#0E3648',
  900: '#0A2836',
  950: '#061A24',
};

const terracotta = {
  50:  '#FBF1ED',
  100: '#F5E0D7',
  200: '#EAC1B0',
  300: '#DE9C82',
  400: '#CF7A58',
  500: '#C0654A',
  600: '#B15738',   // accent — 4.9:1 on white
  700: '#93472E',
  800: '#763A26',
  900: '#5B2D1E',
  950: '#331810',
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Outfit', '"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        navy,
        terracotta,
        steel: {
          400: '#4E93AC',
          500: '#3A7F99',
          600: '#2F7A93',
          700: '#255F73',
        },
        sand: {
          DEFAULT: '#F7F6F3',   // page ground
          dark: '#EFEDE8',
          line: '#E4E1DB',      // hairline
        },

        /* Legacy brand scales, re-pointed so existing markup follows along. */
        govteal: terracotta,
        sidebar: {
          DEFAULT: '#14495F',
          dark: '#103C4E',
          darker: '#0A2836',
          light: '#1E5A76',
          hover: '#1E5A76',
          active: '#B15738',   // reads on white — icons, links, figures
          accent: '#E8A184',   // reads on navy — nav selection, rules
        },
      },

      borderRadius: {
        none: '0',
        sm: '3px',
        DEFAULT: '5px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '22px',
        full: '9999px',
      },

      boxShadow: {
        '2xs': '0 1px 0 rgba(20,73,95,0.04)',
        xs: '0 1px 2px rgba(20,73,95,0.05)',
        sm: '0 1px 3px rgba(20,73,95,0.07)',
        DEFAULT: '0 2px 6px rgba(20,73,95,0.08)',
        md: '0 4px 14px rgba(20,73,95,0.09)',
        lg: '0 10px 30px rgba(20,73,95,0.10)',
        xl: '0 20px 50px rgba(20,73,95,0.12)',
        '2xl': '0 30px 70px rgba(20,73,95,0.16)',
      },

      maxWidth: { shell: '1180px' },
      letterSpacing: { display: '-0.03em' },
    },
  },
  plugins: [],
}
