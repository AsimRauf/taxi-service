import { FixedPrice, PriceResult } from '@/types/pricing';
import { fixedRoutes } from '@/data/fixedPrice';
import { findCanonicalName } from '@/data/placeAliases';

// Update price constants
const STATION_WAGON_PRICE_PER_KM = 1.50;  // €3 per km for station wagon
const BUS_PRICE_PER_KM = 1.75;            // €5 per km for bus
const MINIMUM_PRICE = 1.0;              // Minimum price of €15 for any ride

export const determineVehicleAvailability = (
    passengers: number,
    luggageData: {
        regularLuggage: { 
            large: number; 
            small: number; 
            handLuggage: number;
        };
        specialLuggage: Record<string, number>;
    }
) => {
    console.log('🚗 Checking vehicle availability:', { passengers, luggageData });

    const { regularLuggage, specialLuggage } = luggageData;
    const totalLarge = regularLuggage.large;
    const totalSmall = regularLuggage.small;
    const totalHandLuggage = regularLuggage.handLuggage;
    const totalSpecialItems = Object.values(specialLuggage).reduce((sum, val) => sum + val, 0);

    const result = {
        stationWagon: true,
        bus: true
    };

    // Station Wagon limitations
    if (
        passengers > 4 ||
        totalLarge > 4 ||
        totalSmall > 4 ||
        (totalLarge + totalSmall > 4) ||
        totalSpecialItems > 1
    ) {
        result.stationWagon = false;
    }

    // Bus limitations
    if (
        passengers > 8 ||
        totalLarge > 8 ||
        totalSmall > 11 ||
        totalHandLuggage > 8 ||
        totalSpecialItems > 3
    ) {
        result.bus = false;
    }

    console.log('✅ Vehicle availability result:', result);
    return result;
};


const extractMainLocation = (address: string, exactAddress?: {
    businessName: string;
    city: string;
}): string => {
    // First check for exact address
    if (exactAddress) {
        // If it's a business location (like airport), prioritize that
        if (exactAddress.businessName) {
            const canonicalBusiness = findCanonicalName(exactAddress.businessName);
            if (fixedRoutes.hasOwnProperty(canonicalBusiness)) {
                return canonicalBusiness;
            }
        }
        // Check city name from exact address
        if (exactAddress.city) {
            // Remove ", Nederland" or ", Netherlands" from city name
            const cleanCity = exactAddress.city.replace(/,?\s*(Nederland|Netherlands)$/i, '').trim();
            const canonicalCity = findCanonicalName(cleanCity);
            return canonicalCity;
        }
    }

    // Fallback to original address parsing
    const parts = address.split(',');
    // Take first part and remove ", Nederland" or ", Netherlands"
    const mainLocation = parts[0].replace(/,?\s*(Nederland|Netherlands)$/i, '').trim();
    const canonicalLocation = findCanonicalName(mainLocation);
    
    return canonicalLocation;
};


const findFixedPrice = (
    source: { address: string; exact?: { businessName: string; city: string; } },
    destination: { address: string; exact?: { businessName: string; city: string; } }
): FixedPrice | null => {
    const sourceMain = extractMainLocation(source.address, source.exact);
    const destMain = extractMainLocation(destination.address, destination.exact);

    console.log('🔍 Searching fixed routes:', { from: sourceMain, to: destMain });

    // Check direct route
    if (fixedRoutes[sourceMain]?.[destMain]) {
        console.log('✅ Found direct fixed route:', fixedRoutes[sourceMain][destMain]);
        return fixedRoutes[sourceMain][destMain];
    }

    // Check reverse route
    if (fixedRoutes[destMain]?.[sourceMain]) {
        console.log('✅ Found reverse fixed route:', fixedRoutes[destMain][sourceMain]);
        return fixedRoutes[destMain][sourceMain];
    }

    console.log('❌ No fixed route found');
    return null;
};

// Apply minimum price function
const applyMinimumPrice = (price: number): number => {
    return Math.max(price, MINIMUM_PRICE);
};

export const calculatePrice = (
    source: string,
    destination: string,
    distance: string,
    extraDistance: string,
    sourceExact?: { businessName: string; city: string; },
    destinationExact?: { businessName: string; city: string; }
): PriceResult => {
    console.log('🚗 Starting price calculation:', { 
        source, 
        destination, 
        distance, 
        extraDistance,
        sourceExact,
        destinationExact 
    });

    const extraDistanceKm = parseFloat(extraDistance.replace('km', '').trim()) || 0;
    const mainDistanceKm = parseFloat(distance.replace('km', '').trim()) || 0;

    const fixedPrice = findFixedPrice(
        { address: source, exact: sourceExact },
        { address: destination, exact: destinationExact }
    );
    
    if (fixedPrice) {
        // For fixed routes, we still apply the minimum price
        const result = {
            stationWagon: applyMinimumPrice(fixedPrice.stationWagon + (extraDistanceKm * STATION_WAGON_PRICE_PER_KM)),
            bus: applyMinimumPrice(fixedPrice.bus + (extraDistanceKm * BUS_PRICE_PER_KM)),
            isFixedPrice: true
        };
        console.log('💰 Final fixed price:', result);
        return result;
    }

    // Dynamic pricing for non-fixed routes
    const totalDistance = mainDistanceKm + extraDistanceKm;
    
    const result = {
        stationWagon: applyMinimumPrice(totalDistance * STATION_WAGON_PRICE_PER_KM),
        bus: applyMinimumPrice(totalDistance * BUS_PRICE_PER_KM),
        isFixedPrice: false
    };
    
    console.log('💰 Final dynamic price:', { 
        totalDistance,
        stationWagonRate: STATION_WAGON_PRICE_PER_KM,
        busRate: BUS_PRICE_PER_KM,
        result 
    });
    
    return result;
};
