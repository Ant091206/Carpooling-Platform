/**
 * Route Optimizer & AI Smart Matching Engine
 */

/**
 * Calculate Haversine distance between two coordinates in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2)); // distance in km
}

/**
 * Calculate AI Match Score out of 100 according to exact weightage specification:
 * - Route Similarity:    40%
 * - Pickup Distance:     20%
 * - Destination Distance: 15%
 * - Time Difference:     15%
 * - Driver Rating:        5%
 * - Passenger Rating:     5%
 */
export function calculateMatchScore({
  pickupDistanceKm,
  destinationDistanceKm,
  timeDifferenceMinutes,
  maxDetourKm = 10,
  maxWaitMins = 45,
  driverRating = 4.5,
  passengerRating = 4.5,
}) {
  // 1. Pickup Distance Score (max 20)
  const pickupScore = Math.max(0, 20 * (1 - Math.min(pickupDistanceKm, maxDetourKm) / maxDetourKm));

  // 2. Destination Distance Score (max 15)
  const destScore = Math.max(0, 15 * (1 - Math.min(destinationDistanceKm, maxDetourKm) / maxDetourKm));

  // 3. Route Similarity Score (max 40)
  const avgDist = (pickupDistanceKm + destinationDistanceKm) / 2;
  const routeSimilarityScore = Math.max(0, 40 * (1 - Math.min(avgDist, maxDetourKm) / maxDetourKm));

  // 4. Time Difference Score (max 15)
  const timeScore = Math.max(0, 15 * (1 - Math.min(Math.abs(timeDifferenceMinutes), maxWaitMins) / maxWaitMins));

  // 5. Driver Rating Score (max 5)
  const driverRatingScore = (Math.min(5, Math.max(1, driverRating)) / 5) * 5;

  // 6. Passenger Rating Score (max 5)
  const passengerRatingScore = (Math.min(5, Math.max(1, passengerRating)) / 5) * 5;

  const totalScore = Math.min(
    100,
    parseFloat((pickupScore + destScore + routeSimilarityScore + timeScore + driverRatingScore + passengerRatingScore).toFixed(1))
  );

  return {
    totalScore,
    breakdown: {
      routeSimilarity: parseFloat(routeSimilarityScore.toFixed(1)),
      pickupDistance: parseFloat(pickupScore.toFixed(1)),
      destinationDistance: parseFloat(destScore.toFixed(1)),
      timeDifference: parseFloat(timeScore.toFixed(1)),
      driverRating: parseFloat(driverRatingScore.toFixed(1)),
      passengerRating: parseFloat(passengerRatingScore.toFixed(1)),
    },
  };
}

/**
 * Calculate Environmental & Economic Optimization Metrics
 */
export function calculateOptimizationMetrics(distanceKm, farePerSeat) {
  const dist = parseFloat(distanceKm) || 12;
  const fare = parseFloat(farePerSeat) || 50;

  // Fuel saved in liters (approx 0.08L per km for standard vehicle)
  const fuelSavedLiters = parseFloat((dist * 0.08).toFixed(2));

  // CO2 saved in kg (2.31 kg CO2 per liter of gasoline)
  const co2SavedKg = parseFloat((fuelSavedLiters * 2.31).toFixed(2));

  // Estimated time saved vs public transit (approx 1.2 minutes saved per km)
  const timeSavedMinutes = Math.round(dist * 1.2) + 5;

  // Estimated monthly savings (assuming 22 work days * 2 rides/day)
  const monthlySavingsRupees = Math.round(fare * 44 * 0.4); // 40% cost saving

  return {
    fuelSavedLiters,
    co2SavedKg,
    timeSavedMinutes,
    monthlySavingsRupees,
  };
}

/**
 * Generate AI Smart Recommendations for optimal pickup/drop locations
 */
export function generateSmartSuggestions(pickupName, destinationName, pickupDistKm, destDistKm) {
  const suggestions = [];

  if (pickupDistKm > 0.5) {
    suggestions.push({
      type: 'PICKUP_POINT',
      title: 'Optimal Pickup Adjustment',
      description: `Meeting near ${pickupName} main entrance saves ~${Math.round(pickupDistKm * 3)} mins of driver detour time.`,
    });
  }

  if (destDistKm > 0.5) {
    suggestions.push({
      type: 'DROP_POINT',
      title: 'Optimal Drop Adjustment',
      description: `Dropping off at ${destinationName} metro junction reduces overall trip duration.`,
    });
  }

  return suggestions;
}
