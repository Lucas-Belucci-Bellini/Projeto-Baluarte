package org.github.tess1o.geopulse.insight.service.badge;

import jakarta.enterprise.context.ApplicationScoped;
import org.github.tess1o.geopulse.insight.model.Badge;

import java.util.UUID;

@ApplicationScoped
public class NightOwlBadgeCalculator implements BadgeCalculator {

    private static final String TITLE = "Night Owl";

    private final TimeOfDayBadgeCalculator timeOfDayBadgeCalculator;

    public NightOwlBadgeCalculator(TimeOfDayBadgeCalculator timeOfDayBadgeCalculator) {
        this.timeOfDayBadgeCalculator = timeOfDayBadgeCalculator;
    }

    @Override
    public String getBadgeId() {
        return "time_of_day_night_owl";
    }

    @Override
    public Badge calculateBadge(UUID userId) {
        return timeOfDayBadgeCalculator.calculateTimeOfDayBadge(
                userId, getBadgeId(), TITLE, "🦉", ">= 22", "Start a trip after 10:00 PM");
    }
}
