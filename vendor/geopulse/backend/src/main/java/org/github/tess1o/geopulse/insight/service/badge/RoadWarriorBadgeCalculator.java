package org.github.tess1o.geopulse.insight.service.badge;

import jakarta.enterprise.context.ApplicationScoped;
import org.github.tess1o.geopulse.insight.model.Badge;

import java.util.UUID;

@ApplicationScoped
public class RoadWarriorBadgeCalculator implements BadgeCalculator {

    private static final int TOTAL_DISTANCE_THRESHOLD_KM = 1000; // 1,000 km
    private static final String TITLE = "Road Warrior";

    private final TotalDistanceBadgeCalculator totalDistanceBadgeCalculator;

    public RoadWarriorBadgeCalculator(TotalDistanceBadgeCalculator totalDistanceBadgeCalculator) {
        this.totalDistanceBadgeCalculator = totalDistanceBadgeCalculator;
    }

    @Override
    public String getBadgeId() {
        return "total_distance_1000";
    }

    @Override
    public Badge calculateBadge(UUID userId) {
        return totalDistanceBadgeCalculator.calculateTotalDistanceBadge(
                userId, getBadgeId(), TITLE, "🚗", TOTAL_DISTANCE_THRESHOLD_KM, "Travel 1,000+ km total");
    }
}
