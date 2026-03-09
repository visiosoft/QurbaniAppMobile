import { Coordinates, CalculationMethod, PrayerTimes, Prayer, Madhab } from 'adhan';

/**
 * Prayer Service
 * Handles all prayer time calculations using adhan-js library
 */

/**
 * Available calculation methods
 */
export const CALCULATION_METHODS = {
    MUSLIM_WORLD_LEAGUE: 'MuslimWorldLeague',
    UMM_AL_QURA: 'UmmAlQura',
    KARACHI: 'Karachi',
    EGYPTIAN: 'Egyptian',
    DUBAI: 'Dubai',
    NORTH_AMERICA: 'NorthAmerica',
};

/**
 * Calculation method labels for UI
 */
export const CALCULATION_METHOD_LABELS = {
    [CALCULATION_METHODS.MUSLIM_WORLD_LEAGUE]: 'Muslim World League',
    [CALCULATION_METHODS.UMM_AL_QURA]: 'Umm Al-Qura',
    [CALCULATION_METHODS.KARACHI]: 'Karachi',
    [CALCULATION_METHODS.EGYPTIAN]: 'Egyptian',
    [CALCULATION_METHODS.DUBAI]: 'Dubai',
    [CALCULATION_METHODS.NORTH_AMERICA]: 'North America',
};

/**
 * Madhab options
 */
export const MADHABS = {
    HANAFI: 'Hanafi',
    SHAFI: 'Shafi',
};

/**
 * Prayer names
 */
export const PRAYER_NAMES = {
    FAJR: 'fajr',
    SUNRISE: 'sunrise',
    DHUHR: 'dhuhr',
    ASR: 'asr',
    MAGHRIB: 'maghrib',
    ISHA: 'isha',
};

/**
 * Get calculation parameters based on method name
 */
function getCalculationParams(methodName) {
    switch (methodName) {
        case CALCULATION_METHODS.UMM_AL_QURA:
            return CalculationMethod.UmmAlQura();
        case CALCULATION_METHODS.KARACHI:
            return CalculationMethod.Karachi();
        case CALCULATION_METHODS.EGYPTIAN:
            return CalculationMethod.Egyptian();
        case CALCULATION_METHODS.DUBAI:
            return CalculationMethod.Dubai();
        case CALCULATION_METHODS.NORTH_AMERICA:
            return CalculationMethod.NorthAmerica();
        case CALCULATION_METHODS.MUSLIM_WORLD_LEAGUE:
        default:
            return CalculationMethod.MuslimWorldLeague();
    }
}

/**
 * Calculate prayer times for a given location and date
 * 
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {Date} date - Date to calculate prayer times for
 * @param {string} calculationMethodName - Calculation method name
 * @param {string} madhabName - Madhab name (Hanafi or Shafi)
 * @returns {Object} Prayer times object
 */
export function calculatePrayerTimes(
    latitude,
    longitude,
    date = new Date(),
    calculationMethodName = CALCULATION_METHODS.MUSLIM_WORLD_LEAGUE,
    madhabName = MADHABS.SHAFI
) {
    try {
        // Create coordinates
        const coordinates = new Coordinates(latitude, longitude);

        // Get calculation parameters
        const params = getCalculationParams(calculationMethodName);

        // Set madhab
        params.madhab = madhabName === MADHABS.HANAFI ? Madhab.Hanafi : Madhab.Shafi;

        // Calculate prayer times
        const prayerTimes = new PrayerTimes(coordinates, date, params);

        return {
            fajr: prayerTimes.fajr,
            sunrise: prayerTimes.sunrise,
            dhuhr: prayerTimes.dhuhr,
            asr: prayerTimes.asr,
            maghrib: prayerTimes.maghrib,
            isha: prayerTimes.isha,
            date: date,
        };
    } catch (error) {
        console.error('Error calculating prayer times:', error);
        throw error;
    }
}

/**
 * Get current prayer name
 * 
 * @param {Object} prayerTimes - Prayer times object
 * @returns {string|null} Current prayer name
 */
export function getCurrentPrayer(prayerTimes) {
    try {
        const coordinates = new Coordinates(0, 0); // Dummy coordinates
        const params = CalculationMethod.MuslimWorldLeague();
        const times = new PrayerTimes(coordinates, prayerTimes.date, params);
        
        const currentPrayer = times.currentPrayer();
        return currentPrayer ? currentPrayer.toLowerCase() : null;
    } catch (error) {
        // Fallback: manual calculation
        const now = new Date();
        
        if (now < prayerTimes.fajr) return null;
        if (now < prayerTimes.sunrise) return PRAYER_NAMES.FAJR;
        if (now < prayerTimes.dhuhr) return PRAYER_NAMES.SUNRISE;
        if (now < prayerTimes.asr) return PRAYER_NAMES.DHUHR;
        if (now < prayerTimes.maghrib) return PRAYER_NAMES.ASR;
        if (now < prayerTimes.isha) return PRAYER_NAMES.MAGHRIB;
        return PRAYER_NAMES.ISHA;
    }
}

/**
 * Get next prayer name and time
 * 
 * @param {Object} prayerTimes - Prayer times object
 * @returns {Object} Next prayer info { name, time }
 */
export function getNextPrayer(prayerTimes) {
    const now = new Date();
    
    const prayers = [
        { name: PRAYER_NAMES.FAJR, time: prayerTimes.fajr },
        { name: PRAYER_NAMES.SUNRISE, time: prayerTimes.sunrise },
        { name: PRAYER_NAMES.DHUHR, time: prayerTimes.dhuhr },
        { name: PRAYER_NAMES.ASR, time: prayerTimes.asr },
        { name: PRAYER_NAMES.MAGHRIB, time: prayerTimes.maghrib },
        { name: PRAYER_NAMES.ISHA, time: prayerTimes.isha },
    ];
    
    for (const prayer of prayers) {
        if (now < prayer.time) {
            return prayer;
        }
    }
    
    // If all prayers passed, return tomorrow's Fajr
    return { name: PRAYER_NAMES.FAJR, time: null };
}

/**
 * Get time remaining until next prayer
 * 
 * @param {Date} nextPrayerTime - Next prayer time
 * @returns {string} Formatted time remaining (HH:MM:SS)
 */
export function getTimeRemaining(nextPrayerTime) {
    if (!nextPrayerTime) return '00:00:00';
    
    const now = new Date();
    const diff = nextPrayerTime - now;
    
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format time to 12-hour format
 * 
 * @param {Date} date - Date object
 * @returns {string} Formatted time (HH:MM AM/PM)
 */
export function formatTime(date) {
    if (!date) return '--:--';
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
}

/**
 * Get Islamic date (simplified - you may want to use a proper Hijri calendar library)
 * This is a basic approximation
 */
export function getIslamicDate() {
    // This is a simplified version. For accurate Hijri dates, use a library like moment-hijri
    const gregorianDate = new Date();
    const dayOfYear = Math.floor((gregorianDate - new Date(gregorianDate.getFullYear(), 0, 0)) / 86400000);
    
    // Very rough approximation - NOT ACCURATE
    // Use a proper Hijri library for production
    const hijriMonths = [
        'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
        'Ramadan', 'Shawwal', 'Dhul-Qi\'dah', 'Dhul-Hijjah'
    ];
    
    // Approximate Hijri year (578 years behind Gregorian)
    const approximateHijriYear = gregorianDate.getFullYear() - 578;
    const approximateMonth = Math.floor((dayOfYear / 365) * 12);
    const approximateDay = Math.floor((dayOfYear % 30.5) + 1);
    
    return `${approximateDay} ${hijriMonths[approximateMonth]} ${approximateHijriYear} AH`;
}

export default {
    calculatePrayerTimes,
    getCurrentPrayer,
    getNextPrayer,
    getTimeRemaining,
    formatTime,
    getIslamicDate,
    CALCULATION_METHODS,
    CALCULATION_METHOD_LABELS,
    MADHABS,
    PRAYER_NAMES,
};
