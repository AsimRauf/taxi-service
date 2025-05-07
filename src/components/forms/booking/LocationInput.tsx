import dynamic from 'next/dynamic'
import { createGooglePlacesConfig } from '@/config/googlePlaces'
import { Location } from '@/types/booking'
import { WebsiteTranslations } from '@/types/translations'
import { SingleValue } from 'react-select'
import { useState, useEffect, useRef } from 'react'
import { GooglePlacesAutocompleteHandle } from 'react-google-places-autocomplete/build/types'

interface GooglePlaceValue {
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
    place_id: string
  }
  place_id: string
}

interface SelectOption {
  label: string
  value: GooglePlaceValue
}

const GooglePlacesAutocomplete = dynamic(
  async () => {
    // Create a properly typed promise
    const loadComponent = new Promise<typeof import('react-google-places-autocomplete')>((resolve) => {
      setTimeout(async () => {
        const component = await import('react-google-places-autocomplete');
        resolve(component);
      }, 1500);
    });
    return loadComponent;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[60px] border-2 border-[#FFD700] rounded-xl animate-pulse bg-gray-50">
        <div className="h-full flex items-center justify-start px-4 text-gray-400">
          Loading...
        </div>
      </div>
    )
  }
)

interface LocationInputProps {
  value: Location | null
  onChange: (place: SingleValue<SelectOption>) => Promise<void> | void
  placeholder: string
  translations: WebsiteTranslations
  onClear?: () => void
}

interface ClearIndicatorProps {
  innerProps: React.HTMLAttributes<HTMLDivElement>
}

// Add this interface for the input ref
interface GooglePlacesInputRef {
  select: {
    inputRef: React.RefObject<HTMLInputElement>;
  };
}

export const LocationInput = ({ value, onChange, placeholder, translations, onClear }: LocationInputProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const inputRef = useRef<GooglePlacesInputRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const latestValueRef = useRef<Location | null>(null);

  const googlePlacesProps = createGooglePlacesConfig({
    ...translations,
    locale: translations.locale || 'en'
  });

  // Add debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Google API loaded:', !!window.google);
      console.log('Google Places API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkGoogleApi = () => {
      if (!mounted) return;

      if (typeof window !== 'undefined' && window.google) {
        setIsLoading(false);
        setIsMounted(true);
        return;
      }

      if (retryCount < maxRetries) {
        timeoutId = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkGoogleApi();
        }, 1500);
      } else {
        setIsLoading(false);
        setIsMounted(true);
        setHasError(true);
        console.error('Failed to load Google Maps API after multiple retries');
      }
    };

    const initialTimeoutId = setTimeout(() => {
      checkGoogleApi();
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(initialTimeoutId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [retryCount]);

  useEffect(() => {
    if (value?.mainAddress) {
      latestValueRef.current = value;
      setSelectedLocation(value);
      setInputValue(value.mainAddress);
    }
  }, [value]);

  useEffect(() => {
    if (selectedLocation) {
      if (containerRef.current) {
        containerRef.current.style.display = 'none';
        void containerRef.current.offsetHeight;
        containerRef.current.style.display = '';
      }
    }
  }, [selectedLocation]);

  const handleInputChange = (newValue: string, actionMeta: { action: string }) => {
    if (actionMeta.action === 'input-change') {
      setInputValue(newValue);
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    const currentValue = latestValueRef.current;
    if (currentValue?.mainAddress) {
        setInputValue(currentValue.mainAddress);
        setShowSuggestions(false);
    } else {
        setInputValue('');
    }
  };

  

  const handleLocationSelect = async (selected: SingleValue<SelectOption>) => {
    if (selected) {
      console.log('Selected location:', selected);
      
      const newLocation = selected as unknown as Location;
      
      latestValueRef.current = newLocation;

      setSelectedLocation(newLocation);
      setInputValue(selected.label);
      setShowSuggestions(false);

      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
          void containerRef.current.offsetHeight;
          containerRef.current.style.display = '';
        }
      });

      await onChange(selected);
    } else {
      latestValueRef.current = null;
      setSelectedLocation(null);
      setInputValue('');
      setShowSuggestions(false);
      onClear?.();
    }
  };

  if (hasError) {
    return (
      <div className="w-full min-h-[60px] relative">
        <div className="h-[60px] border-2 border-red-300 rounded-xl bg-red-50 flex items-center justify-center">
          <span className="text-red-500 text-sm">
            {translations.locale === 'nl'
              ? "Kon locatie service niet laden"
              : "Could not load location service"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[60px] relative" ref={containerRef}>
      {isLoading ? (
        <div className="h-[60px] border-2 border-[#FFD700] rounded-xl animate-pulse bg-gray-50">
          <div className="h-full flex items-center justify-start px-4 text-gray-400">
            Loading...
          </div>
        </div>
      ) : (
        isMounted && (
          <GooglePlacesAutocomplete
            {...googlePlacesProps}
            ref={inputRef as React.Ref<GooglePlacesAutocompleteHandle>}
            selectProps={{
              ...googlePlacesProps.selectProps,
              value: value ? {
                label: value.mainAddress || '',
                value: value.value
              } : null,
              inputValue,
              menuIsOpen: showSuggestions,
              onMenuOpen: () => setShowSuggestions(true),
              onMenuClose: () => {
                setShowSuggestions(false);
                handleBlur();
              },
              onInputChange: handleInputChange,
              onBlur: handleBlur,
              onChange: handleLocationSelect,
              isSearchable: true,
              isClearable: true,
              blurInputOnSelect: true,
              placeholder,
              noOptionsMessage: () => translations.locale === 'nl' ? "Geen locaties gevonden" : "No locations found",
              loadingMessage: () => translations.locale === 'nl' ? "Laden..." : "Loading...",
              components: {
                DropdownIndicator: null,
                ClearIndicator: onClear ? (props: ClearIndicatorProps) => (
                  <div
                    {...props.innerProps}
                    onClick={() => {
                      onClear();
                      setInputValue('');
                      setSelectedLocation(null);
                      setShowSuggestions(false);
                    }}
                    className="cursor-pointer p-2 text-gray-400 hover:text-[#0077BE] transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : undefined
              },
              formatOptionLabel: (option: SelectOption) => {
                const { label, value } = option;
                
                return (
                  <div>
                    <div>{label}</div>
                    {value.structured_formatting && (
                      <div className="text-sm text-gray-500">
                        {value.structured_formatting.secondary_text}
                      </div>
                    )}
                  </div>
                )
              },
              styles: {
                ...googlePlacesProps.selectProps.styles,
                container: (provided) => ({
                  ...provided,
                  width: '100% !important',
                  minWidth: '100% !important',
                  position: 'relative',
                }),
                control: (provided, state) => ({
                  ...provided,
                  cursor: 'text',
                  minHeight: '60px',
                  maxHeight: '60px',
                  width: '100% !important',
                  minWidth: '100% !important',
                  flex: '1 1 auto !important',
                  border: `2px solid ${state.isFocused ? '#0077BE' : '#FFD700'}`,
                  borderColor: 'transparent',
                  borderRadius: '0.75rem',
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 119, 190, 0.1)' : 'none',
                  overflow: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  transition: 'all 0.2s ease',
                  backgroundColor: state.isDisabled ? 'rgb(249 250 251)' : 'white',
                  '&:hover': {
                    borderColor: state.isFocused ? '#0077BE' : '#FFD700',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  },
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }),
                input: (provided) => ({
                  ...provided,
                  margin: 0,
                  padding: 0,
                  cursor: 'text',
                  caretColor: '#0077BE',
                  color: '#333333',
                  fontSize: '1rem',
                  fontWeight: '500',
                  overflow: 'auto',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  textOverflow: 'clip',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  input: {
                    opacity: '1 !important',
                    caretColor: '#0077BE',
                    '-webkit-touch-callout': 'default',
                    '-webkit-user-select': 'text',
                    'user-select': 'text',
                    'touch-action': 'manipulation',
                  }
                }),
                valueContainer: (provided) => ({
                  ...provided,
                  padding: '8px 16px',
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  '-ms-overflow-style': 'none',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#333333',
                  fontSize: '1rem',
                  fontWeight: '500',
                  overflow: 'auto',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  '-ms-overflow-style': 'none',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'rgb(156 163 175)',
                  fontSize: '1rem',
                }),
                menu: (provided) => ({
                  ...provided,
                  marginTop: '4px',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  border: '2px solid #FFD700',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  backgroundColor: 'white',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? '#f8f9fa' : 'white',
                  color: '#333333',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  fontSize: '0.95rem',
                  fontWeight: state.isFocused ? '500' : '400',
                  ':active': {
                    backgroundColor: '#e9ecef',
                  },
                  ':hover': {
                    backgroundColor: '#f8f9fa',
                  }
                }),
                noOptionsMessage: (provided) => ({
                  ...provided,
                  color: '#666666',
                  fontSize: '0.95rem',
                  padding: '16px',
                }),
                loadingMessage: (provided) => ({
                  ...provided,
                  color: '#666666',
                  fontSize: '0.95rem',
                  padding: '16px',
                }),
              },
            }}
          />
        )
      )}
    </div>
  );
};