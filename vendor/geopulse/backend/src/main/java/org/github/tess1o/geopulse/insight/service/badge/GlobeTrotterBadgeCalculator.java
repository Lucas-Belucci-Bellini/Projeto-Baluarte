package org.github.tess1o.geopulse.insight.service.badge;

import jakarta.enterprise.context.ApplicationScoped;
import org.github.tess1o.geopulse.insight.model.Badge;

import java.util.UUID;

@ApplicationScoped
public class GlobeTrotterBadgeCalculator implements BadgeCalculator {

    private static final int CITIES_THRESHOLD = 10;
    private static final String TITLE = "Globe Trotter";

    private final CitiesBadgeCalculator citiesBadgeCalculator;

    public GlobeTrotterBadgeCalculator(CitiesBadgeCalculator citiesBadgeCalculator) {
        this.citiesBadgeCalculator = citiesBadgeCalculator;
    }

    @Override
    public String getBadgeId() {
        return "cites_visited_10";
    }

    @Override
    public Badge calculateBadge(UUID userId) {
        return citiesBadgeCalculator.calculateCitiesBadge(userId, getBadgeId(), TITLE, "🌍", CITIES_THRESHOLD);
    }
}
