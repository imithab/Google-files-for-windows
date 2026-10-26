/**
 * Google Material Design 3 (M3) Design System Tokens
 * Reference: https://m3.material.io/
 *
 * Implements M3 color roles, tonal surfaces, typography scale,
 * elevation, corner shapes, and motion easing standards.
 */

export interface M3ColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;

  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  background: string;
  onBackground: string;

  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;

  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;

  outline: string;
  outlineVariant: string;

  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}

// Google Material 3 Default Baseline Schemes (Google Blue tone)
export const M3_LIGHT: M3ColorScheme = {
  primary: '#0b57d0',
  onPrimary: '#ffffff',
  primaryContainer: '#d3e3fd',
  onPrimaryContainer: '#041e49',

  secondary: '#00639b',
  onSecondary: '#ffffff',
  secondaryContainer: '#c2e7ff',
  onSecondaryContainer: '#001d35',

  tertiary: '#00875a',
  onTertiary: '#ffffff',
  tertiaryContainer: '#e6f4ea',
  onTertiaryContainer: '#0d652d',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#410002',

  background: '#f8fafd',
  onBackground: '#1f1f1f',

  surface: '#ffffff',
  onSurface: '#1f1f1f',
  surfaceVariant: '#e1e3e1',
  onSurfaceVariant: '#444746',

  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f6',
  surfaceContainer: '#edf2f7',
  surfaceContainerHigh: '#e7ecf2',
  surfaceContainerHighest: '#e1e6ed',

  outline: '#747775',
  outlineVariant: '#c4c7c5',

  inverseSurface: '#303030',
  inverseOnSurface: '#f2f2f2',
  inversePrimary: '#a8c7fa',
};

export const M3_DARK: M3ColorScheme = {
  primary: '#a8c7fa',
  onPrimary: '#042a66',
  primaryContainer: '#0842a0',
  onPrimaryContainer: '#d3e3fd',

  secondary: '#7fcfff',
  onSecondary: '#003355',
  secondaryContainer: '#004a77',
  onSecondaryContainer: '#c2e7ff',

  tertiary: '#81c995',
  onTertiary: '#003920',
  tertiaryContainer: '#0f522e',
  onTertiaryContainer: '#e6f4ea',

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  background: '#131314',
  onBackground: '#e3e3e3',

  surface: '#1e1f20',
  onSurface: '#e3e3e3',
  surfaceVariant: '#444746',
  onSurfaceVariant: '#c4c7c5',

  surfaceContainerLowest: '#0e0e0f',
  surfaceContainerLow: '#18191a',
  surfaceContainer: '#1e1f20',
  surfaceContainerHigh: '#282a2c',
  surfaceContainerHighest: '#333538',

  outline: '#8e918f',
  outlineVariant: '#444746',

  inverseSurface: '#e3e3e3',
  inverseOnSurface: '#1f1f1f',
  inversePrimary: '#0b57d0',
};

// Material 3 Typography Scale
export const M3_TYPOGRAPHY = {
  displayLarge: 'text-[57px] leading-[64px] font-normal tracking-[-0.25px]',
  displayMedium: 'text-[45px] leading-[52px] font-normal',
  displaySmall: 'text-[36px] leading-[44px] font-normal',

  headlineLarge: 'text-[32px] leading-[40px] font-medium',
  headlineMedium: 'text-[28px] leading-[36px] font-medium',
  headlineSmall: 'text-[24px] leading-[32px] font-medium',

  titleLarge: 'text-[22px] leading-[28px] font-medium',
  titleMedium: 'text-[16px] leading-[24px] font-medium tracking-[0.15px]',
  titleSmall: 'text-[14px] leading-[20px] font-medium tracking-[0.1px]',

  bodyLarge: 'text-[16px] leading-[24px] font-normal tracking-[0.5px]',
  bodyMedium: 'text-[14px] leading-[20px] font-normal tracking-[0.25px]',
  bodySmall: 'text-[12px] leading-[16px] font-normal tracking-[0.4px]',

  labelLarge: 'text-[14px] leading-[20px] font-medium tracking-[0.1px]',
  labelMedium: 'text-[12px] leading-[16px] font-medium tracking-[0.5px]',
  labelSmall: 'text-[11px] leading-[16px] font-medium tracking-[0.5px]',
};

// Material 3 Motion Curves (CSS bezier easing)
export const M3_MOTION = {
  emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
  standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  standardDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
  standardAccelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  durationShort: '150ms',
  durationMedium: '250ms',
  durationLong: '400ms',
};

// Material 3 Shape / Corner Tokens
export const M3_SHAPES = {
  none: 'rounded-none',
  extraSmall: 'rounded-[4px]',
  small: 'rounded-[8px]',
  medium: 'rounded-[12px]',
  large: 'rounded-[16px]',
  extraLarge: 'rounded-[28px]',
  full: 'rounded-full',
};

// Accent Palettes for user dynamic theme customization
export const ACCENT_PALETTES = {
  'google-blue': {
    primary: '#0b57d0',
    hover: '#0842a0',
    light: '#e8f0fe',
    text: '#041e49',
    border: '#aecbfa',
    darkPrimary: '#a8c7fa',
    darkLight: 'rgba(168, 199, 250, 0.16)',
    name: 'Google Blue',
  },
  emerald: {
    primary: '#00875a',
    hover: '#00754e',
    light: '#e6f4ea',
    text: '#0d652d',
    border: '#a8dab5',
    darkPrimary: '#81c995',
    darkLight: 'rgba(129, 201, 149, 0.16)',
    name: 'Forest Green',
  },
  coral: {
    primary: '#d93025',
    hover: '#b3261e',
    light: '#fce8e6',
    text: '#a50e0e',
    border: '#f6aea9',
    darkPrimary: '#f28b82',
    darkLight: 'rgba(242, 139, 130, 0.16)',
    name: 'Coral Red',
  },
  amber: {
    primary: '#e37400',
    hover: '#b05a00',
    light: '#fef7e0',
    text: '#8c4500',
    border: '#fdd663',
    darkPrimary: '#fdd663',
    darkLight: 'rgba(253, 214, 99, 0.16)',
    name: 'Warm Amber',
  },
  purple: {
    primary: '#9334e6',
    hover: '#7924c7',
    light: '#f3e8fd',
    text: '#681da8',
    border: '#d7aefb',
    darkPrimary: '#c58af9',
    darkLight: 'rgba(197, 138, 249, 0.16)',
    name: 'Royal Purple',
  },
};

// Google Files Android Signature Categorization Palette
export const CATEGORY_COLORS = {
  photo: {
    bg: '#fce8e6',
    text: '#c5221f',
    icon: '#ea4335',
    darkBg: 'rgba(234, 67, 53, 0.16)',
    darkText: '#f28b82',
    label: 'Photos',
  },
  video: {
    bg: '#fef7e0',
    text: '#b06000',
    icon: '#f29900',
    darkBg: 'rgba(242, 153, 0, 0.16)',
    darkText: '#fdd663',
    label: 'Videos',
  },
  audio: {
    bg: '#e6f4ea',
    text: '#137333',
    icon: '#0f9d58',
    darkBg: 'rgba(15, 157, 88, 0.16)',
    darkText: '#81c995',
    label: 'Audio & Music',
  },
  document: {
    bg: '#e8f0fe',
    text: '#185abc',
    icon: '#1a73e8',
    darkBg: 'rgba(26, 115, 232, 0.16)',
    darkText: '#8ab4f8',
    label: 'Documents',
  },
  archive: {
    bg: '#f3e8fd',
    text: '#7627bb',
    icon: '#a142f4',
    darkBg: 'rgba(161, 66, 244, 0.16)',
    darkText: '#c58af9',
    label: 'Archives',
  },
  code: {
    bg: '#e0f2fe',
    text: '#0369a1',
    icon: '#0284c7',
    darkBg: 'rgba(2, 132, 199, 0.16)',
    darkText: '#7dd3fc',
    label: 'Code & Dev',
  },
  application: {
    bg: '#f1f5f9',
    text: '#334155',
    icon: '#64748b',
    darkBg: 'rgba(100, 116, 139, 0.16)',
    darkText: '#cbd5e1',
    label: 'Apps',
  },
  other: {
    bg: '#f1f3f4',
    text: '#5f6368',
    icon: '#80868b',
    darkBg: 'rgba(128, 134, 139, 0.16)',
    darkText: '#bdc1c6',
    label: 'Other',
  },
};
