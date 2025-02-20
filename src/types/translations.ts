export interface WebsiteTranslations {
    locale: string
    travelInfo: {
      errors: {
        requiredLocations: string
        invalidPrice: string
        invalidPickupTime: string
        invalidReturnTime: string
        invalidDates: string
        pickupDateRequired: string
        returnDateRequired: string
        invalidStopover: string
        maxStopovers: string
        duplicateLocation: string
        invalidPassengers: string
        invalidLuggage: string
        invalidVehicle: string
        invalidRoute: string
      }
    }
    nav: {
      login: string
      services: string
      contact: string
      aboutUs: string
      service1: string
      service2: string
      profile: string
      signOut: string
    }
    auth: {
      createAccount: string
      fullName: string
      nameRequired: string
      emailRequired: string
      invalidEmail: string
      phoneRequired: string
      invalidPhone: string
      passwordRequired: string
      passwordLength: string
      passwordMatch: string
      genericError: string
      creating: string
      create: string
      haveAccount: string
      signin: string
      password: string  
      phoneNumber: string
      confirmPassword: string
  
    }
    hero: {
      title: string
      subtitle: string
      formTitle: string
      pickup: string
      pickupPlaceholder: string
      destination: string
      destinationPlaceholder: string
      addStopover: string
      swapLocations: string
      stopover: string
      removeStopover: string
      pickupDateTime: string
      returnTrip: string
      returnDateTime: string
      luggage: string
      travelers: string
      person: string
      people: string
      calculate: string
      returnPlaceholder: string
    }
    booking: {
      title: string
      from: string
      to: string
      via: string
      distance: string
      duration: string
      passengers: string
      luggage: string
      yes: string
      no: string
      pickupTime: string
      returnTime: string
      totalPrice: string
      returnIncluded: string
      back: string
      bookNow: string
    },
    units: {
      km: string
    }
  }
  