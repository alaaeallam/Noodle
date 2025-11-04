'use client';

import { GoogleMapsLoader } from '@/lib/ui/useable-components/google-maps/maps-loader';
import LocationBounds from '@/lib/ui/useable-components/google-maps/location-bounds-restaurants';

const LocationScreen = () => {
  return (
    <div className="p-3">
      {/* The wrapper below will show a loader until the API is loaded */}
      <div className="min-h-[600px] h-[calc(100vh-140px)] overflow-hidden rounded border">
        <GoogleMapsLoader>
          <LocationBounds height="100%" />
        </GoogleMapsLoader>
      </div>
    </div>
  );
};

export default LocationScreen;