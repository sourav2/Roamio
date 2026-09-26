/**
 * Roamio Design System Tokens (JavaScript Definition)
 * 
 * Source of truth for programmatic access across components and themes.
 * Do not invent, substitute, normalize, or change any of the values.
 */

export const roamioTokens = {
  colors: {
    background: {
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
    borders: {
      light: '#DEDEDE',
      default: '#C0C0C0',
      strong: '#8f8f8fff',
      divider: '#E5E7EB',
    },
    semantic: {
      success: '#2F9E6F',
      warning: '#F59E0B',
      danger: '#DC2626',
      info: '#3C9CA8',
      successBg: '#EFFAF5',
      warningBg: '#FFF8EB',
      dangerBg: '#FEF2F2',
      infoBg: '#EEF8FA',
    },
    primary: {
      accent: '#176B53',
      accentHover: '#00513D',
    },
    lightButton: {
      default: '#46B392',
      hover: '#3AA182',
    },
    accentSecondary: {
      default: '#EBBA58',
      variant10: 'rgba(235, 186, 88, 0.10)',
      variant50: 'rgba(235, 186, 88, 0.50)',
      light: 'rgba(235, 186, 88, 0.10)',
    },
  },

  typography: {
    fontFamilies: {
      display: 'Fraunces',
      body: 'Inter',
    },
    headings: {
      h1: {
        fontFamily: 'Fraunces',
        fontSize: '64px',
        lineHeight: '80px',
        letterSpacing: '0px',
        fontWeight: 700,
      },
      h2: {
        fontFamily: 'Fraunces',
        fontSize: '40px',
        lineHeight: '52px',
        letterSpacing: '0px',
        fontWeight: 600,
      },
      h3: {
        fontFamily: 'Fraunces',
        fontSize: '32px',
        lineHeight: '42px',
        letterSpacing: '0px',
        fontWeight: 600,
      },
      h4: {
        fontFamily: 'Inter',
        fontSize: '24px',
        lineHeight: '32px',
        letterSpacing: '0px',
        fontWeight: 600,
      },
      h5: {
        fontFamily: 'Inter',
        fontSize: '20px',
        lineHeight: '28px',
        letterSpacing: '0px',
        fontWeight: 600,
      },
      h6: {
        fontFamily: 'Inter',
        fontSize: '16px',
        lineHeight: '24px',
        letterSpacing: '0px',
        fontWeight: 600,
      },
    },
    body: {
      large: {
        fontFamily: 'Inter',
        fontSize: '18px',
        lineHeight: '24px',
        letterSpacing: '0px',
        fontWeight: 400,
      },
      largeSemibold: {
        fontFamily: 'Inter',
        fontSize: '18px',
        lineHeight: '24px',
        letterSpacing: '0px',
        fontWeight: 600,
      },
      md: {
        fontFamily: 'Inter',
        fontSize: '16px',
        lineHeight: '22px',
        letterSpacing: '0px',
        fontWeight: 400,
      },
      labelButton: {
        fontFamily: 'Inter',
        fontSize: '16px',
        lineHeight: '22px',
        letterSpacing: '0px',
        fontWeight: 500,
      },
      mdMedium: {
        fontFamily: 'Inter',
        fontSize: '16px',
        lineHeight: '22px',
        letterSpacing: '0px',
        fontWeight: 500,
      },
      sm: {
        fontFamily: 'Inter',
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '0px',
        fontWeight: 400,
      },
      smMedium: {
        fontFamily: 'Inter',
        fontSize: '14px',
        lineHeight: '20px',
        letterSpacing: '0px',
        fontWeight: 500,
      },
      xs: {
        fontFamily: 'Inter',
        fontSize: '12px',
        lineHeight: '16px',
        letterSpacing: '0px',
        fontWeight: 500,
      },
      captionSmall: {
        fontFamily: 'Inter',
        fontSize: '10px',
        lineHeight: '16px',
        letterSpacing: '0px',
        fontWeight: 400,
      },
    },
  },

  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '32px',
    8: '40px',
    9: '48px',
    10: '64px',
  },

  radius: {
    none: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    full: '9999px',
  },

  effects: {
    small: {
      x: '0px',
      y: '1px',
      blur: '3px',
      spread: '0px',
      color: '#111827',
      opacity: '8%',
      css: '0px 1px 3px 0px rgba(17, 24, 39, 0.08)',
    },
    medium: {
      x: '0px',
      y: '4px',
      blur: '12px',
      spread: '0px',
      color: '#111827',
      opacity: '8%',
      css: '0px 4px 12px 0px rgba(17, 24, 39, 0.08)',
    },
    large: {
      x: '0px',
      y: '8px',
      blur: '24px',
      spread: '0px',
      color: '#111827',
      opacity: '12%',
      css: '0px 8px 24px 0px rgba(17, 24, 39, 0.12)',
    },
    extraLarge: {
      x: '0px',
      y: '20px',
      blur: '40px',
      spread: '0px',
      color: '#111827',
      opacity: '16%',
      css: '0px 20px 40px 0px rgba(17, 24, 39, 0.16)',
    },
    zero: {
      x: '0px',
      y: '0px',
      blur: '0px',
      spread: '0px',
      color: '#1B1C1D',
      opacity: '0%',
      css: '0px 0px 0px 0px rgba(27, 28, 29, 0)',
    },
    sunken: null, // NOT SPECIFIED YET
    glow: null, // NOT SPECIFIED YET
    placeholder: null, // NOT SPECIFIED YET
  },

  stroke: {
    0: '0px',
    1: '1px',
    2: '2px',
    default: '1px',
  },

  desktopGrid: {
    columns: 12,
    margins: '16px',
    gutter: '16px',
  },
};

export default roamioTokens;
