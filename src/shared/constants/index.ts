export const APP_NAME = 'Personal Blaze';
export const APP_VERSION = '0.1.0';
export const DEFAULT_SERVER_PORT = 9876;
export const DEFAULT_GLOBAL_SHORTCUT = 'CommandOrControl+Shift+/';

export const DATABASE_NAME = 'personal_blaze.db';
export const USER_DATA_DIR = '.personal_blaze';

export const API_ENDPOINTS = {
  SNIPPETS: '/api/snippets',
  FOLDERS: '/api/folders',
  IMAGES: '/api/images',
  EXPAND: '/api/expand',
  SETTINGS: '/api/settings',
} as const;

export const SNIPPET_TRIGGERS = {
  PREFIX: '/',
  DELIMITER: ' ',
} as const;

export const IMAGE_SETTINGS = {
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  SUPPORTED_FORMATS: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
} as const;