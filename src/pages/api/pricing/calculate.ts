import type { NextApiRequest, NextApiResponse } from 'next';
import { calculatePrice as calculatePriceUtil } from '../../../utils/pricingCalculator';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { source, destination, distance, extraDistance } = req.body;

    if (!source || !destination || !distance) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const price = calculatePriceUtil(source, destination, distance, extraDistance || '0km');
    res.status(200).json(price);
  } catch (error) {
    console.error('Pricing calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
}
