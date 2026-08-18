const { gql } = require('apollo-server-express')

const typeDefs = gql`
  type CircleBounds {
    radius: Float
  }
  input CircleBoundsInput {
  radius: Float
}
  type RestaurantDeliveryZoneInfo {
  address: String
  city: String
  postCode: String
  deliveryBounds: Polygon
  circleBounds: CircleBounds
  location: Point
  boundType: String
}
  type Location {
    location: Point
    deliveryAddress: String
  }
  type Address {
    _id: ID!
    location: Point
    deliveryAddress: String!
    details: String
    label: String!
    selected: Boolean
  }

  type OrderAddress {
    location: Point
    deliveryAddress: String!
    details: String
    label: String!
    id: String
  }

  type Item {
    _id: ID!
    title: String!
    food: String!
    description: String!
    image: String
    quantity: Int!
    variation: ItemVariation!
    addons: [ItemAddon!]
    specialInstructions: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    _id: ID!
    title: String!
    image: String
    isActive: Boolean
    foods: [Food!]
    createdAt: String!
    updatedAt: String!
  }

  type SubCategory {
    _id: ID!
    title: String!
    parentCategoryId: String!
    isActive: Boolean
    createdAt: String
    updatedAt: String
  }

  type ReviewData {
    reviews: [Review]
    ratings: Float
    total: Int
  }

  type Owner {
    _id: String
    email: String
    isActive: Boolean
  }

  type OrdersWithCashOnDeliveryInfo {
    orders: [Order!]!
    totalAmountCashOnDelivery: Float!
    countCashOnDeliveryOrders: Int!
  }

  type Restaurant {
    _id: ID!
    orderId: Int!
    orderPrefix: String
    name: String!
    image: String
    address: String
    phone: String
    location: Point
    categories: [Category!]
    options: [Option!]
    addons: [Addon!]
    reviewData: ReviewData
    zone: Zone
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    sections: [String!]
    rating: Float
    isActive: Boolean!
    isAvailable: Boolean!
    openingTimes: [OpeningTimes]
    slug: String
    stripeDetailsSubmitted: Boolean
    commissionRate: Float
    owner: Owner
    deliveryBounds: Polygon
    boundType: String
    circleBounds: CircleBounds
    tax: Float
    salesTax: Float
    notificationToken: String
    enableNotification: Boolean
    shopType: String
    cuisines: [String]
    logo: String
    currentWalletAmount: Float
    totalWalletAmount: Float
    withdrawnWalletAmount: Float
    bussinessDetails: BussinessDetails
    unique_restaurant_id: String
  }

  type OpeningTimes {
    day: String!
    times: [Timings]
  }

  type Timings {
    startTime: [String]
    endTime: [String]
  }

  type Variation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float
    addons: [String!]
    isOutOfStock: Boolean
  }

  type CartVariation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float
    addons: [CartAddon!]
  }

  type ItemVariation {
    _id: ID!
    title: String!
    price: Float!
    discounted: Float!
  }

  type Food {
    _id: ID!
    title: String!
    description: String!
    variations: [Variation!]!
    image: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    isOutOfStock: Boolean
    isFeatured: Boolean
    subCategory: String
  }

  type CartFood {
    _id: ID!
    title: String!
    description: String!
    variation: CartVariation!
    image: String!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type BussinessDetails {
    bankName: String
    accountName: String
    accountCode: String
    accountNumber: String
    bussinessRegNo: String
    companyRegNo: String
    taxRate: Float
  }

  input BussinessDetailsInput {
    bankName: String
    accountName: String
    accountCode: String
    accountNumber: String
    bussinessRegNo: String
    companyRegNo: String
    taxRate: Float
  }

  type Rider {
    _id: ID!
    name: String!
    email: String
    username: String!
    phone: String!
    image: String
    available: Boolean!
    zone: Zone!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    location: Point
    accountNumber: String
    currentWalletAmount: Float
    totalWalletAmount: Float
    withdrawnWalletAmount: Float
    vehicleType: String
    assigned: [String]
    bussinessDetails: BussinessDetails
    licenseDetails: LicenseDetails
    vehicleDetails: VehicleDetails
    timeZone: String
    workSchedule: [DaySchedule!]
  }

  type LicenseDetails {
    number: String
    image: String
    expiryDate: String
  }

  type VehicleDetails {
    number: String
    image: String
  }

  type TimeSlot {
    startTime: String!
    endTime: String!
  }

  type DaySchedule {
    day: String!
    enabled: Boolean!
    slots: [TimeSlot!]!
  }

  input LicenseDetailsInput {
    number: String
    image: String
    expiryDate: String
  }

  input VehicleDetailsInput {
    number: String
    image: String
  }

  input TimeSlotInput {
    startTime: String!
    endTime: String!
  }

  input DayScheduleInput {
    day: String!
    enabled: Boolean!
    slots: [TimeSlotInput!]!
  }

  type UploadImageResponse {
    imageUrl: String!
  }

  type Staff {
    _id: ID!
    name: String!
    email: String!
    password: String!
    plainPassword: String!
    phone: String
    isActive: Boolean!
    permissions: [String]
    userType: String
    createdAt: String
    updatedAt: String
  }

  type User {
    _id: ID
    name: String
    phone: String
    phoneIsVerified: Boolean
    email: String
    emailIsVerified: Boolean
    password: String
    isActive: Boolean
    isOrderNotification: Boolean
    isOfferNotification: Boolean
    createdAt: String
    updatedAt: String
    addresses: [Address!]
    notificationToken: String
    favourite: [String!]
    userType: String
    status: String
    notes: String
    lastLogin: String
  }
  type Banner {
    _id: ID!
    title: String!
    description: String
    action: String
    screen: String
    file: String
    parameters: String
  }
  input BannerInput {
    _id: String
    title: String!
    description: String
    action: String
    screen: String
    file: String
    parameters: String
  }
  type ShopType {
    _id: ID!
    title: String!
    image: String
    isActive: Boolean!
  }
  input CreateShopTypeInput {
    title: String!
    image: String
  }
  input UpdateShopTypeInput {
    _id: String!
    title: String
    image: String
    isActive: Boolean
  }
  input FetchShopTypeFilter {
    title: String
    isActive: Boolean
  }
  input FetchUniqueShopTypeInput {
    _id: String
    title: String
  }
  input PaginationInput {
    page: Int
    pageSize: Int
  }
  enum DeleteTypeEnum {
    SOFT
    HARD
  }
  enum UserTypeEnum {
    RIDER
    STORE
  }
  enum OrderTypeEnum {
    DELIVERY
    PICKUP
  }
  enum PaymentMethodEnum {
    COD
    PAYPAL
    STRIPE
  }
  input WalletPaginationInput {
    pageSize: Int
    pageNo: Int
  }
  input DateFilterInput {
    starting_date: String
    ending_date: String
  }
  type FetchShopTypesResponse {
    data: [ShopType!]!
    total: Int!
    page: Int!
    pageSize: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }
  type Configuration {
    _id: String!
    pushToken: String
    email: String
    emailName: String
    password: String
    enableEmail: Boolean
    clientId: String
    clientSecret: String
    sandbox: Boolean
    publishableKey: String
    secretKey: String
    currency: String
    currencySymbol: String
    deliveryRate: Float
    singleVendorId: String
    costType: String
    twilioAccountSid: String
    twilioAuthToken: String
    twilioPhoneNumber: String
    twilioEnabled: Boolean
    formEmail: String
    sendGridApiKey: String
    sendGridEnabled: Boolean
    sendGridEmail: String
    sendGridEmailName: String
    sendGridPassword: String
    dashboardSentryUrl: String
    webSentryUrl: String
    apiSentryUrl: String
    customerAppSentryUrl: String
    restaurantAppSentryUrl: String
    riderAppSentryUrl: String
    googleApiKey: String
    cloudinaryUploadUrl: String
    cloudinaryApiKey: String
    webAmplitudeApiKey: String
    appAmplitudeApiKey: String
    webClientID: String
    androidClientID: String
    iOSClientID: String
    expoClientID: String
    googleMapLibraries: String
    googleColor: String
    termsAndConditions: String
    privacyPolicy: String
    testOtp: String
    firebaseKey: String
    authDomain: String
    projectId: String
    storageBucket: String
    msgSenderId: String
    appId: String
    measurementId: String
    isPaidVersion: Boolean
    skipMobileVerification: Boolean
    skipEmailVerification: Boolean
    enableRiderDemo: Boolean
    enableRestaurantDemo: Boolean
    enableAdminDemo: Boolean
  }
  type AppVersion {
    android: String
    ios: String
  }
  input AppTypeInput {
    android: String
    ios: String
  }
  type AppVersions {
    customerAppVersion: AppVersion
    riderAppVersion: AppVersion
    restaurantAppVersion: AppVersion
  }
  type OrderStatus {
    pending: String!
    preparing: String
    picked: String
    delivered: String
    cancelled: String
  }
  type Order {
    _id: ID!
    orderId: String!
    restaurant: RestaurantDetail!
    deliveryAddress: OrderAddress!
    items: [Item!]!
    user: User
    orderSource: String
    customerName: String
    customerPhone: String
    paymentMethod: String
    paidAmount: Float
    orderAmount: Float
    status: Boolean
    paymentStatus: String!
    orderStatus: String
    reason: String
    instructions: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    deliveryCharges: Float
    tipping: Float!
    taxationAmount: Float!
    rider: Rider
    review: Review
    zone: Zone!
    completionTime: String
    orderDate: String!
    expectedTime: String
    preparationTime: String
    isPickedUp: Boolean!
    isReadyToPickUp: Boolean
    acceptedAt: String
    pickedAt: String
    deliveredAt: String
    cancelledAt: String
    assignedAt: String
    isRinged: Boolean!
    isRiderRinged: Boolean!
    hasUnreadChatForRider: Boolean
  }

  type MyOrders {
    userId: String!
    orders: [Order!]
  }

  type RiderOrders {
    riderId: String!
    orders: [Order!]
  }

  type OrdersByUserResponse {
    orders: [Order!]!
    totalCount: Int!
    totalPages: Int!
    currentPage: Int!
    nextPage: Int
    prevPage: Int
  }

  type RestaurantDetail {
    _id: ID!
    name: String!
    image: String!
    address: String!
    location: Point
    slug: String
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    name: String
    phone: String
    phoneIsVerified: Boolean
    email: String
    emailIsVerified: Boolean
    picture: String
    addresses: Location
    isNewUser: Boolean
    isActive: Boolean!
  }

  type OwnerAuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    email: String!
    userType: String!
    restaurants: [Restaurant]!
    pushToken: String
    name: String
  }

  type OwnerData {
    _id: ID!
    email: String!
    
    userType: String!
    firstName: String
    lastName: String
    phoneNumber: String
    image: String
    restaurants: [Restaurant]!
    pushToken: String
  }

  type Review {
    _id: ID!
    order: Order!
    restaurant: Restaurant!
    rating: Int!
    description: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type ReviewOutput {
    _id: ID!
    order: String!
    restaurant: String!
    review: Review!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type Admin {
    userId: String!
    email: String!
    name: String!
    token: String!
  }

  type ForgotPassword {
    result: Boolean!
  }

  type Option {
    _id: String!
    title: String!
    description: String
    price: Float!
  }
  type ItemOption {
    _id: String!
    title: String!
    description: String
    price: Float!
  }

  type Addon {
    _id: String!
    options: [String!]
    defaultOptions: [String!]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type CartAddon {
    _id: String!
    options: [Option!]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type ItemAddon {
    _id: String!
    options: [ItemOption!]
    defaultOptions: [String]
    title: String!
    description: String
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  type DashboardData {
    totalOrders: Int!
    totalSales: Float!
  }

  type DashboardUsersData {
    usersCount: Int!
    vendorsCount: Int!
    restaurantsCount: Int!
    ridersCount: Int!
  }

  type DashboardSales {
    orders: [SalesValues!]
  }
  type DashboardOrders {
    orders: [OrdersValues!]
  }

  type RestaurantDashboardOrdersSalesStats {
    totalOrders: Int!
    totalSales: Float!
    totalCODOrders: Int!
    totalCardOrders: Int!
  }

  type RestaurantDashboardSalesOrderCountByYear {
    salesAmount: [Float!]!
    ordersCount: [Int!]!
  }

  type PaymentMethodBreakdownData {
    total_orders: Int!
    total_sales: Float!
    total_sales_without_delivery: Float!
    total_delivery_fee: Float!
  }

  type PaymentMethodBreakdownEntry {
    _type: String!
    data: PaymentMethodBreakdownData!
  }

  type DashboardOrderSalesDetailsByPaymentMethod {
    all: [PaymentMethodBreakdownEntry!]!
    cod: [PaymentMethodBreakdownEntry!]!
    card: [PaymentMethodBreakdownEntry!]!
  }

  type SalesValues {
    day: String!
    amount: Float!
  }
  type OrdersValues {
    day: String!
    count: Int!
  }
  type Coupon {
    _id: String!
    title: String!
    discount: Float!
    enabled: Boolean!
    restaurant: ID
  }
  type Taxation {
    _id: String!
    taxationCharges: Float
    enabled: Boolean!
  }
  type Tipping {
    _id: String!
    tipVariations: [Float]
    enabled: Boolean!
  }

  type OfferInfo {
    _id: String!
    name: String!
    tag: String!
    restaurants: [String]
  }
  type SectionInfo {
    _id: String!
    name: String!
    restaurants: [String]
  }
  type Offer {
    _id: String!
    name: String!
    tag: String!
    restaurants: [OfferRestaurant]
  }

  type OfferRestaurant {
    _id: String!
    name: String!
    image: String!
    address: String!
    location: Point
    categories: [Category]
  }
  type SectionRestaurant {
    _id: String!
    name: String!
  }
  type Section {
    _id: String!
    name: String!
    enabled: Boolean!
    restaurants: [SectionRestaurant]
  }

  type SubscriptionOrders {
    restaurantId: String
    userId: String
    order: Order!
    origin: String!
  }

  type Subscription_Zone_Orders {
    zoneId: String
    order: Order!
    origin: String!
  }

  type NearByData {
    restaurants: [Restaurant!]
    offers: [OfferInfo!]
    sections: [SectionInfo!]
  }

  type RestaurantAuth {
    token: String!
    restaurantId: String!
  }

  type Polygon {
    coordinates: [[[Float!]]]
  }

  type Point {
    coordinates: [Float!]
  }

  type Zone {
    _id: String!
    title: String!
    tax: Float
    description: String!
    location: Polygon
    isActive: Boolean!
  }

  type WithdrawRequest {
    _id: String!
    requestId: String!
    requestAmount: Float!
    requestTime: String!
    rider: Rider
    store: Restaurant
    userType: String
    status: String!
    createdAt: String
  }

  type PlatformEarningsDetail {
    marketplaceCommission: Float
    deliveryCommission: Float
    tax: Float
    platformFee: Float
    totalEarnings: Float
  }

  type RiderEarningsDetail {
    riderId: Rider
    deliveryFee: Float
    tip: Float
    totalEarnings: Float
  }

  type StoreEarningsDetail {
    storeId: Restaurant
    orderAmount: Float
    totalEarnings: Float
  }

  type EarningEntry {
    _id: ID!
    orderId: String
    orderType: String
    paymentMethod: String
    createdAt: String
    updatedAt: String
    platformEarnings: PlatformEarningsDetail
    riderEarnings: RiderEarningsDetail
    storeEarnings: StoreEarningsDetail
  }

  type GrandTotalEarnings {
    platformTotal: Float
    riderTotal: Float
    storeTotal: Float
  }

  type EarningsData {
    earnings: [EarningEntry!]!
    grandTotalEarnings: GrandTotalEarnings
  }

  type EarningsResponse {
    success: Boolean!
    message: String
    data: EarningsData
    pagination: Pagination
  }

  type Transaction {
    _id: ID!
    transactionId: String
    userType: String
    rider: Rider
    store: Restaurant
    amountCurrency: String
    amountTransferred: Float
    status: String
    toBank: BussinessDetailsSnapshot
    createdAt: String
  }

  type BussinessDetailsSnapshot {
    accountName: String
    bankName: String
    accountNumber: String
    accountCode: String
  }

  type TransactionHistoryResponse {
    success: Boolean!
    message: String
    data: [Transaction!]!
    pagination: Pagination
  }

  type StoreEarningsOrderDetails {
    orderType: String
    orderId: String
    paymentMethod: String
  }

  type StoreEarningsArrayItem {
    orderDetails: StoreEarningsOrderDetails
    totalOrderAmount: Float
    totalEarnings: Float
    date: String
  }

  type StoreDailyEarnings {
    _id: String!
    date: String
    totalEarningsSum: Float!
    totalOrderAmount: Float!
    totalDeliveries: Int!
    earningsArray: [StoreEarningsArrayItem!]!
  }

  type StoreEarningsGraphResponse {
    totalCount: Int!
    earnings: [StoreDailyEarnings!]!
  }

  type RiderEarningsOrderDetails {
    orderType: String
    orderId: String
    paymentMethod: String
  }

  type RiderEarningsArrayItem {
    orderDetails: RiderEarningsOrderDetails
    totalEarnings: Float
    deliveryFee: Float
    tip: Float
    date: String
  }

  type RiderDailyEarnings {
    _id: String!
    date: String
    totalEarningsSum: Float!
    totalTipsSum: Float!
    totalHours: Float
    totalDeliveries: Int!
    earningsArray: [RiderEarningsArrayItem!]!
  }

  type RiderEarningsGraphResponse {
    totalCount: Int!
    earnings: [RiderDailyEarnings!]!
  }

  input EmailConfigurationInput {
    email: String!
    password: String!
    emailName: String!
    enableEmail: Boolean!
  }

  input TwilioConfigurationInput {
    twilioAccountSid: String!
    twilioAuthToken: String!
    twilioPhoneNumber: String!
    twilioEnabled: Boolean!
  }
  input FormEmailConfigurationInput {
    formEmail: String!
  }
  input SendGridConfigurationInput {
    sendGridApiKey: String!
    sendGridEnabled: Boolean!
    sendGridEmail: String!
    sendGridEmailName: String!
    sendGridPassword: String!
  }

  input SentryConfigurationInput {
    dashboardSentryUrl: String!
    webSentryUrl: String!
    apiSentryUrl: String!
    customerAppSentryUrl: String!
    restaurantAppSentryUrl: String!
    riderAppSentryUrl: String!
  }
  input GoogleApiKeyConfigurationInput {
    googleApiKey: String!
  }
  input CloudinaryConfigurationInput {
    cloudinaryUploadUrl: String!
    cloudinaryApiKey: String!
  }
  input AmplitudeApiKeyConfigurationInput {
    webAmplitudeApiKey: String!
    appAmplitudeApiKey: String!
  }
  input GoogleClientIDConfigurationInput {
    webClientID: String!
    androidClientID: String!
    iOSClientID: String!
    expoClientID: String!
  }
  input WebConfigurationInput {
    googleMapLibraries: String!
    googleColor: String!
  }
  input AppConfigurationsInput {
    termsAndConditions: String!
    privacyPolicy: String!
    testOtp: String!
  }

  input FirebaseConfigurationInput {
    firebaseKey: String!
    authDomain: String!
    projectId: String!
    storageBucket: String!
    msgSenderId: String!
    appId: String!
    measurementId: String!
  }

  input PaypalConfigurationInput {
    clientId: String!
    clientSecret: String!
    sandbox: Boolean!
  }

  input StripeConfigurationInput {
    publishableKey: String!
    secretKey: String!
  }

  input CurrencyConfigurationInput {
    currency: String!
    currencySymbol: String!
  }

  input VerificationConfigurationInput {
    skipEmailVerification: Boolean!
    skipMobileVerification: Boolean!
  }

  input DemoConfigurationInput {
    enableRiderDemo: Boolean!
    enableRestaurantDemo: Boolean!
    enableAdminDemo: Boolean!
  }

  input UpdateUser {
    name: String!
    phone: String
    phoneIsVerified: Boolean
    emailIsVerified: Boolean
  }
  input AddonsInput {
    _id: String
    options: [String!]
  }
  input OrderInput {
    food: String!
    quantity: Int!
    variation: String!
    addons: [AddonsInput!]
    specialInstructions: String
  }

  input POSOrderInput {
    restaurant: String!
    orderInput: [OrderInput!]!
    instructions: String
    customerName: String
    customerPhone: String
  }

  input VariationInput {
    _id: String
    title: String
    price: Float!
    discounted: Float
    addons: [String!]
    isOutOfStock: Boolean
  }

  input FoodInput {
    _id: String
    restaurant: String!
    category: String!
    title: String!
    description: String
    image: String
    variations: [VariationInput!]!
    subCategory: String
    isOutOfStock: Boolean
    isFeatured: Boolean
    isActive: Boolean
  }

  input RiderInput {
    _id: String
    name: String!
    email: String
    username: String!
    password: String!
    phone: String!
    image: String
    available: Boolean!
    zone: String!
    accountNumber: String
    vehicleType: String
  }

  input UserInput {
    phone: String
    email: String
    password: String
    name: String

    notificationToken: String
    appleId: String
    emailIsVerified: Boolean
    isPhoneExists: Boolean
  }

  input StaffInput {
    _id: String
    name: String!
    email: String!
    password: String
    phone: String
    isActive: Boolean
    permissions: [String]
  }

  input OwnerInput {
    email: String
    password: String
  }

input VendorInput {
  _id: ID
  email: String
  password: String
  firstName: String
  lastName: String
  phoneNumber: String
  image: String
}
input VendorProfileUpdateInput {
firstName: String
lastName: String
phoneNumber: String
image: String
}
  input ReviewInput {
    order: String
    rating: Int
    description: String
  }

  input PointInput {
    coordinates: [Float!]
  }

  input LocationInput {
    location: PointInput
    deliveryAddress: String
  }

  input CategoryInput {
    _id: String
    title: String!
    restaurant: String!
    image: String
    isActive: Boolean
  }

  input SubCategoryInput {
    title: String!
    parentCategoryId: String!
    isActive: Boolean
  }

  input RestaurantInput {
    name: String!
    username: String
    password: String
    image: String
    address: String
    categories: [CategoryInput!]
    reviews: [ReviewInput!]
    deliveryTime: Int
    minimumOrder: Int
    salesTax: Float
    shopType: String
    cuisines: [String]
  }

  input RestaurantProfileInput {
    _id: String
    name: String!
    image: String
    logo: String
    address: String
    phone: String
    orderPrefix: String
    username: String
    password: String
    deliveryTime: Int
    minimumOrder: Int
    salesTax: Float
    shopType: String
    cuisines: [String]
  }

  input OptionInput {
    _id: String
    title: String!
    description: String
    price: Float!
  }

  input editOptionInput {
    restaurant: String!
    options: OptionInput
  }

  input CreateOptionInput {
    restaurant: String
    options: [OptionInput!]!
  }

  input AddonInput {
    restaurant: String!
    addons: [createAddonInput!]!
  }
  input editAddonInput {
    restaurant: String!
    addons: createAddonInput!
  }
  input createAddonInput {
    title: String!
    _id: String
    description: String
    options: [String]
    defaultOptions: [String]
    quantityMinimum: Int!
    quantityMaximum: Int!
  }

  input CouponInput {
    _id: String
    title: String!
    discount: Float!
    enabled: Boolean
  }
  input TippingInput {
    _id: String
    tipVariations: [Float]
    enabled: Boolean
  }
  input TaxationInput {
    _id: String
    taxationCharges: Float
    enabled: Boolean
  }
  input AddressInput {
    _id: String
    longitude: String
    latitude: String
    deliveryAddress: String!
    details: String
    label: String!
  }
  input CartFoodInput {
    _id: String
    variation: CartVariationInput!
  }
  input CartVariationInput {
    _id: String
    addons: [CartAddonInput!]
  }
  input CartAddonInput {
    _id: String
    options: [String!]
  }
  input OfferInput {
    _id: String
    name: String!
    tag: String!
    restaurants: [String]
  }
  input SectionInput {
    _id: String
    name: String!
    enabled: Boolean!
    restaurants: [String]
  }

  input ZoneInput {
    _id: String
    title: String!
    description: String!
    coordinates: [[[Float!]]]
  }

  input TimingsInput {
    day: String!
    times: [TimesInput]
  }

  input TimesInput {
    startTime: [String]
    endTime: [String]
  }

  input FormSubmissionInput {
    name: String!
    email: String!
    message: String!
  }

  input CuisineInput {
    _id: String
    name: String!
    description: String
    image: String
    shopType: String
  }

  type Cuisine {
    _id: String!
    name: String!
    description: String
    image: String
    shopType: String
    isActive: Boolean
  }

  type FormSubmissionResponse {
    message: String!
    status: String!
  }

  type RestaurantResponse {
    success: Boolean!
    message: String
    data: Restaurant
  }

  input CoordinatesInput {
    longitude: Float!
    latitude: Float!
  }

  type SaveNotificationTokenWebResponse {
    success: Boolean!
    message: String
  }

  type Notification {
    _id: ID!
    title: String
    body: String
    createdAt: String
  }

  type AuditLogAdmin {
    _id: String
    email: String
  }

  type AuditLog {
    _id: ID!
    timestamp: String
    admin: AuditLogAdmin
    action: String
    targetType: String
    targetId: String
    changes: String
  }

  type AuditLogsResponse {
    auditLogs: [AuditLog!]!
    totalCount: Int!
    currentPage: Int!
    totalPages: Int!
  }

  type Otp {
    result: Boolean!
  }

  type ChatMessageResponse {
    success: Boolean!
    message: String
    data: ChatMessageOutput
  }

  type ChatMessageOutput {
    id: ID!
    message: String!
    user: ChatUserOutput!
    createdAt: String!
  }

  input ChatMessageInput {
    message: String!
    user: ChatUserInput!
  }

  input ChatUserInput {
    id: ID!
    name: String!
  }

  type ChatUserOutput {
    id: ID!
    name: String!
  }
  type WithdrawRequestReponse {
    success: Boolean!
    data: [WithdrawRequest!]
    message: String
    pagination: Pagination
  }
  type Pagination {
    total: Int
  }
  type UpdateWithdrawResponse {
    success: Boolean!
    data: RiderAndWithdrawRequest
    message: String
  }
  type RiderAndWithdrawRequest {
    rider: Rider
    store: Restaurant
    withdrawRequest: WithdrawRequest!
  }

  type City {
    id: Int
    name: String
    latitude: String
    longitude: String
  }

  type Country {
    id: Int
    name: String
    latitude: String
    longitude: String
    cities: [City]
  }

  type PopularItemsResponse {
    id: String!
    count: Int!
  }

  type DemoCredentails {
    restaurantUsername: String
    restaurantPassword: String
    riderUsername: String
    riderPassword: String
  }

  type VendorStoreDetails {
    _id: ID
    restaurantName: String
    totalOrders: Int
    totalSales: Float
    pickUpCount: Int
    deliveryCount: Int
  }

  type VendorDashboardStatsCardDetails {
    totalRestaurants: Int
    totalOrders: Int
    totalSales: Float
    totalDeliveries: Int
  }

  type VendorDashboardGrowthDetailsByYear {
    totalRestaurants: [Int]
    totalOrders: [Int]
    totalSales: [Float]
  }

  type VendorLiveMonitorData {
    online_stores: Int
    cancelled_orders: Int
    delayed_orders: Int
    ratings: Float
  }

  type Query {
    withdrawRequests(
      userType: UserTypeEnum
      userId: String
      search: String
      pagination: WalletPaginationInput
    ): WithdrawRequestReponse!
    earnings(
      userId: String
      userType: UserTypeEnum
      orderType: OrderTypeEnum
      paymentMethod: PaymentMethodEnum
      search: String
      pagination: WalletPaginationInput
      dateFilter: DateFilterInput
    ): EarningsResponse!
    transactionHistory(
      userType: UserTypeEnum
      userId: String
      search: String
      pagination: WalletPaginationInput
      dateFilter: DateFilterInput
    ): TransactionHistoryResponse!
    storeCurrentWithdrawRequest(storeId: String!): WithdrawRequest
    storeEarningsGraph(
      storeId: ID!
      page: Int
      limit: Int
      startDate: String
      endDate: String
    ): StoreEarningsGraphResponse!
    riderCurrentWithdrawRequest(riderId: String): WithdrawRequest
    riderEarningsGraph(
      riderId: ID!
      page: Int
      limit: Int
      startDate: String
      endDate: String
    ): RiderEarningsGraphResponse!
    categories: [Category!]!
    foods: [Food!]!
    orders(offset: Int): [Order!]!
    undeliveredOrders(offset: Int): [Order!]!
    deliveredOrders(offset: Int): [Order!]!
    allOrders(page: Int): [Order!]!
    allOrdersWithoutPagination(
      dateKeyword: String
      starting_date: String
      ending_date: String
    ): [Order!]!
    getDashboardUsers: DashboardUsersData!
    getDashboardTotal(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardData!
    getRestaurantDashboardOrdersSalesStats(
      restaurant: String!
      starting_date: String
      ending_date: String
      dateKeyword: String
    ): RestaurantDashboardOrdersSalesStats!
    getRestaurantDashboardSalesOrderCountDetailsByYear(
      restaurant: String!
      year: Int!
    ): RestaurantDashboardSalesOrderCountByYear!
    getDashboardOrderSalesDetailsByPaymentMethod(
      restaurant: String!
      starting_date: String
      ending_date: String
      dateKeyword: String
    ): DashboardOrderSalesDetailsByPaymentMethod!
    likedFood: [Food!]!
    reviews(offset: Int, restaurant: String!): [Review!]!
    reviewsByRestaurant(restaurant: String!): ReviewData!
    foodByCategory(
      category: String!
      onSale: Boolean
      inStock: Boolean
      min: Float
      max: Float
      search: String
    ): [Food!]!
    profile: User
    vendorProfile: OwnerData
    configuration: Configuration!
    getVersions: AppVersions
    banners: [Banner!]!
    fetchShopTypes(
      filter: FetchShopTypeFilter
      pagination: PaginationInput
    ): FetchShopTypesResponse!
    fetchShopTypeByUnique(dto: FetchUniqueShopTypeInput): ShopType
    users: [User!]
    user(id: ID!): User
    userFavourite(latitude: Float, longitude: Float): [Restaurant]
    order(id: String!): Order!
    orderPaypal(id: String!): Order!
    orderStripe(id: String!): Order!
    riders: [Rider!]
    rider(id: String): Rider!
    staffs: [Staff!]
    riderWithdrawRequests(id: String, offset: Int): [WithdrawRequest!]
    pageCount(restaurant: String!): Int
    availableRiders: [Rider]
    getOrderStatuses: [String!]
    getPaymentStatuses: [String!]
    assignedOrders(id: String): [Order!]
    options: [Option!]
    addons: [Addon!]
    foodByIds(foodIds: [CartFoodInput!]!): [CartFood!]
    getDashboardOrders(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardOrders!
    getDashboardSales(
      starting_date: String
      ending_date: String
      restaurant: String!
    ): DashboardSales!
    coupons: [Coupon!]!
    restaurantCoupons(restaurantId: String!): [Coupon!]!
    cuisines: [Cuisine!]!
    taxes: Taxation!
    tips: Tipping!
    notifications: [Notification!]!
    auditLogs(page: Int, limit: Int): AuditLogsResponse!
    nearByRestaurants(
      latitude: Float
      longitude: Float
      shopType: String
    ): NearByData!
    nearByRestaurantsPreview(
      latitude: Float
      longitude: Float
      shopType: String
    ): NearByData!
    restaurantList: [Restaurant!]
    ordersByRestId(
      restaurant: String!
      page: Int
      rows: Int
      search: String
    ): [Order!]

    ordersByRestIdWithoutPagination(
      restaurant: String!
      search: String
    ): [Order!]

    ordersByUser(
      userId: ID!,
      page: Int,
      limit: Int
    ): OrdersByUserResponse!
    getOrdersByDateRange(
      startingDate: String!
      endingDate: String!
      restaurant: String!
    ): OrdersWithCashOnDeliveryInfo!

    riderCompletedOrders: [Order!]
    restaurant(id: String, slug: String): Restaurant!
    getRestaurantDeliveryZoneInfo(id: ID!): RestaurantDeliveryZoneInfo
    restaurants: [Restaurant!]
    restaurantByOwner(id: String): OwnerData!
    offers: [Offer]
    sections: [Section]
    vendors: [OwnerData]
    getVendor(id: String!): OwnerData
    getStoreDetailsByVendorId(
      id: String!
      dateKeyword: String
      starting_date: String
      ending_date: String
    ): [VendorStoreDetails]

    getVendorDashboardStatsCardDetails(
      vendorId: String!
      dateKeyword: String
      starting_date: String
      ending_date: String
    ): VendorDashboardStatsCardDetails

    getVendorDashboardGrowthDetailsByYear(
      vendorId: String!
      year: Int!
    ): VendorDashboardGrowthDetailsByYear

    getLiveMonitorData(
      id: String!
      dateKeyword: String
      starting_date: String
      ending_date: String
    ): VendorLiveMonitorData
    orderCount(restaurant: String!): Int
    restaurantOrders: [Order!]!
    zones: [Zone!]
    zone(id: String!): Zone!
    unassignedOrdersByZone: [Order!]
    riderOrders: [Order!]
    getActiveOrders(restaurantId: ID): [Order!]
    orderDetails(id: String!): Order!
    ridersByZone(id: String!): [Rider!]
    chat(order: ID!): [ChatMessageOutput!]
    getAllWithdrawRequests(offset: Int): WithdrawRequestReponse!
    getCountries: [Country]
    getCountryByIso(iso: String!): Country
    recentOrderRestaurants(latitude: Float!, longitude: Float!): [Restaurant!]
    recentOrderRestaurantsPreview(latitude: Float!, longitude: Float!): [Restaurant!]
    mostOrderedRestaurants(latitude: Float!, longitude: Float!): [Restaurant!]
    mostOrderedRestaurantsPreview(latitude: Float!, longitude: Float!): [Restaurant!]
    relatedItems(itemId: String!, restaurantId: String!): [String!]!
    popularItems(restaurantId: String!): [PopularItemsResponse!]!
    topRatedVendors(latitude: Float!, longitude: Float!): [Restaurant!]
    topRatedVendorsPreview(latitude: Float!, longitude: Float!): [Restaurant!]
    lastOrderCreds: DemoCredentails
    cuisine(cuisine: String!): Cuisine
    subCategoriesByParentId(parentCategoryId: String!): [SubCategory!]!
    subCategories: [SubCategory!]!
    subCategory(_id: String): SubCategory
  }

  type Mutation {
    createWithdrawRequest(requestAmount: Float!, userId: String): WithdrawRequest!
    updateWithdrawReqStatus(id: ID!, status: String!): UpdateWithdrawResponse!
    sendOtpToEmail(email: String!, otp: String!): Otp!
    sendOtpToPhoneNumber(phone: String!, otp: String!): Otp!
    emailExist(email: String!): User!
    phoneExist(phone: String!): User!
    Deactivate(isActive: Boolean!, email: String!): User!
    updateUserStatus(id: ID!, status: String!): User!
    updateUserNotes(id: ID!, notes: String!): User!
    deleteUser(id: ID!): User!
    adminLogin(email: String!, password: String!): Admin!
    login(
      appleId: String
      email: String
      password: String
      type: String!
      name: String
      notificationToken: String
      isActive: Boolean
    ): AuthData!
    ownerLogin(email: String!, password: String!): OwnerAuthData!
    createUser(userInput: UserInput): AuthData!
    createVendor(vendorInput: VendorInput): OwnerData!
    editVendor(vendorInput: VendorInput): OwnerData!
    updateVendorProfile(vendorInput: VendorProfileUpdateInput!): OwnerData!
    deleteVendor(id: String!): Boolean
    updateUser(updateUserInput: UpdateUser!): User!
    updateNotificationStatus(
      offerNotification: Boolean!
      orderNotification: Boolean!
    ): User!
    createCategory(category: CategoryInput): Restaurant!
    editCategory(category: CategoryInput): Restaurant!
    createSubCategories(subCategories: [SubCategoryInput!]!): Boolean!
    deleteSubCategory(_id: String!): Boolean!
    createFood(foodInput: FoodInput): Restaurant!
    editFood(foodInput: FoodInput): Restaurant!
    updateFoodOutOfStock(id: String!, restaurant: String!, categoryId: String!): Boolean!
    updateFoodFeatured(id: String!, restaurant: String!, categoryId: String!): Boolean!
    placeOrder(
      restaurant: String!
      orderInput: [OrderInput!]!
      paymentMethod: String!
      couponCode: String
      address: AddressInput!
      tipping: Float!
      orderDate: String!
      isPickedUp: Boolean!
      taxationAmount: Float!
      deliveryCharges: Float!
      instructions: String
    ): Order!
    placeOrderPOS(orderInput: POSOrderInput!): Order!
    editOrder(_id: String!, orderInput: [OrderInput!]!): Order!
    reviewOrder(reviewInput: ReviewInput!): Order!
    acceptOrder(_id: String!, time: String): Order!
    orderPickedUp(_id: String!): Order!
    markOrderReadyForPickup(_id: String!): Order!
    cancelOrder(_id: String!, reason: String!): Order!
    likeFood(foodId: String!): Food!
    saveEmailConfiguration(
      configurationInput: EmailConfigurationInput!
    ): Configuration!
    saveFormEmailConfiguration(
      configurationInput: FormEmailConfigurationInput!
    ): Configuration!
    saveSendGridConfiguration(
      configurationInput: SendGridConfigurationInput!
    ): Configuration!

    saveFirebaseConfiguration(
      configurationInput: FirebaseConfigurationInput!
    ): Configuration!

    saveSentryConfiguration(
      configurationInput: SentryConfigurationInput!
    ): Configuration!
    saveGoogleApiKeyConfiguration(
      configurationInput: GoogleApiKeyConfigurationInput!
    ): Configuration!
    saveCloudinaryConfiguration(
      configurationInput: CloudinaryConfigurationInput!
    ): Configuration!
    saveAmplitudeApiKeyConfiguration(
      configurationInput: AmplitudeApiKeyConfigurationInput!
    ): Configuration!
    saveGoogleClientIDConfiguration(
      configurationInput: GoogleClientIDConfigurationInput!
    ): Configuration!
    saveWebConfiguration(
      configurationInput: WebConfigurationInput!
    ): Configuration!
    saveAppConfigurations(
      configurationInput: AppConfigurationsInput!
    ): Configuration!

    saveDeliveryRateConfiguration(deliveryRate: Float!, costType: String): Configuration!
    saveSingleVendorConfiguration(singleVendorId: String): Configuration!
    savePaypalConfiguration(
      configurationInput: PaypalConfigurationInput!
    ): Configuration!
    saveStripeConfiguration(
      configurationInput: StripeConfigurationInput!
    ): Configuration!
    saveTwilioConfiguration(
      configurationInput: TwilioConfigurationInput!
    ): Configuration!

    saveCurrencyConfiguration(
      configurationInput: CurrencyConfigurationInput!
    ): Configuration!
    setVersions(
      customerAppVersion: AppTypeInput
      riderAppVersion: AppTypeInput
      restaurantAppVersion: AppTypeInput
    ): Boolean
    createShopType(dto: CreateShopTypeInput): ShopType!
    updateShopType(dto: UpdateShopTypeInput): ShopType!
    deleteShopType(id: String!, type: DeleteTypeEnum): ShopType!
    createBanner(bannerInput: BannerInput!): Banner!
    editBanner(bannerInput: BannerInput!): Banner!
    deleteBanner(id: String!): ID
    pushToken(token: String): User!
    updateOrderStatus(id: String!, status: String!, reason: String): Order!
    uploadToken(id: String!, pushToken: String!): OwnerData!
    forgotPassword(email: String!, otp: String!): ForgotPassword!
    resetPassword(password: String!, email: String!): ForgotPassword!
    vendorResetPassword(oldPassword: String!, newPassword: String!): Boolean!
    deleteCategory(id: String!, restaurant: String!): Restaurant!
    deleteFood(
      id: String!
      restaurant: String!
      categoryId: String!
    ): Restaurant!
    createRider(riderInput: RiderInput): Rider!
    editRider(riderInput: RiderInput): Rider!
    deleteRider(id: String!): Rider!
    createStaff(staffInput: StaffInput): Staff!
    editStaff(staffInput: StaffInput): Staff!
    deleteStaff(id: String!): Staff!
    toggleAvailablity(id: String): Rider!
    updateStatus(id: String, orderStatus: String!): Order!
    assignRider(id: String!, riderId: String!): Order!
    riderLogin(
      username: String
      password: String
      notificationToken: String
    ): AuthData!
    updateOrderStatusRider(id: String!, status: String!): Order!
    updatePaymentStatus(id: String, status: String): Order!
    createOptions(optionInput: CreateOptionInput): Restaurant!
    editOption(optionInput: editOptionInput): Restaurant!
    deleteOption(id: String!, restaurant: String!): Restaurant!
    createAddons(addonInput: AddonInput): Restaurant!
    editAddon(addonInput: editAddonInput): Restaurant!
    deleteAddon(id: String!, restaurant: String!): Restaurant!
    createCoupon(couponInput: CouponInput!): Coupon!
    createRestaurantCoupon(restaurantId: ID!, couponInput: CouponInput!): Coupon!
    editCoupon(couponInput: CouponInput!): Coupon!
    editRestaurantCoupon(restaurantId: ID!, couponInput: CouponInput!): Coupon!
    deleteCoupon(id: String!): String!
    deleteRestaurantCoupon(restaurantId: ID!, couponId: ID!): String!
    coupon(coupon: String!, restaurantId: ID): Coupon!
    createCuisine(cuisineInput: CuisineInput!): Cuisine!
    editCuisine(cuisineInput: CuisineInput!): Cuisine!
    deleteCuisine(id: String!): String!
    createTipping(tippingInput: TippingInput!): Tipping!
    editTipping(tippingInput: TippingInput!): Tipping!
    createTaxation(taxationInput: TaxationInput!): Taxation!
    editTaxation(taxationInput: TaxationInput!): Taxation!
    createRestaurant(restaurant: RestaurantInput!, owner: ID!): Restaurant!
    createReview(review: ReviewInput!): Restaurant!
    deleteRestaurant(id: String!): Restaurant!
    editRestaurant(restaurant: RestaurantProfileInput!): Restaurant!
    updateRestaurantBussinessDetails(
      id: String!
      bussinessDetails: BussinessDetailsInput
    ): RestaurantResponse!
    createAddress(addressInput: AddressInput!): User!
    editAddress(addressInput: AddressInput!): User!
    deleteAddress(id: ID!): User!
    changePassword(oldPassword: String!, newPassword: String!): Boolean!
    createOffer(offer: OfferInput!): Offer!
    editOffer(offer: OfferInput!): Offer!
    deleteOffer(id: String!): Boolean
    createSection(section: SectionInput!): Section!
    editSection(section: SectionInput!): Section!
    deleteSection(id: String!): Boolean
    addRestaurantToOffer(id: String!, restaurant: String!): Offer
    selectAddress(id: String!): User!
    assignOrder(id: String): Order!
    muteRing(orderId: String): Boolean!
    updateRiderLocation(latitude: String!, longitude: String!): Rider!
    updateRiderBussinessDetails(id: String!, bussinessDetails: BussinessDetailsInput): Rider!
    updateRiderLicenseDetails(id: String!, licenseDetails: LicenseDetailsInput): Rider!
    updateRiderVehicleDetails(id: String!, vehicleDetails: VehicleDetailsInput): Rider!
    updateWorkSchedule(riderId: String!, workSchedule: [DayScheduleInput!]!, timeZone: String!): Rider!
    uploadImageToS3(image: String!): UploadImageResponse!
    restaurantLogin(username: String!, password: String!, notificationToken: String): RestaurantAuth!
    createZone(zone: ZoneInput!): Zone!
    editZone(zone: ZoneInput!): Zone!
    deleteZone(id: String!): Zone!
    saveRestaurantToken(token: String, isEnabled: Boolean): Restaurant!
    notifyRiders(id: String!): Boolean!
    updateTimings(id: String!, openingTimes: [TimingsInput]): Restaurant!
    toggleAvailability: Restaurant!
    addFavourite(id: String!): User!
    sendNotificationUser(
      notificationTitle: String
      notificationBody: String!
    ): String!
    updateCommission(id: String!, commissionRate: Float!): Restaurant!
    updateDeliveryBoundsAndLocation(
      id: ID!
      bounds: [[[Float!]]]
      circleRadius: Float
      boundType: String
      location: CoordinatesInput!
    ): RestaurantResponse!
    saveNotificationTokenWeb(token: String!): SaveNotificationTokenWebResponse!
    sendChatMessage(
      message: ChatMessageInput!
      orderId: ID!
    ): ChatMessageResponse!
    markOrderChatReadByRider(orderId: ID!): Boolean!
    toggleMenuFood(id: ID!, restaurant: ID!, categoryId: ID!): Food!
    sendFormSubmission(
      formSubmissionInput: FormSubmissionInput!
    ): FormSubmissionResponse!
    abortOrder(id: String!): Order!
    saveVerificationsToggle(
      configurationInput: VerificationConfigurationInput!
    ): Configuration!

    saveDemoConfiguration(
      configurationInput: DemoConfigurationInput!
    ): Configuration!
  }
  type Subscription {
    subscribePlaceOrder(restaurant: String!): SubscriptionOrders!
    orderStatusChanged(userId: String!): SubscriptionOrders!
    subscriptionAssignRider(riderId: String!): SubscriptionOrders!
    subscriptionRiderLocation(riderId: String!): Rider!
    subscriptionZoneOrders(zoneId: String!): Subscription_Zone_Orders!
    subscriptionOrder(id: String!): Order!
    subscriptionDispatcher: Order!
    subscriptionNewMessage(order: ID!): ChatMessageOutput!
  }
`
module.exports = typeDefs
