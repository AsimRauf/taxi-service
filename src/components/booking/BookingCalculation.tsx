import { useTranslation } from 'next-i18next'

interface BookingCalculationProps {
  data: {
    sourceAddress: string
    destinationAddress: string
    directDistance: string
    stopovers: string[]
    extraDistance: string
    pickupDateTime: string
    returnDateTime: string | null
    hasLuggage: boolean
    passengers: number
  }
}

export const BookingCalculation = ({ data }: BookingCalculationProps) => {
  const { t } = useTranslation('common')

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t('booking.title')}
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('booking.from')}</h3>
                <p className="mt-1 text-lg text-gray-900">{data.sourceAddress}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('booking.to')}</h3>
                <p className="mt-1 text-lg text-gray-900">{data.destinationAddress}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('booking.distance')}</h3>
                <p className="mt-1 text-lg text-gray-900">{data.directDistance}</p>
              </div>
              {data.stopovers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">{t('booking.extraDistance')}</h3>
                  <p className="mt-1 text-lg text-gray-900">{data.extraDistance}</p>
                </div>
              )}
            </div>
          </div>

          {data.stopovers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('booking.stopovers')}</h3>
              <div className="mt-2 space-y-2">
                {data.stopovers.map((stop, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-900">{stop}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('booking.pickupTime')}</h3>
              <p className="mt-1 text-lg text-gray-900">{data.pickupDateTime}</p>
            </div>
            {data.returnDateTime && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">{t('booking.returnTime')}</h3>
                <p className="mt-1 text-lg text-gray-900">{data.returnDateTime}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('booking.passengers')}</h3>
              <p className="mt-1 text-lg text-gray-900">{data.passengers}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{t('booking.luggage')}</h3>
              <p className="mt-1 text-lg text-gray-900">{data.hasLuggage ? t('booking.yes') : t('booking.no')}</p>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('booking.back')}
            </button>
            <button
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              {t('booking.bookNow')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
