import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript
} from '@react-google-maps/api';
import { formatRelative } from 'date-fns';
import React, { useCallback, useRef, useState } from 'react';
import { useQuery } from 'react-query';

// Components
import CameraIcon from '../components/CameraIcon';
import useCreateLocation from '../hooks/useCreateLocation.ts';
import mapStyles from '../styles/mapStyles';
import Search from '../components/Search';
import Locate from '../components/Locate';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100vw',
  height: '100vh'
};

// Buenos Aires
const center = {
  lat: -34.61315,
  lng: -58.37723
};

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true
};

async function fetchLocationsRequest() {
  const response = await fetch('api/locations');
  const data = await response.json();
  const { locations } = data;
  return locations;
}

const App = () => {
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

  const [selected, setSelected] = useState(null);

  const handleMapClick = useCallback((e) => {
    createLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng()
    });
  }, []);

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  if (loadError) return 'Error loading map.';

  if (!isLoaded) return 'Loading map...';

  return (
    <>
      <div className="relative flex justify-center w-full">
        <h1 className="absolute top-0 left-0 z-10 p-0 m-0 mt-4 ml-4 text-2xl">
          Film Here <CameraIcon />
        </h1>

        <Search panTo={panTo} />

        <Locate panTo={panTo} />
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={center}
        options={options}
        onClick={handleMapClick}
        onLoad={onMapLoad}>
        {locations
          ? locations.map((location) => (
              <Marker
                key={location.createdAt}
                position={{ lat: location.latitude, lng: location.longitude }}
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
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}>
            <div>
              <h2>Hi Peeps</h2>
              <p>This is a good place to shoot!</p>
              <p>Verified last {formatRelative(selected.time, new Date())}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </>
  );
};

export default App;
