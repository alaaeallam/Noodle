// Drop-in replacement for google.maps.places.AutocompleteService.
// The legacy Places API is closed to new Google Cloud projects (March 2025),
// and calling it with a key that can't use it makes Google replace the whole
// map with "This page didn't load Google Maps correctly". This keeps the same
// getPlacePredictions(request, callback) shape but uses Places API (New).

type LegacyPredictionCallback = (
  predictions: google.maps.places.AutocompletePrediction[] | null,
  status: google.maps.places.PlacesServiceStatus
) => void;

const toLegacyMatches = (
  matches?: google.maps.places.StringRange[] | null
): google.maps.places.PredictionSubstring[] =>
  (matches ?? []).map((m) => ({
    offset: m.startOffset,
    length: m.endOffset - m.startOffset,
  }));

export class PlacesAutocompleteService {
  getPlacePredictions(
    request: google.maps.places.AutocompletionRequest,
    callback?: LegacyPredictionCallback
  ): void {
    const { AutocompleteSuggestion } = google.maps.places;
    const country = request.componentRestrictions?.country;

    const newRequest: google.maps.places.AutocompleteRequest = {
      input: request.input,
      sessionToken: request.sessionToken,
      language: request.language ?? undefined,
      region: request.region ?? undefined,
      includedRegionCodes: country
        ? Array.isArray(country)
          ? country
          : [country]
        : undefined,
    };

    AutocompleteSuggestion.fetchAutocompleteSuggestions(newRequest)
      .then(({ suggestions }) => {
        const predictions = suggestions
          .map((s) => s.placePrediction)
          .filter((p): p is google.maps.places.PlacePrediction => !!p)
          .map(
            (p) =>
              ({
                description: p.text.text,
                place_id: p.placeId,
                matched_substrings: toLegacyMatches(p.text.matches),
                structured_formatting: {
                  main_text: p.mainText?.text ?? p.text.text,
                  main_text_matched_substrings: toLegacyMatches(
                    p.mainText?.matches
                  ),
                  secondary_text: p.secondaryText?.text ?? '',
                },
                terms: [],
                types: p.types ?? [],
              }) as google.maps.places.AutocompletePrediction
          );

        callback?.(
          predictions.length ? predictions : null,
          (predictions.length
            ? 'OK'
            : 'ZERO_RESULTS') as google.maps.places.PlacesServiceStatus
        );
      })
      .catch((err) => {
        console.error('[Places] Autocomplete failed:', err);
        callback?.(
          null,
          'REQUEST_DENIED' as google.maps.places.PlacesServiceStatus
        );
      });
  }
}

// Replacement for Geocoder.geocode({ placeId }) that goes through Places API
// (New), so selecting a suggestion doesn't also require the Geocoding API.
// Calls back with a GeocoderResult-shaped array (only geometry.location set).
export function getPlaceLocation(
  placeId: string,
  callback: (results: google.maps.GeocoderResult[] | null) => void
): void {
  const place = new google.maps.places.Place({ id: placeId });
  place
    .fetchFields({ fields: ['location', 'formattedAddress'] })
    .then(() => {
      if (!place.location) {
        callback(null);
        return;
      }
      callback([
        {
          geometry: { location: place.location },
          formatted_address: place.formattedAddress ?? '',
          place_id: placeId,
        } as unknown as google.maps.GeocoderResult,
      ]);
    })
    .catch((err) => {
      console.error('[Places] Place lookup failed:', err);
      callback(null);
    });
}
