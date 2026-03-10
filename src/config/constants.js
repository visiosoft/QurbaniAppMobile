export const COLORS = {
    // Primary colors - Islamic Gold & Green Theme (Apple-style)
    primary: '#2E7D32',
    primaryLight: '#4CAF50',
    primaryDark: '#1B5E20',
    gold: '#C9A961',
    goldDark: '#B89952',

    // Status colors
    pending: '#FF9800',
    ready: '#C9A961',
    done: '#4CAF50',

    // UI colors - Apple-style
    background: '#F9F9F9',
    surface: '#FFFFFF',
    error: '#FF3B30',
    warning: '#FF9500',
    success: '#34C759',
    info: '#007AFF',

    // Text colors - Apple SF
    textPrimary: '#1C1C1E',
    textSecondary: '#8E8E93',
    textLight: '#FFFFFF',

    // Border colors - Apple-style
    border: '#E5E5EA',
    divider: '#C6C6C8',
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
    SHEEP: 'Sheep',
    COW: 'Cow',
    CAMEL: 'Camel',
};

// Maximum members allowed per animal type
export const MAX_MEMBERS_PER_ANIMAL = {
    'Sheep': 3,
    'Cow': 7,
    'Camel': 7,
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
    [STATUS_TYPES.READY]: 'Requested for Qurbani',
    [STATUS_TYPES.DONE]: 'Qurbani Completed',
};

// Qurbani type display names
export const QURBANI_TYPE_LABELS = {
    'Sheep': 'Sheep',
    'Cow': 'Cow',
    'Camel': 'Camel',
};
