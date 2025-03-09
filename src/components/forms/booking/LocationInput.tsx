import dynamic from 'next/dynamic'
import { createGooglePlacesConfig } from '@/config/googlePlaces'
import { Location } from '@/types/booking'
import { WebsiteTranslations } from '@/types/translations'
import { SingleValue } from 'react-select'
import { useState, useEffect, useRef } from 'react'

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
  () => import('react-google-places-autocomplete'),
  {
    ssr: false,
    loading: () => <div className="h-[60px] border border-gray-200 rounded-lg" />
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
export const LocationInput = ({ value, onChange, placeholder, translations, onClear }: LocationInputProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const googlePlacesProps = createGooglePlacesConfig({
    ...translations,
    locale: translations.locale || 'en'
  });

  useEffect(() => {
    if (value?.mainAddress) {
      setInputValue(value.mainAddress);
    }
    // Set loading to false after initial mount
    setIsLoading(false);
  }, [value]);

  const handleManualEdit = (newValue: string) => {
    setInputValue(newValue);
    setShowSuggestions(true);

    const syntheticPlace = {
      label: newValue,
      value: {
        description: newValue,
        structured_formatting: {
          main_text: newValue,
          secondary_text: '',
          place_id: value?.value?.place_id || 'manual-entry'
        },
        place_id: value?.value?.place_id || 'manual-entry'
      }
    };
    onChange(syntheticPlace);
  };

  const formattedValue = value ? {
    label: value.mainAddress || '',
    value: {
      description: value.mainAddress,
      structured_formatting: {
        main_text: value.mainAddress,
        secondary_text: value.secondaryAddress,
        place_id: value.value.place_id
      },
      place_id: value.value.place_id
    }
  } : null;

  return (
    <div className="w-full min-h-[60px] relative">
      {isLoading ? (
        <div className="h-[60px] border-2 border-[#FFD700] rounded-xl animate-pulse bg-gray-50" />
      ) : (
        <GooglePlacesAutocomplete
          {...googlePlacesProps}
          selectProps={{
            ...googlePlacesProps.selectProps,
            value: formattedValue,
            inputValue,
            menuIsOpen: showSuggestions,
            onMenuOpen: () => setShowSuggestions(true),
            onMenuClose: () => setShowSuggestions(false),
            onFocus: () => {
              setIsEditing(true);
              setShowSuggestions(true);
            },
            onBlur: () => {
              if (!inputValue.trim()) {
                onClear?.();
              }
              setIsEditing(false);
            },
            onInputChange: (newValue, { action }) => {
              if (action === 'input-change') {
                setIsEditing(true);
                setInputValue(newValue);
                handleManualEdit(newValue);
              }
            },
            onChange: (selected) => {
              if (selected) {
                onChange(selected);
                setInputValue(selected.label);
                setIsEditing(false);
                setShowSuggestions(false);
              }
            },
            isSearchable: true,
            isClearable: true,
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
                    setIsEditing(false);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
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
              control: (provided, state) => ({
                ...provided,
                cursor: 'text',
                minHeight: '60px',
                maxHeight: '60px',
                border: `2px solid ${state.isFocused ? '#0077BE' : '#FFD700'}`, // Combined border declaration
                borderColor: 'transparent', // Ensure no conflicting border color
                borderRadius: '0.75rem', // 12px
                boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 119, 190, 0.1)' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                backgroundColor: state.isDisabled ? 'rgb(249 250 251)' : 'white',
                '&:hover': {
                  borderColor: state.isFocused ? '#0077BE' : '#FFD700',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }
              }),
              input: (provided) => ({
                ...provided,
                cursor: 'text',
                caretColor: '#0077BE',
                color: '#333333',
                fontSize: '1rem',
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                input: {
                  opacity: '1 !important',
                }
              }),
              valueContainer: (provided) => ({
                ...provided,
                padding: '8px 16px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 'calc(100% - 40px)',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: '#333333',
                fontSize: '1rem',
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
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
            }
          }}
        />
      )}
    </div>
  );
};