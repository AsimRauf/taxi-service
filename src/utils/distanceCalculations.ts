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
            const mainResponse = await distanceService.getDistanceMatrix({
                origins: [source?.mainAddress || source?.label || ''],
                destinations: [destination?.mainAddress || destination?.label || ''],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC
            })

            const mainDistance = formatDistance(mainResponse.rows[0].elements[0].distance.text)
            const mainDuration = mainResponse.rows[0].elements[0].duration.text

            segments.push({
                from: source?.mainAddress || source?.label || '',
                to: destination?.mainAddress || destination?.label || '',
                distance: mainDistance,
                duration: mainDuration
            })

            if (stopovers.length > 0) {
                let totalSegmentDistance = 0
                const points = [source, ...stopovers, destination]
                const stopoverNames = stopovers.map(stop => stop?.mainAddress || stop?.label).join(' → ')

                for (let i = 0; i < points.length - 1; i++) {
                    const response = await distanceService.getDistanceMatrix({
                        origins: [points[i]?.mainAddress || points[i]?.label || ''],
                        destinations: [points[i + 1]?.mainAddress || points[i + 1]?.label || ''],
                        travelMode: google.maps.TravelMode.DRIVING,
                        unitSystem: google.maps.UnitSystem.METRIC
                    })
                   
                    const segmentDistance = formatDistance(response.rows[0].elements[0].distance.text)
                    totalSegmentDistance += parseFloat(segmentDistance.replace(/[^0-9.]/g, ''))
                }

                const directDistance = parseFloat(mainDistance.replace(/[^0-9.]/g, ''))
                const extraKm = totalSegmentDistance - directDistance

                segments.push({
                    from: `Additional distance via: ${stopoverNames}`,
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
