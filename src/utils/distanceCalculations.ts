import { Location } from '@/types/booking'

interface SegmentResult {
    from: string
    to: string
    distance: string
    duration: string
}

const formatDistance = (distanceText: string): string => {
    return distanceText.replace(',', '.')
}

export const calculateSegmentDistances = async (
    source: Location | null,
    destination: Location | null,
    stopovers: Location[]
): Promise<SegmentResult[]> => {
    const distanceService = new google.maps.DistanceMatrixService()
    const segments: SegmentResult[] = []

    if (source && destination) {
        try {
            // Log direct route
            const mainResponse = await distanceService.getDistanceMatrix({
                origins: [source?.mainAddress || source?.label || ''],
                destinations: [destination?.mainAddress || destination?.label || ''],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            })

            const mainDistance = formatDistance(mainResponse.rows[0].elements[0].distance.text)
            console.log('Direct Route:', {
                from: source?.mainAddress,
                to: destination?.mainAddress,
                distance: mainDistance
            })

            segments.push({
                from: source?.mainAddress || source?.label || '',
                to: destination?.mainAddress || destination?.label || '',
                distance: mainDistance,
                duration: mainResponse.rows[0].elements[0].duration.text
            })

            if (stopovers.length > 0) {
                let totalSegmentDistance = 0
                const points = [source, ...stopovers, destination]

                // Log each segment with stopovers
                for (let i = 0; i < points.length - 1; i++) {
                    const response = await distanceService.getDistanceMatrix({
                        origins: [points[i]?.mainAddress || points[i]?.label || ''],
                        destinations: [points[i + 1]?.mainAddress || points[i + 1]?.label || ''],
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC
                    })
                   
                    const segmentDistance = formatDistance(response.rows[0].elements[0].distance.text)
                    totalSegmentDistance += parseFloat(segmentDistance.replace(/[^0-9.]/g, ''))
                    
                    console.log(`Segment ${i + 1}:`, {
                        from: points[i]?.mainAddress,
                        to: points[i + 1]?.mainAddress,
                        distance: segmentDistance,
                        runningTotal: `${totalSegmentDistance.toFixed(1)} km`
                    })
                }

                const directDistance = parseFloat(mainDistance.replace(/[^0-9.]/g, ''))
                const extraKm = totalSegmentDistance - directDistance

                console.log('Route Summary:', {
                    directDistance: `${directDistance} km`,
                    totalWithStopovers: `${totalSegmentDistance.toFixed(1)} km`,
                    extraDistance: `${extraKm.toFixed(1)} km`
                })

                segments.push({
                    from: `Additional distance via: ${stopovers.map(stop => stop?.mainAddress).join(' → ')}`,
                    to: 'Extra kilometers',
                    distance: `${extraKm.toFixed(1)} km`,
                    duration: '-'
                })
            }
        } catch (error) {
            console.error('Error calculating segment distance:', error)
            throw error
        }
    }

    return segments
}

