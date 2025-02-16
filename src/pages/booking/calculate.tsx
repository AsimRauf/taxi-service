import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { BookingCalculation } from '@/components/booking/BookingCalculation'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticProps } from 'next'

export default function CalculateBooking() {
  const [bookingData, setBookingData] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const data = localStorage.getItem('bookingData')
    if (!data) {
      router.push('/')
      return
    }
    setBookingData(JSON.parse(data))
  }, [router])

  return (
    <div className="min-h-screen pt-32 pb-16 bg-gradient-to-b from-primary to-white">
      {bookingData && <BookingCalculation data={bookingData} />}
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}