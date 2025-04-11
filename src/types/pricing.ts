export interface FixedPrice {
    sedan: number;
    stationWagon: number;
    bus: number;
}

export interface FixedRouteMap {
    [source: string]: {
        [destination: string]: FixedPrice;
    };
}

export interface PriceResult {
    sedan: number;
    stationWagon: number;
    bus: number;
    isFixedPrice: boolean;
}