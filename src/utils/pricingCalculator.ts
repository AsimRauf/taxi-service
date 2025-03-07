import { FixedPrice, PriceResult } from '@/types/pricing';
import { fixedRoutes } from '@/data/fixedPrice';
import { findCanonicalName } from '@/data/placeAliases';

const PRICE_PER_KM = 2.5;
const VAN_MULTIPLIER = 1.3;

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
        regular: true,
        van: true
    };

    // Regular taxi limitations based on new criteria
    const combinedLuggage = totalLarge + totalSmall;
    
    // Hide regular taxi if:
    // 1. More than 3 large bags
    // 2. More than 4 small bags
    // 3. Combined luggage > 3 (except when 3 small + 1 large)
    if (
        passengers > 4 ||
        totalLarge > 3 ||
        totalSmall > 4 ||
        (combinedLuggage > 3 && !(totalSmall === 3 && totalLarge === 1)) ||
        totalSpecialItems > 0
    ) {
        result.regular = false;
    }

    // Van limitations
    if (
        passengers > 8 ||
        totalLarge > 8 ||
        totalSmall > 11 ||
        totalHandLuggage > 8 ||
        totalSpecialItems > 3
    ) {
        result.van = false;
    }

    // If only van is available, ensure regular is not selectable
    if (!result.regular && result.van) {
        result.regular = false;
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
                console.log('📍 Found canonical business name:', canonicalBusiness);
                return canonicalBusiness;
            }
        }
        // Check city name from exact address
        if (exactAddress.city) {
            const canonicalCity = findCanonicalName(exactAddress.city);
            console.log('📍 Using canonical city name:', canonicalCity);
            return canonicalCity;
        }
    }

    // Fallback to original address parsing
    const parts = address.split(',');
    const mainLocation = parts[0].trim();
    const canonicalLocation = findCanonicalName(mainLocation);
    
    console.log('📍 Location extraction:', { 
        original: mainLocation,
        canonical: canonicalLocation 
    });
    
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
        const result = {
            regular: fixedPrice.regular + (extraDistanceKm * PRICE_PER_KM),
            van: fixedPrice.van + (extraDistanceKm * PRICE_PER_KM),
            isFixedPrice: true
        };
        console.log('💰 Final fixed price:', result);
        return result;
    }

    // Dynamic pricing for non-fixed routes
    const totalDistance = mainDistanceKm + extraDistanceKm;
    const result = {
        regular: totalDistance * PRICE_PER_KM,
        van: totalDistance * PRICE_PER_KM * VAN_MULTIPLIER,
        isFixedPrice: false
    };
    
    console.log('💰 Final dynamic price:', { 
        totalDistance,
        baseRate: PRICE_PER_KM,
        result 
    });
    
    return result;
};
