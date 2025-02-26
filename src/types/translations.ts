export interface WebsiteTranslations {
  locale: string;
  travelInfo: {
    errors: {
      requiredLocations: string;
      invalidPrice: string;
      invalidPickupTime: string;
      invalidReturnTime: string;
      invalidDates: string;
      pickupDateRequired: string;
      returnDateRequired: string;
      invalidStopover: string;
      maxStopovers: string;
      duplicateLocation: string;
      invalidPassengers: string;
      invalidLuggage: string;
      invalidVehicle: string;
      invalidRoute: string;
    };
  };
  nav: {
    login: string;
    services: string;
    contact: string;
    aboutUs: string;
    service1: string;
    service2: string;
    profile: string;
    signOut: string;
  };
  auth: {
    createAccount: string;
    fullName: string;
    nameRequired: string;
    emailRequired: string;
    invalidEmail: string;
    phoneRequired: string;
    invalidPhone: string;
    passwordRequired: string;
    passwordLength: string;
    passwordMatch: string;
    genericError: string;
    creating: string;
    create: string;
    haveAccount: string;
    signin: string;
    password: string;
    phoneNumber: string;
    confirmPassword: string;
    registrationError: string;
  };
  hero: {
    title: string;
    subtitle: string;
    pickupPlaceholder: string;
    destinationPlaceholder: string;
    addStopover: string;
    swapLocations: string;
    stopover: string;
    removeStopover: string;
    pickupDateTime: string;
    returnTrip: string;
    returnDateTime: string;
    luggage: string;
    travelers: string;
    calculate: string;
    returnPlaceholder: string;
  };
  booking: {
    title: string;
    from: string;
    to: string;
    via: string;
    distance: string;
    duration: string;
    passengers: string;
    luggage: string;
    yes: string;
    no: string;
    pickupTime: string;
    returnTime: string;
    totalPrice: string;
    returnIncluded: string;
    back: string;
    bookNow: string;
    personalInfo: {
      title: string;
      fullName: string;
      fullNamePlaceholder: string;
      email: string;
      emailPlaceholder: string;
      phoneNumber: string;
      phonePlaceholder: string;
      additionalPhone: string;
      additionalPhonePlaceholder: string;
      bookingForOther: string;
      otherFullName: string;
      otherFullNamePlaceholder: string;
      otherPhoneNumber: string;
      otherPhonePlaceholder: string;
      addAdditionalPhone: string;
      continue: string;
      errors: {
        fullNameRequired: string;
        emailRequired: string;
        invalidEmail: string;
        phoneRequired: string;
        otherFullNameRequired: string;
        otherPhoneRequired: string;
      };
    };
  };
  luggage: {
    title: string;
    regularLuggage: string;
    specialItems: string;
    large: {
      title: string;
      dimensions: string;
      max: string;
      description: string;
    };
    small: {
      title: string;
      dimensions: string;
      max: string;
      description: string;
    };
    hand: {
      title: string;
      dimensions: string;
      description: string;
      max: string;
    };
    special: {
      foldableWheelchair: {
        title: string;
        description: string;
      };
      rollator: {
        title: string;
        description: string;
      };
      pets: {
        title: string;
        description: string;
      };
      bicycle: {
        title: string;
        description: string;
      };
      winterSports: {
        title: string;
        description: string;
      };
      stroller: {
        title: string;
        description: string;
      };
      golfBag: {
        title: string;
        description: string;
      };
      waterSports: {
        title: string;
        description: string;
      };
      maxTotal: string;
    };
    continue: string;
    back: string;
  };
  offers: {
    title: string;
    subtitle: string;
    regularTaxi: {
      name: string;
      features: {
        passengers: string;
        luggage: string;
        freeTransport: string;
        doorService: string;
        fixedPrice: string;
      };
    };
    vanTaxi: {
      name: string;
      features: {
        passengers: string;
        luggage: string;
        freeTransport: string;
        doorService: string;
        fixedPrice: string;
        extraSpace: string;
      };
    };
    select: string;
    selected: string;
    continue: string;
    back: string;
    priceInfo: {
      fixed: string;
      estimated: string;
      includes: string;
      allTaxes: string;
      freeCancellation: string;
      luggageIncluded: string;
    };
    oneWayPrice: string;
    returnTotalPrice: string;
    returnTripNote: string;
  };
  units: {
    km: string;
  };
  common: {
    loading: string;
  };
  overview: {
    outbound: string;
    return: string;
    schedule: string;
    pickup: string;
    passengerDetails: string;
    bookedBy: string;
    passenger: string;
    luggage: string;
    flightNumber: string;
    additionalNotes: string;
    actions: string;
    editRoute: string;
    editLuggage: string;
    editVehicle: string;
    editPersonalInfo: string;
    duplicate: string;
    delete: string;
    regularTaxi: string;
    vanTaxi: string;
    hideDetails: string;
    showDetails: string;
    noBookings: string;
    title: string;
  };
}