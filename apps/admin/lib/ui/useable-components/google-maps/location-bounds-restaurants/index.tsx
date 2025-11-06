'use client';

// Core imports
import {
  ApolloCache,
  ApolloError,
  useMutation,
  useQuery,
} from '@apollo/client';
import { throttle } from 'lodash';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// API and GraphQL
import {
  GET_RESTAURANT_DELIVERY_ZONE_INFO,
  GET_RESTAURANT_PROFILE,
  UPDATE_DELIVERY_BOUNDS_AND_LOCATION,
  GET_ZONES,
} from '@/lib/api/graphql';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { onUseLocalStorage } from '@/lib/utils/methods';
import { SELECTED_RESTAURANT } from '@/lib/utils/constants';
// Interfaces
import {
  ICustomGoogleMapsLocationBoundsComponentProps,
  ILocation,
  ILocationPoint,
  IPlaceSelectedOption,
  IRestaurantDeliveryZoneInfo,
  IRestaurantProfile,
  IRestaurantProfileResponse,
  IUpdateRestaurantDeliveryZoneVariables,
  IZoneResponse,
  IZonesResponse,
} from '@/lib/utils/interfaces';

// Utilities
import { transformPath, transformPolygon } from '@/lib/utils/methods';

// Third-party libraries
import {
  faChevronDown,
  faMapMarker,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Circle, GoogleMap, Marker, Polygon } from '@react-google-maps/api';
import parse from 'autosuggest-highlight/parse';
import { AutoComplete, AutoCompleteSelectEvent } from 'primereact/autocomplete';

// Components
import CustomButton from '../../button';
import CustomRadiusInputField from '../../custom-radius-input';
import CustomShape from '../shapes';
import useLocation from '@/lib/hooks/useLocation';
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';
import calculateZoom from '@/lib/utils/methods/zoom-calculator';
import { useTranslations } from 'next-intl';

const GoogleMapAny = GoogleMap as unknown as React.ComponentType<any>;
const MarkerAny = Marker as unknown as React.ComponentType<any>;
const CircleAny = Circle as unknown as React.ComponentType<any>;
const PolygonAny = Polygon as unknown as React.ComponentType<any>;
const autocompleteService: {
  current: google.maps.places.AutocompleteService | null;
} = { current: null };

// Default coordinate for Cairo, Egypt
const DEFAULT_CAIRO = { lat: 30.0444, lng: 31.2357 };

// Ensure a polygon ring is valid: closed and with at least 3 distinct points
function isValidRing(ring: number[][]): boolean {
  if (!Array.isArray(ring) || ring.length < 4) return false; // needs first==last
  const [firstLng, firstLat] = ring[0] ?? [];
  const [lastLng, lastLat] = ring[ring.length - 1] ?? [];
  if (!Number.isFinite(firstLng) || !Number.isFinite(firstLat)) return false;
  if (!Number.isFinite(lastLng) || !Number.isFinite(lastLat)) return false;
  return firstLng === lastLng && firstLat === lastLat;
}

const CustomGoogleMapsLocationBounds: React.FC<
  ICustomGoogleMapsLocationBoundsComponentProps
> = ({ onStepChange, hideControls, height }) => {
  // Hooks
  const t = useTranslations();

  // Context
  const { restaurantsContextData, onSetRestaurantsContextData } =
    useContext(RestaurantsContext);
  const { showToast } = useContext(ToastContext);

  // States
  const [zoom, setZoom] = useState(14);
  const [deliveryZoneType, setDeliveryZoneType] = useState('radius');
  const [center, setCenter] = useState(DEFAULT_CAIRO);

  const [marker, setMarker] = useState(DEFAULT_CAIRO);
  const [path, setPath] = useState<ILocationPoint[]>([]);
  const [distance, setDistance] = useState(1);
  // const [isLoading, setLoading] = useState(false);
  // Auto complete
  const [options, setOptions] = useState<IPlaceSelectedOption[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedPlaceObject, setSelectedPlaceObject] =
    useState<IPlaceSelectedOption | null>(null);
  const [search, setSearch] = useState<string>('');
  const [zones, setZones] = useState<IZoneResponse[]>([]);
  const [isPlacesReady, setIsPlacesReady] = useState(false);
  // Ref
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);

  //Hooks
  const { getCurrentLocation } = useLocation();

  // API – resolve restaurantId once
  const selectedRestaurantIdFromLS =
    typeof window !== 'undefined'
      ? (onUseLocalStorage('get', SELECTED_RESTAURANT) as string)
      : '';

  const restaurantId =
    restaurantsContextData?.restaurant?._id?.code ||
    selectedRestaurantIdFromLS ||
    '';

  const { loading: isFetchingRestaurantProfile } = useQuery(
    GET_RESTAURANT_PROFILE,
    {
      variables: { id: restaurantId },
      fetchPolicy: 'network-only',
      skip: !restaurantId,
      onCompleted: onRestaurantProfileFetchCompleted,
      onError: onErrorFetchRestaurantProfile,
    }
  );

  const {
    loading: isFetchingRestaurantDeliveryZoneInfo,
    refetch: refetchRestaurantDeliveryZoneInfo,
    networkStatus: deliveryZoneNetworkStatus,
  } = useQuery(GET_RESTAURANT_DELIVERY_ZONE_INFO, {
    variables: { id: restaurantId },
    // Hard bypass Apollo cache for this query
    fetchPolicy: 'no-cache',
    nextFetchPolicy: 'no-cache',
    notifyOnNetworkStatusChange: true,
    returnPartialData: false,
    skip: !restaurantId,
    onCompleted: onRestaurantZoneInfoFetchCompleted,
    onError: onErrorFetchRestaurantZoneInfo,
  });
const [updateRestaurantDeliveryZone, { loading: isSubmitting }] = useMutation(
  UPDATE_DELIVERY_BOUNDS_AND_LOCATION,
  {
    update: (cache, result) => updateCache(cache, result),
    onCompleted: onRestaurantZoneUpdateCompleted,
    onError: onErrorLocationZoneUpdate,
    refetchQueries: () => [
      { query: GET_RESTAURANT_PROFILE, variables: { id: restaurantId } },
      { query: GET_RESTAURANT_DELIVERY_ZONE_INFO, variables: { id: restaurantId } },
    ],
    awaitRefetchQueries: true,
  }
);

  useQuery<IZonesResponse>(GET_ZONES, {
    onCompleted: (data) => {
      if (data) {
        setZones(data.zones);
      }
    },
  });

  // Memos
  const radiusInMeter = useMemo(() => {
    return distance * 1000;
  }, [distance]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

const fetch = React.useMemo(
  () =>
    throttle(
      (
        request: google.maps.places.AutocompletionRequest,
        callback: (results: IPlaceSelectedOption[]) => void
      ) => {
        if (!autocompleteService.current || !window.google?.maps?.places) {
          callback([]);
          return;
        }

        // Bias to Egypt (remove if you want global)
        const req: google.maps.places.AutocompletionRequest = {
          ...request,
          componentRestrictions: { country: ['eg'] },
          sessionToken: sessionTokenRef.current ?? undefined,
        };

        autocompleteService.current.getPlacePredictions(
          req,
          (preds, status) => {
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !preds) {
              callback([]);
              return;
            }
            callback(preds as unknown as IPlaceSelectedOption[]);
          }
        );
      },
      600
    ),
  []
);

  // API Handlers
  function updateCache(cache: ApolloCache<unknown>, result: any) {
  const updated = result?.data?.result?.data as IRestaurantProfile | undefined;
  if (!updated) return;

  const cached = cache.readQuery<{ restaurant?: IRestaurantProfile }>({
    query: GET_RESTAURANT_PROFILE,
    variables: { id: restaurantId },
  });

  cache.writeQuery({
    query: GET_RESTAURANT_PROFILE,
    variables: { id: restaurantId },
    data: {
      restaurant: {
        ...(cached?.restaurant ?? {}),
        ...updated,
      },
    },
  });
}
  // Profile Error
  function onErrorFetchRestaurantProfile({
    graphQLErrors,
    networkError,
  }: ApolloError) {
    showToast({
      type: 'error',
      title: t('Store Profile'),
      message:
        graphQLErrors[0].message ??
        networkError?.message ??
        t('Store Profile Fetch Failed'),
      duration: 2500,
    });
  }
  // Restaurant Profile Complete
  function onRestaurantProfileFetchCompleted({
    restaurant,
  }: {
    restaurant: IRestaurantProfile;
  }) {
    const isLocationZero =
      +restaurant?.location?.coordinates[0] === 0 &&
      +restaurant?.location?.coordinates[1] === 0;
    if (!restaurant || isLocationZero) return;

    setCenter({
      lat: +restaurant?.location?.coordinates[1],
      lng: +restaurant?.location?.coordinates[0],
    });
    setMarker({
      lat: +restaurant?.location?.coordinates[1],
      lng: +restaurant?.location?.coordinates[0],
    });
    setPath(
      restaurant?.deliveryBounds
        ? transformPolygon(restaurant?.deliveryBounds?.coordinates[0])
        : path
    );
  }
  // Restaurant Zone Info Error
  function onErrorFetchRestaurantZoneInfo({
    graphQLErrors,
    networkError,
  }: ApolloError) {
    showToast({
      type: 'error',
      title: t('Store Location & Zone'),
      message:
        graphQLErrors[0].message ??
        networkError?.message ??
        t('Store Location & Zone fetch failed'),
      duration: 2500,
    });
  }
  // Restaurant Zone Info Complete
  function onRestaurantZoneInfoFetchCompleted({
    getRestaurantDeliveryZoneInfo,
  }: {
    getRestaurantDeliveryZoneInfo: IRestaurantDeliveryZoneInfo;
  }) {
    const {
      address,
      deliveryBounds: polygonBounds,
      circleBounds,
      location,
      boundType,
    } = getRestaurantDeliveryZoneInfo;

    const coordinates = {
      lng: location.coordinates[0],
      lat: location.coordinates[1],
    };

    if (!hideControls) setInputValue(address);

    const isLocationZero =
      +location?.coordinates[0] === 0 && +location?.coordinates[1] === 0;

    if (!isLocationZero) {
      setCenter(coordinates);
      setMarker(coordinates);
    }

    if (boundType) setDeliveryZoneType(boundType);
    if (typeof circleBounds?.radius === 'number' && isFinite(circleBounds.radius)) {
  setDistance(circleBounds.radius / 1000);
}

    setPath(
      polygonBounds?.coordinates[0].map((coordinate: number[]) => {
        return { lat: coordinate[1], lng: coordinate[0] };
      }) || []
    );
  }
  // Zone Update Error
function onErrorLocationZoneUpdate(err: ApolloError) {
  // Collect all plausible error messages from ApolloError safely
  const gqlMsgs: string[] =
    Array.isArray((err as any)?.graphQLErrors)
      ? (err as any).graphQLErrors.map((e: any) => e?.message).filter(Boolean)
      : [];

  const net: any = (err as any)?.networkError;
  const netMsgs: string[] = [
    net?.message,
    ...(Array.isArray(net?.result?.errors)
      ? net.result.errors.map((e: any) => e?.message)
      : []),
  ].filter(Boolean);

  const fallback = (err as any)?.message;

  // Merge, de-duplicate and cap size to avoid very long GraphQL traces in the toast
  const merged = Array.from(new Set([...(gqlMsgs || []), ...(netMsgs || []), ...(fallback ? [fallback] : [])]));
  const finalMessage =
    (merged.join(' | ').trim() || t('Store Location & Zone update failed')).slice(0, 280);

  // Log full error for debugging
  // eslint-disable-next-line no-console
  console.error('[Update Zone Error]', err);

  showToast({
    type: 'error',
    title: t('Store Location & Zone'),
    message: finalMessage,
    duration: 3000,
  });
}
  // Zone Update Complete
async function onRestaurantZoneUpdateCompleted({
  result,
}: {
  result?: { success?: boolean; message?: string; data?: IRestaurantProfile };
}) {
  const restaurant = result?.data;

  if (result?.success && restaurant) {
    setCenter({
      lat: Number(restaurant?.location?.coordinates?.[1] ?? 0),
      lng: Number(restaurant?.location?.coordinates?.[0] ?? 0),
    });
    setMarker({
      lat: Number(restaurant?.location?.coordinates?.[1] ?? 0),
      lng: Number(restaurant?.location?.coordinates?.[0] ?? 0),
    });
    setPath(
      restaurant?.deliveryBounds
        ? transformPolygon(restaurant.deliveryBounds.coordinates?.[0])
        : path
    );

    showToast({
      type: 'success',
      title: t('Zone Update'),
      message: t('Store Zone has been updated successfully.'),
    });

    // Force a fresh re-fetch of the delivery zone info (cache bypassed above)
    try {
      await refetchRestaurantDeliveryZoneInfo({ id: String(restaurantId) });
    } catch (_) {
      // no-op: toast already shown above; this is just a belt-and-suspenders refetch
    }

    if (onStepChange) onStepChange(3);
  } else {
    showToast({
      type: 'error',
      title: t('Store Location & Zone'),
      message: result?.message || t('Store Location & Zone update failed'),
      duration: 2500,
    });
  }
}
  // Other Handlers
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };
  const onHandlerAutoCompleteSelectionChange = (
    event: AutoCompleteSelectEvent
  ) => {
    const selectedOption = event?.value as IPlaceSelectedOption;
    if (selectedOption) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { placeId: selectedOption.place_id },
        (results: google.maps.GeocoderResult[] | null) => {
          if (
            results &&
            results[0] &&
            results[0]?.geometry &&
            results[0]?.geometry.location
          ) {
            const location = results[0]?.geometry?.location;

            // Some layouts may not provide the RestaurantsContext setter.
            // Guard it so selecting an address doesn't crash the page.
            try {
              if (typeof onSetRestaurantsContextData === 'function') {
                onSetRestaurantsContextData({
                  ...restaurantsContextData,
                  restaurant: {
                    ...restaurantsContextData?.restaurant,
                    _id: restaurantsContextData?.restaurant?._id ?? null,
                    autoCompleteAddress: selectedOption.description,
                  },
                });
              }
            } catch {
              // no-op
            }

            setCenter({
              lat: location?.lat() ?? 0,
              lng: location?.lng() ?? 0,
            });
            setMarker({
              lat: location?.lat() ?? 0,
              lng: location?.lng() ?? 0,
            });

            setInputValue(selectedOption?.description ?? '');
          }
        }
      );
      setSelectedPlaceObject(selectedOption);
      if (window.google?.maps?.places) {
  sessionTokenRef.current =
    new window.google.maps.places.AutocompleteSessionToken();
}
    }
  };
  const onClickGoogleMaps = (e: google.maps.MapMouseEvent) => {
    setPath([
      ...path,
      { lat: e?.latLng?.lat() ?? 0, lng: e?.latLng?.lng() ?? 0 },
    ]);
  };
  const getPolygonPathFromCircle = (center: ILocationPoint, radius: number) => {
    try {
      const points = 4;
      const angleStep = (2 * Math.PI) / points;
      const path = [];

      for (let i = 0; i < points; i++) {
        const angle = i * angleStep;
        const lat = center.lat + (radius / 111300) * Math.cos(angle);
        const lng =
          center.lng +
          (radius / (111300 * Math.cos(center.lat * (Math.PI / 180)))) *
            Math.sin(angle);
        path.push({ lat, lng });
      }

      return path;
    } catch (error) {
      return [];
    }
  };
  function getPolygonPath(
    center: ILocationPoint,
    radius: number,
    numPoints: number = 4
  ) {
    try {
      const path = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = (i * 2 * Math.PI) / numPoints;
        const lat = center.lat + (radius / 111320) * Math.cos(angle);
        const lng =
          center.lng +
          (radius / (111320 * Math.cos((center.lat * Math.PI) / 180))) *
            Math.sin(angle);
        path.push([lng, lat]);
      }

      path.push(path[0]);
      return [path];
    } catch (error) {
      return [];
    }
  }
  const handleDistanceChange = (val: number) => {
    const newDistance = val || 0;
    setDistance(newDistance);
  };
  const locationCallback = (error: string | null, data?: ILocation) => {
    if (error) {
      // Fallback to Cairo if browser geolocation is denied/unavailable
      setCenter(DEFAULT_CAIRO);
      setMarker(DEFAULT_CAIRO);
      return;
    }

    const lat = data?.latitude ?? DEFAULT_CAIRO.lat;
    const lng = data?.longitude ?? DEFAULT_CAIRO.lng;

    setCenter({ lat, lng });
    setMarker({ lat, lng });

    setInputValue(data?.deliveryAddress ?? '');
    setSearch(data?.deliveryAddress ?? '');
  };
  const onEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef?.current
        .getPath()
        .getArray()
        .map((latLng) => {
          return { lat: latLng.lat(), lng: latLng.lng() };
        });

      setPath(nextPath);

      // Calculate new center based on polygon vertices
      const newCenter = nextPath.reduce(
        (acc, point) => ({
          lat: acc.lat + point.lat / nextPath.length,
          lng: acc.lng + point.lng / nextPath.length,
        }),
        { lat: 0, lng: 0 }
      );

      setCenter(newCenter);
      setMarker(newCenter);
    }
  }, [setPath, setCenter, setMarker]);
  const onLoadPolygon = useCallback(
    (polygon: google.maps.Polygon) => {
      if (!polygon) return;

      polygonRef.current = polygon;
      const path = polygon?.getPath();
      listenersRef?.current?.push(
        path?.addListener('set_at', onEdit),
        path?.addListener('insert_at', onEdit),
        path?.addListener('remove_at', onEdit)
      );
    },
    [onEdit]
  );
  const onUnmount = useCallback(() => {
    listenersRef?.current?.forEach((lis) => lis?.remove());
    polygonRef.current = null;
  }, []);
  const removeMarker = () => {
    setMarker({ lat: 0, lng: 0 });
  };
  const onDragEnd = (mapMouseEvent: google.maps.MapMouseEvent) => {
    const newLatLng = {
      lat: mapMouseEvent?.latLng?.lat() ?? 0,
      lng: mapMouseEvent?.latLng?.lng() ?? 0,
    };

    setMarker(newLatLng);
    setCenter(newLatLng);

    // Update polygon when marker is dragged
    if (deliveryZoneType === 'polygon') {
      const newPath = getPolygonPathFromCircle(newLatLng, radiusInMeter ?? 1);
      setPath(newPath);
    }
  };
  // Submit Handler
  const onLocationSubmitHandler = () => {
    try {
      if (!restaurantId) {
        showToast({
          type: 'error',
          title: t('Location & Zone'),
          message: t('No restaurnat is selected'),
        });
        return;
      }

      // Validation: block save if missing required payload for selected type
      let bounds = transformPath(path);
      if (deliveryZoneType === 'radius') {
        bounds = getPolygonPath(center, radiusInMeter);
      }

      // --- Validation based on type ---
      if (deliveryZoneType === 'point') {
        showToast({
          type: 'error',
          title: t('Location & Zone'),
          message: t('Please draw a valid delivery area before saving.'),
          duration: 2500,
        });
        return;
      }

      if (deliveryZoneType === 'polygon') {
        const ring = (bounds?.[0] ?? []) as unknown as number[][];
        if (!isValidRing(ring)) {
          showToast({
            type: 'error',
            title: t('Location & Zone'),
            message: t('Please draw a valid polygon (closed shape with at least 3 points).'),
            duration: 2500,
          });
          return;
        }
      }

      if (deliveryZoneType === 'radius') {
        if (!Number.isFinite(distance) || Number(distance) <= 0) {
          showToast({
            type: 'error',
            title: t('Location & Zone'),
            message: t('Please set a valid radius greater than 0.'),
            duration: 2500,
          });
          return;
        }
      }

      // Only send the field the backend expects for the selected type
      const sendBounds =
        deliveryZoneType === 'polygon' ? bounds : undefined;

      // Debug: ensure ring is closed when sending polygon
      if (sendBounds?.[0]) {
        const ring = sendBounds[0] as unknown as number[][];
        const first = ring[0];
        const last = ring[ring.length - 1];
        // eslint-disable-next-line no-console
        console.log('[Bounds ring]', { count: ring.length, first, last, closed: first && last && first[0] === last[0] && first[1] === last[1] });
      }

      const variablesPartial: Partial<IUpdateRestaurantDeliveryZoneVariables> = {
        id: String(restaurantId),
        location: {
          latitude: Number(marker?.lat ?? 0),
          longitude: Number(marker?.lng ?? 0),
        },
        boundType: deliveryZoneType,
        address:
          restaurantsContextData?.restaurant?.autoCompleteAddress ??
          inputValue ??
          '',
        ...(sendBounds ? { bounds: sendBounds as unknown as number[][][] } : {}),
        ...(deliveryZoneType === 'radius' ? { circleRadius: radiusInMeter } : {}),
      };

      const variables = variablesPartial as IUpdateRestaurantDeliveryZoneVariables;

      // eslint-disable-next-line no-console
      console.log('[Submitting Location/Zone]', variables);
      updateRestaurantDeliveryZone({ variables });
    } catch (error) {
      showToast({
        type: 'error',
        title: t('Location & Zone'),
        message: t('Location & Zone update failed'),
      });
    }
  };

  // Use Effects
useEffect(() => {
  let active = true;
  let intervalId: number | undefined;

  const initService = () => {
    if (!autocompleteService.current && (window as any)?.google?.maps?.places) {
      autocompleteService.current =
        new (window as any).google.maps.places.AutocompleteService();
      sessionTokenRef.current =
        new (window as any).google.maps.places.AutocompleteSessionToken();
      setIsPlacesReady(true);
    }
  };

  // try immediately
  initService();

  // poll briefly until Places attaches
  if (!autocompleteService.current) {
    intervalId = window.setInterval(() => {
      initService();
      if (autocompleteService.current && intervalId) {
        window.clearInterval(intervalId);
      }
    }, 250);
  }

  // if still not ready, don’t query—just clear suggestions
  if (!autocompleteService.current) {
    setOptions(selectedPlaceObject ? [selectedPlaceObject] : []);
    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }

  if (search === '') {
    setOptions(selectedPlaceObject ? [selectedPlaceObject] : []);
    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
    };
  }

  // fetch predictions
  fetch({ input: search }, (results) => {
    if (!active) return;
    let newOptions: IPlaceSelectedOption[] = [];
    if (selectedPlaceObject) newOptions = [selectedPlaceObject];
    if (results) newOptions = [...newOptions, ...results];
    setOptions(newOptions);
  });

  return () => {
    active = false;
    if (intervalId) window.clearInterval(intervalId);
  };
}, [selectedPlaceObject, search, fetch]);

  useEffect(() => {
    if (!hideControls) getCurrentLocation(locationCallback);
  }, []);

  useEffect(() => {
    const zoomVal = calculateZoom(distance);
    setZoom(zoomVal);
  }, [distance]);

return (
  <div className="min-h-screen pb-10 space-y-4">
    <div className="px-2">
      <div className="relative w-full h-[520px] min-h-[520px] rounded">
        {/* Address search overlay on top of the map */}
        {!hideControls && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-[min(90vw,680px)] pointer-events-none">
            <div className="relative pointer-events-auto">
              <AutoComplete
                id="google-autocomplete"
                panelClassName="z-50"
                disabled={!isPlacesReady || isFetchingRestaurantDeliveryZoneInfo || isFetchingRestaurantProfile}
                className="p h-11 w-full border border-gray-300 px-2 text-sm focus:shadow-none focus:outline-none bg-white rounded-md"
                value={inputValue}
                dropdownIcon={
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    style={{ fontSize: '1rem', color: 'gray' }}
                  />
                }
                completeMethod={(event) => setSearch(event.query)}
                onChange={(e) => {
  if (typeof e.value === 'string') {
    setInputValue(e.value);
    setSearch(e.value);
  }
}}
                onSelect={onHandlerAutoCompleteSelectionChange}
                suggestions={options}
                forceSelection={false}
                dropdown
                multiple={false}
                loadingIcon={null}
                placeholder={t('Search Address')}
                minLength={1}
                style={{ width: '100%' }}
                itemTemplate={(item) => {
                  const matches = item.structured_formatting?.main_text_matched_substrings;
                  let parts: any = null;
                  if (matches) {
                    parts = parse(
                      item.structured_formatting.main_text,
                      matches.map((m: { offset: number; length: number }) => [m.offset, m.offset + m.length])
                    );
                  }
                  return (
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faMapMarker} className="mr-2" />
                        {parts &&
                          parts.map((part: any, idx: number) => (
                            <span
                              key={idx}
                              style={{
                                fontWeight: part.highlight ? 700 : 400,
                                color: 'black',
                                marginRight: '2px',
                              }}
                            >
                              {part.text}
                            </span>
                          ))}
                      </div>
                      <small>{item.structured_formatting?.secondary_text}</small>
                    </div>
                  );
                }}
              />
              {inputValue && (
                <button
                  type="button"
                  aria-label="Clear address"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => {
                    setInputValue('');
                    setSearch('');
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>
        )}
        <GoogleMapAny
          mapContainerStyle={{ height: '100%', width: '100%', borderRadius: 10, zIndex: 0 }}
          id="google-map"
          zoom={zoom}
          center={center}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: !hideControls,
            fullscreenControl: !hideControls,
            draggable: !hideControls,
            gestureHandling: 'cooperative',
          }}
          onClick={deliveryZoneType === 'point' ? onClickGoogleMaps : undefined}
        >
          {zones.map(
            (zone) =>
              zone.location && (
                <PolygonAny
                  key={zone._id}
                  // @ts-ignore guarded by server data shape
                  paths={zone.location.coordinates[0].map((c: number[]) => ({ lat: c[1], lng: c[0] }))}
                  options={{
                    strokeColor: 'blue',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: 'lightblue',
                    fillOpacity: 0.3,
                  }}
                />
              )
          )}

          <PolygonAny
            editable={!hideControls}
            draggable={!hideControls}
            visible={deliveryZoneType === 'polygon'}
            paths={path}
            options={{
              strokeColor: 'black',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#000000',
              fillOpacity: 0.35,
            }}
            onMouseUp={onEdit}
            onDragEnd={onEdit}
            onLoad={onLoadPolygon}
            onUnmount={onUnmount}
          />

          <CircleAny
            center={center}
            radius={radiusInMeter}
            visible={deliveryZoneType === 'radius' || deliveryZoneType === 'point'}
            options={{ fillColor: 'black', fillOpacity: 0.2, strokeColor: 'black', strokeOpacity: 1, strokeWeight: 2 }}
          />

          {marker && <MarkerAny position={marker} draggable={!hideControls} onRightClick={removeMarker} onDragEnd={onDragEnd} />}
        </GoogleMapAny>
      </div>
    </div>
    {/* Controls BELOW the map (single source of truth) */}
    {!hideControls && (
      <div className="px-2">
        <div className="w-full rounded-xl border bg-white px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {deliveryZoneType === 'radius' && (
              <div className="w-32">
                <CustomRadiusInputField
                  type="number"
                  name="radius"
                  placeholder={t('Radius')}
                  maxLength={35}
                  min={0}
                  max={1000}
                  value={distance}
                  onChange={handleDistanceChange}
                  showLabel
                  loading={false}
                />
              </div>
            )}
            <div className="scale-95 sm:scale-100">
              <CustomShape
                selected={deliveryZoneType}
                onClick={(val: string) => {
                  switch (val) {
                    case 'polygon':
                      setPath(getPolygonPathFromCircle(center, radiusInMeter));
                      break;
                    case 'point':
                      setPath([]);
                      break;
                    default:
                      break;
                  }
                  setDeliveryZoneType(val);
                }}
              />
            </div>
          </div>
          <CustomButton
            className="h-10 w-fit border-gray-300 bg-black px-6 text-white"
            label={t('Save')}
            type="button"
            loading={isSubmitting}
            onClick={onLocationSubmitHandler}
          />
        </div>
      </div>
    )}
  </div>
);
};

export default CustomGoogleMapsLocationBounds;
