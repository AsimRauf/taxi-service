export interface CustomComponents {
  IconLeft?: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  IconRight?: React.ComponentType<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  Dropdown?: React.ComponentType<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; disabled?: boolean }[];
  }>; // More specific type for Dropdown
  // Add other custom components as needed
}
