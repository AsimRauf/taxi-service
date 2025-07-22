import { FC } from 'react'
import { Plus, Minus } from 'lucide-react'

interface PassengerSelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label: string
}

export const PassengerSelector: FC<PassengerSelectorProps> = ({ 
  value, 
  onChange, 
  min = 1, 
  max = 8,
  label 
}) => {
  const increment = () => {
    if (value < max) onChange(value + 1)
  }

  const decrement = () => {
    if (value > min) onChange(value - 1)
  }

  return (
    <div className="flex flex-col items-center md:items-start">
      <label className="block text-sm font-medium text-gray-700 mb-1 text-center md:text-left">
        {label}
      </label>
      <div className="flex items-center space-x-3 justify-center md:justify-start">
        <button
          type="button"
          onClick={decrement}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          disabled={value <= min}
        >
          <Minus size={16} className={value <= min ? 'text-gray-400' : 'text-gray-600'} />
        </button>
        <span className="text-lg font-semibold w-6 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={increment}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          disabled={value >= max}
        >
          <Plus size={16} className={value >= max ? 'text-gray-400' : 'text-gray-600'} />
        </button>
      </div>
    </div>
  )
}
