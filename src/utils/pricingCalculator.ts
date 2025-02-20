import { FixedPrice, PriceResult } from '@/types/pricing';
import { fixedRoutes } from '@/data/fixedPrice';

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


const extractMainLocation = (address: string): string => {
    const parts = address.split(',');
    const mainLocation = parts[0].trim();
    console.log('📍 Location extraction:', { full: address, extracted: mainLocation });
    return mainLocation;
};

const findFixedPrice = (source: string, destination: string): FixedPrice | null => {
    const sourceMain = extractMainLocation(source);
    const destMain = extractMainLocation(destination);

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
    extraDistance: string
): PriceResult => {
    console.log('🚗 Starting price calculation:', { source, destination, distance, extraDistance });

    const extraDistanceKm = parseFloat(extraDistance.replace('km', '').trim()) || 0;
    const mainDistanceKm = parseFloat(distance.replace('km', '').trim()) || 0;

    const fixedPrice = findFixedPrice(source, destination);
    
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
