import { useState } from 'react';
import { WebsiteTranslations } from '../types/translations';

interface PlacePrediction {
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  place_id: string;
}

export const usePlacesAutocomplete = (translations: WebsiteTranslations) => {
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (input: string) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching suggestions for input:', input); // Debug log

      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}&language=${translations.locale}`
      );
      const data = await response.json();

      console.log('API Response:', data); // Debug log

      if (data.predictions) {
        console.log('Setting suggestions:', data.predictions); // Debug log
        setSuggestions(data.predictions);
      } else {
        console.log('No predictions in response'); // Debug log
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debug log current state
  console.log('Current suggestions:', suggestions);
  console.log('Loading state:', loading);

  return { 
    suggestions, 
    loading, 
    fetchSuggestions 
  };
};
