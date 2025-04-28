import { FixedRouteMap } from '@/types/pricing';
import { fixedRoutes } from './fixedPrice';

// Type for aliases map
export type PlaceAliasesMap = {
  [canonicalName: string]: string[];
};

// Helper function to get all unique destination cities from fixed routes
const getAllDestinations = (routes: FixedRouteMap): string[] => {
  const destinations = new Set<string>();
  Object.values(routes).forEach(routeMap => {
    Object.keys(routeMap).forEach(dest => destinations.add(dest));
  });
  return Array.from(destinations);
};

export const placeAliases: PlaceAliasesMap = {
  // Airport aliases
  "Amsterdam Airport Schiphol (AMS)": [
    "schiphol airport",
    "schiphol",
    "ams",
    "amsterdam airport",
    "amsterdam international airport",
    "luchthaven schiphol"
  ],
  "Rotterdam The Hague Airport (RTM)": [
    "rotterdam airport",
    "rtm",
    "rotterdam airport (rtm)",
    "the hague airport",
    "rotterdam the hague airport",
    "rotterdam airport rtm"
  ],
  "Eindhoven Airport (EIN)": [
    "eindhoven airport",
    "ein",
    "eindhoven international airport",
    "airport eindhoven"
  ],

  // City aliases
  "Rotterdam": [
    "rotterdam city",
    "rotterdam centrum",
    "rotterdam central",
    "rotterdam center",
    "rotterdam centraal"
  ],
  "Den Haag": [
    "the hague",
    "'s-gravenhage",
    "den haag centrum",
    "the hague city center"
  ],
  "Capelle aan den IJssel": [
    "capelle",
    "capelle a/d ijssel",
    "capelle aan den ijssel"
  ],
  // Add more city aliases
};

// Update vehicle aliases to only include stationWagon and bus
export const vehicleAliases: Record<string, string[]> = {
  "stationWagon": [
    "station wagon",
    "estate car",
    "family car",
    "combi",
    "touring",
    "break",
    "sedan", // Add sedan as an alias for stationWagon
    "car",
    "taxi"
  ],
  "bus": [
    "minibus",
    "van",
    "minivan",
    "people carrier",
    "mpv",
    "large vehicle",
    "group transport"
  ]
};

// Export function to get all canonical names
export const getCanonicalNames = (): string[] => {
  const sourceLocations = Object.keys(fixedRoutes);
  const destinationLocations = getAllDestinations(fixedRoutes);
  return Array.from(new Set([...sourceLocations, ...destinationLocations]));
};

// Export function to get all aliases for a canonical name
export const getAliases = (canonicalName: string): string[] => {
  return placeAliases[canonicalName] || [];
};

// Export function to find canonical name from any variation
export const findCanonicalName = (placeName: string): string => {
  const normalized = placeName.toLowerCase().trim();
  
  // Direct match with canonical names
  const directMatch = getCanonicalNames().find(
    name => name.toLowerCase() === normalized
  );
  if (directMatch) return directMatch;

  // Search through aliases
  for (const [canonical, aliases] of Object.entries(placeAliases)) {
    if (aliases.some(alias => 
      alias === normalized ||
      normalized.includes(alias) ||
      alias.includes(normalized)
    )) {
      return canonical;
    }
  }

  return placeName; // Return original if no match found
};