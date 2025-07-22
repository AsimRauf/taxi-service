import { FC } from 'react'

interface LuggageCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export const LuggageCheckbox: FC<LuggageCheckboxProps> = ({ checked, onChange, label }) => (
    <div className="flex items-center">
        <input
            type="checkbox"
            id="luggage"
            className="peer hidden"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
        <label
            htmlFor="luggage"
            className="flex items-center cursor-pointer"
        >
            <span className="w-5 h-5 inline-block mr-2 rounded-md border-2 border-primary/50 peer-checked:bg-primary peer-checked:border-primary transition-all duration-300 flex-shrink-0 relative">
                {checked && (
                    <svg className="w-full h-full text-black absolute inset-0" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M9.55 18.2l-5.7-5.7 1.41-1.41 4.29 4.29 9.19-9.19 1.41 1.41z" />
                    </svg>
                )}
            </span>
            <span className="text-sm font-medium text-black">
                {label}
            </span>
        </label>
    </div>
)
