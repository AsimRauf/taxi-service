import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { input, language, placeId, type } = req.query;
    
    if (type === 'autocomplete') {
      if (!input) {
        return res.status(400).json({ error: 'Input is required' });
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${process.env.GOOGLE_MAPS_API_KEY}&language=${language}&components=country:nl`
      );

      const data = await response.json();
      res.status(200).json(data);
    } 
    else if (type === 'geocode') {
      if (!placeId) {
        return res.status(400).json({ error: 'Place ID is required' });
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${process.env.GOOGLE_MAPS_API_KEY}&language=${language}`
      );

      const data = await response.json();
      res.status(200).json(data);
    }
    else {
      res.status(400).json({ error: 'Invalid request type' });
    }
  } catch (error) {
    console.error('Places API error:', error);
    res.status(500).json({ error: 'Failed to fetch places data' });
  }
}
