'use client';

import { GoogleMapsLoader } from '@/lib/ui/useable-components/google-maps/maps-loader';
import LocationBounds from '@/lib/ui/useable-components/google-maps/location-bounds-restaurants';

const LocationScreen = () => {
  return (
    <div className="p-3">
      {/* The wrapper below will show a loader until the API is loaded.
          No fixed viewport-relative height/overflow-hidden here: LocationBounds
          renders the map (fixed height, internally) AND a controls panel below
          it (shape selector + Save button) — clipping this container's height
          was cutting off that panel's labels/button. */}
      <div className="min-h-[600px] rounded border">
        <GoogleMapsLoader>
          <LocationBounds height="100%" />
        </GoogleMapsLoader>
      </div>
    </div>
  );
};

export default LocationScreen;