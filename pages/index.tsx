import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript
} from '@react-google-maps/api';
/* import { formatRelative } from 'date-fns'; */
import React, { useCallback, useRef, useState } from 'react';
import { useQuery } from 'react-query';

// Components
import Header from '../components/Header';
import useCreateLocation from '../hooks/useCreateLocation';
import useWindowSize from '../hooks/useWindowsSize';
import mapStyles from '../styles/mapStyles';

const libraries = ['places'];

// Buenos Aires
const center = {
  lat: -34.61315,
  lng: -58.37723
};

const mapOptions = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true
};

interface Location {
  id?: string;
  latitude: number;
  longitude: number;
  createdAt?: Date;
}

async function fetchLocationsRequest() {
  const response = await fetch('api/locations');
  const data = await response.json();
  const { locations } = data;
  return locations;
}

const App: React.FC = () => {
  const windowSize = useWindowSize();
  const { isLoaded, loadError } = useLoadScript({
    /* Google API Key must be enabled for Maps and Places API */
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const { data: locations, error, status } = useQuery(
    'locations',
    fetchLocationsRequest
  );

  const [createLocation] = useCreateLocation();

  const [selected, setSelected] = useState<Location | null>(null);

  const handleMapClick = useCallback((e) => {
    createLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng()
    });
  }, []);

  const mapRef = useRef(null);
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  }, []);

  if (loadError) return <p>{'Error loading map.'}</p>;

  if (!isLoaded) return <p>{'Loading map...'}</p>;

  return (
    <>
      <Header panTo={panTo} />

      <GoogleMap
        mapContainerStyle={windowSize}
        zoom={10}
        center={center}
        options={mapOptions}
        onClick={handleMapClick}
        onLoad={onMapLoad}>
        {locations
          ? locations.map((location) => (
              <Marker
                key={location.createdAt}
                position={{
                  lat: location.latitude,
                  lng: location.longitude
                }}
                icon={{
                  url: '/clapper.svg',
                  scaledSize: new window.google.maps.Size(30, 30),
                  origin: new window.google.maps.Point(0, 0),
                  anchor: new window.google.maps.Point(15, 15)
                }}
                onClick={() => {
                  setSelected(location);
                }}
              />
            ))
          : null}

        {selected ? (
          <InfoWindow
            position={{ lat: selected.latitude, lng: selected.longitude }}
            onCloseClick={() => {
              setSelected(null);
            }}>
            <div>
              <h2>Hi Peeps</h2>
              <p>This is a good place to shoot!</p>
              {/*               
              TODO: Fix formatRelative createdAt not date error
              <p>
                Verified last {formatRelative(selected.createdAt, new Date())}
              </p> */}
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </>
  );
};

export default App;
