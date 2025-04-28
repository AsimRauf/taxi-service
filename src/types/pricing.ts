export interface FixedPrice {
    stationWagon: number;
    bus: number;
}

export type FixedRouteMap = {
    [source: string]: {
        [destination: string]: FixedPrice;
    };
};

export interface PriceResult {
    stationWagon: number;
    bus: number;
    isFixedPrice: boolean;
}