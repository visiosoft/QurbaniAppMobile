export const COLORS = {
    // Primary colors
    primary: '#1B5E20',
    primaryLight: '#4CAF50',
    primaryDark: '#0D3C15',

    // Status colors
    pending: '#FF9800',
    ready: '#f32121',
    done: '#4CAF50',

    // UI colors
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',

    // Text colors
    textPrimary: '#212121',
    textSecondary: '#757575',
    textLight: '#FFFFFF',

    // Border colors
    border: '#E0E0E0',
    divider: '#BDBDBD',
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const FONT_SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
};

export const BORDER_RADIUS = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 999,
};

// Qurbani Types
export const QURBANI_TYPES = {
    SHEEP: 'sheep',
    COW: 'cow',
    CAMEL: 'camel',
};

// Maximum members allowed per animal type
export const MAX_MEMBERS_PER_ANIMAL = {
    [QURBANI_TYPES.SHEEP]: 1,
    [QURBANI_TYPES.COW]: 5,
    [QURBANI_TYPES.CAMEL]: 7,
};

// Account Types
export const ACCOUNT_TYPES = {
    INDIVIDUAL: 'individual',
    GROUP: 'group',
};

// Status Types
export const STATUS_TYPES = {
    PENDING: 'pending',
    READY: 'ready',
    DONE: 'done',
};

// Status display names
export const STATUS_LABELS = {
    [STATUS_TYPES.PENDING]: 'Pending',
    [STATUS_TYPES.READY]: 'Ready',
    [STATUS_TYPES.DONE]: 'Done',
};

// Qurbani type display names
export const QURBANI_TYPE_LABELS = {
    [QURBANI_TYPES.SHEEP]: 'Sheep',
    [QURBANI_TYPES.COW]: 'Cow',
    [QURBANI_TYPES.CAMEL]: 'Camel',
};
