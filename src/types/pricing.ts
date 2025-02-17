export interface FixedPrice {
    regular: number;
    van: number;
}

export interface FixedRouteMap {
    [source: string]: {
        [destination: string]: FixedPrice;
    };
}

export interface PriceResult {
    regular: number;
    van: number;
    isFixedPrice: boolean;
}