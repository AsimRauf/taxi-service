export interface RegularLuggage {
    large: number;  // max 8
    small: number;  // max 11
    handLuggage: number; // max 8
}

export interface SpecialLuggage {
    [key: string]: number; // Add index signature
    foldableWheelchair: number;
    rollator: number;
    pets: number;
    bicycle: number;
    winterSports: number;
    stroller: number;
    golfBag: number;
    waterSports: number;
}

export interface LuggageFormData {
    regularLuggage: RegularLuggage;
    specialLuggage: SpecialLuggage;
}
