import { differenceInDays, parseISO, isAfter, startOfDay } from 'date-fns';

export const FreshnessStatus = {
    FRESH: 'Fresh',
    ACCEPTABLE: 'Acceptable',
    EXPIRED: 'Expired',
};

export class FreshnessService {
    static calculateFreshnessPercentage(arrivalDate, maxFreshDays) {
        if (!arrivalDate || maxFreshDays <= 0) {
            return 0;
        }

        const today = startOfDay(new Date());
        const arrival = parseISO(arrivalDate);

        if (isAfter(arrival, today)) {
            return 100;
        }

        const daysPassed = differenceInDays(today, arrival);

        if (daysPassed >= maxFreshDays) {
            return 0;
        }

        const percentage = 100.0 * (1.0 - (daysPassed / maxFreshDays));
        return Math.max(0, Math.min(100, Math.round(percentage)));
    }

    static getFreshnessStatus(percentage) {
        if (percentage >= 70) {
            return FreshnessStatus.FRESH;
        } else if (percentage >= 40) {
            return FreshnessStatus.ACCEPTABLE;
        } else {
            return FreshnessStatus.EXPIRED;
        }
    }

    static getFreshnessLabel(arrivalDate, maxFreshDays) {
        const percentage = this.calculateFreshnessPercentage(arrivalDate, maxFreshDays);
        const status = this.getFreshnessStatus(percentage);
        return `${status} (${percentage}%)`;
    }
}
