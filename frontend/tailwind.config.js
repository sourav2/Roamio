/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Roamio Design System Color Tokens
        roamio: {
          bg: {
            DEFAULT: '#FFFFFF',
            app: '#FFFFFF',
            card: '#FFFFFF',
            secondary: '#F8F6F0',
          },
          text: {
            primary: '#1C2420',
            secondary: '#5B6660',
            tertiary: '#949494',
            disabled: '#BDBDBD',
            inverse: '#F8F6F0',
          },
          border: {
            light: '#DEDEDE',
            DEFAULT: '#C0C0C0',
            default: '#C0C0C0',
            strong: '#B5B5B5',
          },
          divider: '#E5E7EB',
          semantic: {
            success: '#2F9E6F',
            warning: '#F59E0B',
            danger: '#DC2626',
            info: '#3C9CA8',
            'success-bg': '#EFFAF5',
            'warning-bg': '#FFF8EB',
            'danger-bg': '#FEF2F2',
            'info-bg': '#EEF8FA',
          },
          primary: {
            accent: '#164A3A',
            hover: '#0E3227',
          },
          'btn-light': {
            DEFAULT: '#46B392',
            hover: '#3AA182',
          },
          'light-button': {
            DEFAULT: '#46B392',
            hover: '#3AA182',
          },
          accent: {
            secondary: '#EBBA58',
            'secondary-10': ({ opacityValue }) => 'rgb(235 186 88 / 0.1)',
            'secondary-50': 'rgba(235, 186, 88, 0.50)',
            'secondary-light': ({ opacityValue }) => 'rgb(235 186 88 / 0.1)',
          },
        },

        // Legacy SoraPath Theme Colors (Preserved for compatibility)
        brand: {
          green: '#16A34A',
          dark: '#111111',
          text: '#111827',
          muted: '#6B7280',
          softBg: '#F8FAF8',
          borders: '#E5E7EB',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
        travel: {
          bg: {
            white: '#FFFFFF',
            soft: '#F8FAF8',
            gray: '#FAFAFA'
          },
          text: {
            primary: '#111827',
            secondary: '#1F2937',
            muted: '#6B7280'
          },
          button: {
            dark: '#111111',
            darkHover: '#1F2937',
            blue: '#16A34A',
            blueHover: '#15803D'
          },
          accent: {
            blue: '#E8F5E9',
            green: '#E8F5E9',
            warm: '#F0FDF4',
            gray: '#E5E7EB'
          }
        }
      },

      fontFamily: {
        // Roamio Font Families
        'roamio-display': ['Fraunces', 'Georgia', 'serif'],
        'roamio-body': ['Inter', 'sans-serif'],

        // Existing / Fallback Font Families
        sans: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
      },

      fontSize: {
        // Roamio Headings
        'roamio-h1': ['64px', { lineHeight: '80px', letterSpacing: '0px', fontWeight: '400' }],
        'roamio-h2': ['40px', { lineHeight: '52px', letterSpacing: '0px', fontWeight: '600' }],
        'roamio-h3': ['32px', { lineHeight: '42px', letterSpacing: '0px', fontWeight: '600' }],
        'roamio-h4': ['24px', { lineHeight: '32px', letterSpacing: '0px', fontWeight: '600' }],
        'roamio-h5': ['20px', { lineHeight: '28px', letterSpacing: '0px', fontWeight: '600' }],
        'roamio-h6': ['16px', { lineHeight: '24px', letterSpacing: '0px', fontWeight: '600' }],

        // Roamio Body / UI Tokens
        'roamio-body-lg': ['18px', { lineHeight: '24px', letterSpacing: '0px', fontWeight: '400' }],
        'roamio-body-lg-semibold': ['18px', { lineHeight: '24px', letterSpacing: '0px', fontWeight: '600' }],
        'roamio-body-md': ['16px', { lineHeight: '22px', letterSpacing: '0px', fontWeight: '400' }],
        'roamio-label-btn': ['16px', { lineHeight: '22px', letterSpacing: '0px', fontWeight: '500' }],
        'roamio-body-md-medium': ['16px', { lineHeight: '22px', letterSpacing: '0px', fontWeight: '500' }],
        'roamio-body-sm': ['14px', { lineHeight: '20px', letterSpacing: '0px', fontWeight: '400' }],
        'roamio-body-sm-medium': ['14px', { lineHeight: '20px', letterSpacing: '0px', fontWeight: '500' }],
        'roamio-body-xs': ['12px', { lineHeight: '16px', letterSpacing: '0px', fontWeight: '500' }],
        'roamio-caption-sm': ['10px', { lineHeight: '16px', letterSpacing: '0px', fontWeight: '400' }],
      },

      spacing: {
        // Roamio Spacing Scale
        'roamio-0': '0px',
        'roamio-1': '4px',
        'roamio-2': '8px',
        'roamio-3': '12px',
        'roamio-4': '16px',
        'roamio-5': '20px',
        'roamio-6': '24px',
        'roamio-7': '32px',
        'roamio-8': '40px',
        'roamio-9': '48px',
        'roamio-10': '64px',
      },

      borderRadius: {
        // Roamio Radius Scale
        'roamio-none': '0px',
        'roamio-1': '4px',
        'roamio-2': '8px',
        'roamio-3': '12px',
        'roamio-4': '16px',
        'roamio-full': '9999px',
      },

      borderWidth: {
        // Roamio Stroke / Border Width
        'roamio-0': '0px',
        'roamio-1': '1px',
        'roamio-2': '2px',
        'roamio-default': '1px',
      },

      boxShadow: {
        // Roamio Drop Shadow Elevation
        'roamio-sm': '0px 1px 3px 0px rgba(17, 24, 39, 0.08)',
        'roamio-md': '0px 4px 12px 0px rgba(17, 24, 39, 0.08)',
        'roamio-lg': '0px 8px 24px 0px rgba(17, 24, 39, 0.12)',
        'roamio-xl': '0px 20px 40px 0px rgba(17, 24, 39, 0.16)',
        'roamio-zero': '0px 0px 0px 0px rgba(27, 28, 29, 0)',

        // Existing Shadows
        'premium': '0px 14px 18px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0px 18px 24px rgba(0, 0, 0, 0.08)',
      },

      gridTemplateColumns: {
        // Roamio 12-column Desktop Grid
        'roamio-12': 'repeat(12, minmax(0, 1fr))',
      },

      scale: {
        '102': '1.02',
      },

      transitionProperty: {
        'premium': 'transform, box-shadow',
      }
    },
  },
  plugins: [],
}
