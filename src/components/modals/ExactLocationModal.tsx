import { Location } from '@/types/booking';
import { useState, useEffect } from 'react';

interface ParsedAddress {
  businessName: string;
  streetName: string;
  houseNumber: string;
  postalCode: string;
  city: string;
}

interface ExactLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location;
  type: 'pickup' | 'stopover' | 'destination';
  index?: number;
  parsedAddress: ParsedAddress;
  formData: any;
  setFormData: (data: any) => void;
  translations: any;
}

export const ExactLocationModal = ({
  isOpen,
  onClose,
  location,
  type,
  index,
  parsedAddress,
  formData,
  setFormData,
  translations
}: ExactLocationModalProps) => {
  const [localStreetName, setLocalStreetName] = useState('');
  const [localHouseNumber, setLocalHouseNumber] = useState('');
  const [errors, setErrors] = useState({ streetName: '', houseNumber: '' });

  useEffect(() => {
    setLocalStreetName(location.exactAddress?.streetName || parsedAddress.streetName || '');
    setLocalHouseNumber(location.exactAddress?.houseNumber || parsedAddress.houseNumber || '');
  }, [location.value.place_id, parsedAddress]);

  const handleSave = () => {
    // Validation with proper translation keys
    const newErrors = {
      streetName: !localStreetName.trim() ? translations.booking.errors.streetRequired : '',
      houseNumber: !parsedAddress.businessName && !localHouseNumber.trim() 
        ? translations.booking.errors.houseNumberRequired : ''
    };

    setErrors(newErrors);

    if (newErrors.streetName || (!parsedAddress.businessName && newErrors.houseNumber)) {
      return;
    }

    const exactAddress = {
      streetName: localStreetName,
      houseNumber: localHouseNumber || '',
      postalCode: parsedAddress.postalCode || '',
      city: parsedAddress.city || '',
      businessName: parsedAddress.businessName || location.exactAddress?.businessName || ''
    };

    const updatedLocation: Location = {
      ...location,
      exactAddress,
      mainAddress: exactAddress.businessName
        ? `${exactAddress.businessName}, ${exactAddress.streetName}${localHouseNumber ? ` ${localHouseNumber}` : ''}, ${exactAddress.city}, Netherlands`
        : `${exactAddress.streetName} ${localHouseNumber}, ${exactAddress.city}, Netherlands`
    };

    if (type === 'pickup') {
      setFormData({
        ...formData,
        pickup: updatedLocation
      });
    } else if (type === 'destination') {
      setFormData({
        ...formData,
        destination: updatedLocation
      });
    } else if (type === 'stopover' && typeof index === 'number') {
      const newStopovers = [...formData.stopovers];
      newStopovers[index] = updatedLocation;
      setFormData({
        ...formData,
        stopovers: newStopovers
      });
    }

    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {translations.booking.exactLocation}
                </h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 111.414 1.414L11.414 10l4.293 4.293a1 1 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 01-1.414-1.414L8.586 10 4.293 5.707a1 1 010-1.414z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {parsedAddress.businessName && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    {translations.booking.businessName}
                  </label>
                  <input
                    type="text"
                    value={parsedAddress.businessName}
                    readOnly
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  {translations.booking.streetName} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={localStreetName}
                  onChange={(e) => setLocalStreetName(e.target.value)}
                  className={`w-full px-3 py-2.5 border ${errors.streetName ? 'border-red-300' : 'border-gray-300'} rounded-lg`}
                  placeholder={translations.booking.enterStreetName}
                />
                {errors.streetName && (
                  <span className="text-red-500 text-xs">{errors.streetName}</span>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-600">
                  {translations.booking.houseNumber}
                  {!parsedAddress.businessName && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={localHouseNumber}
                  onChange={(e) => setLocalHouseNumber(e.target.value)}
                  className={`w-full px-3 py-2.5 border ${errors.houseNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg`}
                  placeholder={translations.booking.enterHouseNumber}
                />
                {errors.houseNumber && (
                  <span className="text-red-500 text-xs">{errors.houseNumber}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    {translations.booking.postalCode}
                  </label>
                  <input
                    type="text"
                    value={parsedAddress.postalCode}
                    readOnly
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    {translations.booking.city}
                  </label>
                  <input
                    type="text"
                    value={parsedAddress.city}
                    readOnly
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {translations.common.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg"
                >
                  {translations.common.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};