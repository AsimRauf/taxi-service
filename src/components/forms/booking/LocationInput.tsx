// LocationInput component with all imports and interface definitions
import dynamic from 'next/dynamic'
import { createGooglePlacesConfig } from '@/config/googlePlaces'
import { Location } from '@/types/booking'
import { WebsiteTranslations } from '@/types/translations'
import { SingleValue } from 'react-select'

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
  export const LocationInput = ({ 
    value, 
    onChange, 
    placeholder, 
    translations, 
    onClear 
  }: LocationInputProps) => {
    const googlePlacesProps = createGooglePlacesConfig(translations)
    
    const formattedValue = value ? {
      label: value.mainAddress || '',
      value: {
        description: value.mainAddress,
        structured_formatting: {
          main_text: value.mainAddress,
          secondary_text: value.secondaryAddress
        }
      }
    } : null
  
    return (
      <div className="min-h-[60px]">
        <GooglePlacesAutocomplete
          {...googlePlacesProps}
          selectProps={{
            ...googlePlacesProps.selectProps,
            value: formattedValue,
            onChange,
            placeholder,
            noOptionsMessage: () => translations.locale === 'nl' ? "Geen locaties gevonden" : "No locations found",
            loadingMessage: () => translations.locale === 'nl' ? "Laden..." : "Loading...",
            components: {
              DropdownIndicator: null,
              ClearIndicator: onClear ? (props: ClearIndicatorProps) => (
                <div
                  {...props.innerProps}
                  onClick={onClear}
                  className="cursor-pointer p-2 hover:text-gray-600"
                >
                  ×
                </div>
              ) : undefined
            },
            formatOptionLabel: (option: SelectOption) => {
              const { label, value } = option
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
            }
          }}
        />
      </div>
    )
  }
  