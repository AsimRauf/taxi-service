import type { NextApiRequest, NextApiResponse } from 'next';

interface PlacePrediction {
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  place_id: string;
}

interface GooglePlacesResponse {
  predictions: PlacePrediction[];
  status: string;
  error_message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { input, language } = req.query;
    
    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?` + 
      `input=${encodeURIComponent(input as string)}` +
      `&key=${process.env.GOOGLE_MAPS_API_KEY}` +
      `&language=${language || 'nl'}` +
      `&components=country:nl` +
      `&types=geocode`
    );

    const data = await response.json() as GooglePlacesResponse;


    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data.error_message);
      return res.status(500).json({ error: 'Failed to fetch places' });
    }

    // Transform and validate the response
    const predictions = data.predictions?.map(prediction => ({
      description: prediction.description,
      structured_formatting: {
        main_text: prediction.structured_formatting.main_text,
        secondary_text: prediction.structured_formatting.secondary_text
      },
      place_id: prediction.place_id
    })) || [];


    res.status(200).json({ predictions });
  } catch (error) {
    console.error('Places API error:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
}
