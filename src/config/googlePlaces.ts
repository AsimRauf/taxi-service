// Google Places configuration
import { WebsiteTranslations } from '@/types/translations'
import { CSSObject } from '@emotion/react'
import { OptionLabel } from '@/components/forms/booking/GooglePlacesOptionLabel'

interface StyleProps {
    control: CSSObject
    container: CSSObject
  }
  
  interface GooglePlacesConfig {
    apiKey: string
    autocompletionRequest: {
      componentRestrictions: {
        country: string
      }
    }
    selectProps: {
      styles: {
        control: (base: StyleProps['control']) => CSSObject
        container: (base: StyleProps['container']) => CSSObject
      }
      formatOptionLabel: typeof OptionLabel
      isSearchable: boolean
      isClearable: boolean
    }
  }
  
  export const createGooglePlacesConfig = (translations: WebsiteTranslations): GooglePlacesConfig => ({
    apiKey: `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=${translations.locale}`,
    autocompletionRequest: {
      componentRestrictions: { country: 'nl' },
    },
    selectProps: {
      styles: {
        control: (provided: StyleProps['control']) => ({
          ...provided,
          height: '60px',
          borderRadius: '0.5rem',
          borderColor: '#E5E7EB',
          paddingLeft: '0'
        }),
        container: (provided: StyleProps['container']) => ({
          ...provided,
          width: '100%',
        }),
      },
      formatOptionLabel: OptionLabel,
      isSearchable: true,
      isClearable: true,
    }
  })
  
