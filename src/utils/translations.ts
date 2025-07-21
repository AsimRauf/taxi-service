import { WebsiteTranslations } from '@/types/translations';
import { TFunction } from 'next-i18next';

export const createTranslationsObject = (t: TFunction, locale: string): WebsiteTranslations => ({
  travelInfo: {
    errors: {
      requiredLocations: t('travelInfo.errors.requiredLocations'),
      invalidPrice: t('travelInfo.errors.invalidPrice'),
      invalidPickupTime: t('travelInfo.errors.invalidPickupTime'),
      invalidReturnTime: t('travelInfo.errors.invalidReturnTime'),
      invalidDates: t('travelInfo.errors.invalidDates'),
      pickupDateRequired: t('travelInfo.errors.pickupDateRequired'),
      returnDateRequired: t('travelInfo.errors.returnDateRequired'),
      invalidStopover: t('travelInfo.errors.invalidStopover'),
      maxStopovers: t('travelInfo.errors.maxStopovers'),
      duplicateLocation: t('travelInfo.errors.duplicateLocation'),
      invalidPassengers: t('travelInfo.errors.invalidPassengers'),
      invalidLuggage: t('travelInfo.errors.invalidLuggage'),
      invalidVehicle: t('travelInfo.errors.invalidVehicle'),
      invalidRoute: t('travelInfo.errors.invalidRoute')
    }
  },
  nav: {
    login: t('nav.login'),
    services: t('nav.services'),
    contact: t('nav.contact'),
    aboutUs: t('nav.aboutUs'),
    service1: t('nav.service1'),
    service2: t('nav.service2'),
    profile: t('nav.profile'),
    signOut: t('nav.signOut')
  },
  auth: {
    createAccount: t('auth.createAccount'),
    fullName: t('auth.fullName'),
    nameRequired: t('auth.nameRequired'),
    emailRequired: t('auth.emailRequired'),
    invalidEmail: t('auth.invalidEmail'),
    phoneRequired: t('auth.phoneRequired'),
    invalidPhone: t('auth.invalidPhone'),
    passwordRequired: t('auth.passwordRequired'),
    passwordLength: t('auth.passwordLength'),
    passwordMatch: t('auth.passwordMatch'),
    genericError: t('auth.genericError'),
    creating: t('auth.creating'),
    create: t('auth.create'),
    haveAccount: t('auth.haveAccount'),
    signin: t('auth.signin'),
    password: t('auth.password'),
    phoneNumber: t('auth.phoneNumber'),
    confirmPassword: t('auth.confirmPassword'),
    registrationError: t('auth.registrationError')
  },
  hero: {
    title: t('hero.title'),
    subtitle: t('hero.subtitle'),
    formTitle: t('hero.formTitle'),
    features: {
      freeCancellation: t('hero.features.freeCancellation'),
      privateTaxi: t('hero.features.privateTaxi'),
      freeBaggage: t('hero.features.freeBaggage')
    },
    pickupPlaceholder: t('hero.pickupPlaceholder'),
    destinationPlaceholder: t('hero.destinationPlaceholder'),
    addStopover: t('hero.addStopover'),
    swapLocations: t('hero.swapLocations'),
    stopover: t('hero.stopover'),
    removeStopover: t('hero.removeStopover'),
    pickupDateTime: t('hero.pickupDateTime'),
    returnTrip: t('hero.returnTrip'),
    returnDateTime: t('hero.returnDateTime'),
    luggage: t('hero.luggage'),
    travelers: t('hero.travelers'),
    calculate: t('hero.calculate'),
    returnPlaceholder: t('hero.returnPlaceholder')
  },
  booking: {
    title: t('booking.title'),
    from: t('booking.from'),
    to: t('booking.to'),
    distance: t('booking.distance'),
    duration: t('booking.duration'),
    passengers: t('booking.passengers'),
    luggage: t('booking.luggage'),
    yes: t('booking.yes'),
    no: t('booking.no'),
    pickupTime: t('booking.pickupTime'),
    returnTime: t('booking.returnTime'),
    totalPrice: t('booking.totalPrice'),
    returnIncluded: t('booking.returnIncluded'),
    back: t('booking.back'),
    bookNow: t('booking.bookNow'),
    via: t('booking.via'),
    exactLocation: t('booking.exactLocation'),
    businessName: t('booking.businessName'),
    streetName: t('booking.streetName'),
    houseNumber: t('booking.houseNumber'),
    postalCode: t('booking.postalCode'),
    city: t('booking.city'),
    enterStreetName: t('booking.enterStreetName'),
    enterHouseNumber: t('booking.enterHouseNumber'),
    enterBusinessName: t('booking.enterBusinessName'),
    locationDetails: t('booking.locationDetails'),
    addExactLocation: t('booking.addExactLocation'),
    errors: {
      streetRequired: t('booking.errors.streetRequired'),
      houseNumberRequired: t('booking.errors.houseNumberRequired'),
      exactAddressRequired: t('booking.errors.exactAddressRequired'),
      selectLocationFirst: t('booking.errors.selectLocationFirst')
    },
    personalInfo: {
      title: t('booking.personalInfo.title'),
      fullName: t('booking.personalInfo.fullName'),
      fullNamePlaceholder: t('booking.personalInfo.fullNamePlaceholder'),
      email: t('booking.personalInfo.email'),
      emailPlaceholder: t('booking.personalInfo.emailPlaceholder'),
      phoneNumber: t('booking.personalInfo.phoneNumber'),
      phonePlaceholder: t('booking.personalInfo.phonePlaceholder'),
      additionalPhone: t('booking.personalInfo.additionalPhone'),
      additionalPhonePlaceholder: t('booking.personalInfo.additionalPhonePlaceholder'),
      bookingForOther: t('booking.personalInfo.bookingForOther'),
      otherFullName: t('booking.personalInfo.otherFullName'),
      otherFullNamePlaceholder: t('booking.personalInfo.otherFullNamePlaceholder'),
      otherPhoneNumber: t('booking.personalInfo.otherPhoneNumber'),
      otherPhonePlaceholder: t('booking.personalInfo.otherPhonePlaceholder'),
      addAdditionalPhone: t('booking.personalInfo.addAdditionalPhone'),
      continue: t('booking.personalInfo.continue'),
      errors: {
        fullNameRequired: t('booking.personalInfo.errors.fullNameRequired'),
        emailRequired: t('booking.personalInfo.errors.emailRequired'),
        invalidEmail: t('booking.personalInfo.errors.invalidEmail'),
        phoneRequired: t('booking.personalInfo.errors.phoneRequired'),
        otherFullNameRequired: t('booking.personalInfo.errors.otherFullNameRequired'),
        otherPhoneRequired: t('booking.personalInfo.errors.otherPhoneRequired'),
      }
    }
  },
  luggage: {
    title: t('luggage.title'),
    regularLuggage: t('luggage.regularLuggage'),
    specialItems: t('luggage.specialItems'),
    large: {
      title: t('luggage.large.title'),
      dimensions: t('luggage.large.dimensions'),
      max: t('luggage.large.max'),
      description: t('luggage.large.description')
    },
    small: {
      title: t('luggage.small.title'),
      dimensions: t('luggage.small.dimensions'),
      max: t('luggage.small.max'),
      description: t('luggage.small.description')
    },
    hand: {
      title: t('luggage.hand.title'),
      dimensions: t('luggage.hand.dimensions'),
      description: t('luggage.hand.description'),
      max: t('luggage.hand.max')
    },
    special: {
      foldableWheelchair: {
        title: t('luggage.special.foldableWheelchair.title'),
        description: t('luggage.special.foldableWheelchair.description')
      },
      rollator: {
        title: t('luggage.special.rollator.title'),
        description: t('luggage.special.rollator.description')
      },
      pets: {
        title: t('luggage.special.pets.title'),
        description: t('luggage.special.pets.description')
      },
      bicycle: {
        title: t('luggage.special.bicycle.title'),
        description: t('luggage.special.bicycle.description')
      },
      winterSports: {
        title: t('luggage.special.winterSports.title'),
        description: t('luggage.special.winterSports.description')
      },
      stroller: {
        title: t('luggage.special.stroller.title'),
        description: t('luggage.special.stroller.description')
      },
      golfBag: {
        title: t('luggage.special.golfBag.title'),
        description: t('luggage.special.golfBag.description')
      },
      waterSports: {
        title: t('luggage.special.waterSports.title'),
        description: t('luggage.special.waterSports.description')
      },
      maxTotal: t('luggage.special.maxTotal')
    },
    continue: t('luggage.continue'),
    back: t('luggage.back')
  },
  offers: {
    title: t('offers.title'),
    subtitle: t('offers.subtitle'),
    regularTaxi: {
      name: t('offers.regularTaxi.name'),
      features: {
        passengers: t('offers.regularTaxi.features.passengers'),
        luggage: t('offers.regularTaxi.features.luggage'),
        freeTransport: t('offers.regularTaxi.features.freeTransport'),
        doorService: t('offers.regularTaxi.features.doorService'),
        fixedPrice: t('offers.regularTaxi.features.fixedPrice')
      }
    },
    vanTaxi: {
      name: t('offers.vanTaxi.name'),
      features: {
        passengers: t('offers.vanTaxi.features.passengers'),
        luggage: t('offers.vanTaxi.features.luggage'),
        freeTransport: t('offers.vanTaxi.features.freeTransport'),
        doorService: t('offers.vanTaxi.features.doorService'),
        fixedPrice: t('offers.vanTaxi.features.fixedPrice'),
        extraSpace: t('offers.vanTaxi.features.extraSpace')
      }
    },
    select: t('offers.select'),
    selected: t('offers.selected'),
    continue: t('offers.continue'),
    back: t('offers.back'),
    priceInfo: {
      fixed: t('offers.priceInfo.fixed'),
      estimated: t('offers.priceInfo.estimated'),
      includes: t('offers.priceInfo.includes'),
      allTaxes: t('offers.priceInfo.allTaxes'),
      freeCancellation: t('offers.priceInfo.freeCancellation'),
      luggageIncluded: t('offers.priceInfo.luggageIncluded')
    },
    oneWayPrice: t('offers.oneWayPrice'),
    returnTotalPrice: t('offers.returnTotalPrice'),
    returnTripNote: t('offers.returnTripNote')
  },
  units: {
    km: t('units.km')
  },
  common: {
    loading: t('common.loading'),
    save: t('common.save'),
    cancel: t('common.cancel'),
    required: t('common.required')
  },
  overview: {
    outbound: t('overview.outbound'),
    return: t('overview.return'),
    schedule: t('overview.schedule'),
    pickup: t('overview.pickup'),
    passengerDetails: t('overview.passengerDetails'),
    bookedBy: t('overview.bookedBy'),
    passenger: t('overview.passenger'),
    luggage: t('overview.luggage'),
    flightNumber: t('overview.flightNumber'),
    additionalNotes: t('overview.additionalNotes'),
    actions: t('overview.actions'),
    editRoute: t('overview.editRoute'),
    editLuggage: t('overview.editLuggage'),
    editVehicle: t('overview.editVehicle'),
    editPersonalInfo: t('overview.editPersonalInfo'),
    duplicate: t('overview.duplicate'),
    delete: t('overview.delete'),
    regularTaxi: t('overview.regularTaxi'),
    vanTaxi: t('overview.vanTaxi'),
    hideDetails: t('overview.hideDetails'),
    showDetails: t('overview.showDetails'),
    noBookings: t('overview.noBookings'),
    title: t('overview.title')
  },
  features: {
    prices: {
      title: t('features.prices.title'),
      description: t('features.prices.description')
    },
    coverage: {
      title: t('features.coverage.title'),
      description: t('features.coverage.description')
    },
    reliability: {
      title: t('features.reliability.title'),
      description: t('features.reliability.description')
    },
    heading: t('features.heading'),
    description1: t('features.description1'),
    description2: t('features.description2'),
    imageAlt: t('features.imageAlt'),
    learnMore: t('features.learnMore')
  },
  services: {
    title: t('services.title'),
    subtitle: t('services.subtitle'),
    local: {
      title: t('services.local.title'),
      description: t('services.local.description')
    },
    airport: {
      title: t('services.airport.title'),
      description: t('services.airport.description'),
      viewOptions: t('services.airport.viewOptions'),
      airports: {
        amsterdam: t('services.airport.airports.amsterdam'),
        rotterdam: t('services.airport.airports.rotterdam'),
        eindhoven: t('services.airport.airports.eindhoven')
      }
    },
    care: {
      title: t('services.care.title'),
      description: t('services.care.description')
    },
    business: {
      title: t('services.business.title'),
      description: t('services.business.description')
    },
    popular: {
      title: t('services.popular.title'),
      description: t('services.popular.description'),
      viewOptions: t('services.popular.viewOptions'),
      locations: {
        walibi: t('services.popular.locations.walibi'),
        efteling: t('services.popular.locations.efteling'),
        gelredome: t('services.popular.locations.gelredome')
      }
    },
    event: {
      title: t('services.event.title'),
      description: t('services.event.description')
    }
  },
  
  locale: locale
});