// Option Label component
import { FC } from 'react'

interface OptionType {
    mainAddress?: string
    label?: string
    secondaryAddress?: string
  }
    export const OptionLabel: FC<{option: OptionType}> = ({ option }) => (
      <div>
        <div className="font-medium">
          {(option?.mainAddress || option?.label || '')}
        </div>
        {option?.secondaryAddress && (
          <div className="text-sm text-gray-500">{option.secondaryAddress}</div>
        )}
      </div>
    )