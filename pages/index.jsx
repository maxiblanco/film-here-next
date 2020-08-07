import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover
} from '@reach/combobox';
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript
} from '@react-google-maps/api';
import { formatRelative } from 'date-fns';
import React, { useCallback, useRef, useState } from 'react';
import { queryCache, useMutation, useQuery } from 'react-query';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng
} from 'use-places-autocomplete';

// Components
import CameraIcon from '../components/CameraIcon';
import mapStyles from '../styles/mapStyles';

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

async function createLocationRequest(locationData) {
  const response = await fetch('api/locations/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: locationData })
  });
  const data = await response.json();
  return data;
}

function useCreateLocation() {
  return useMutation(createLocationRequest, {
    onMutate: (locationData) => {
      // Cancel any query
      queryCache.cancelQueries('locations');
      // Save snapshot of queryCache for rollback
      const snapshot = queryCache.getQueryData('locations');
      // Optimistically update cache
      queryCache.setQueryData('locations', (prev) => [
        ...prev,
        {
          id: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...locationData
        }
      ]);
      // Return rollback, function that resets cache to snapshot
      return () => queryCache.setQueryData('locations', snapshot);
    },
    onError: (error, locationData, rollback) => rollback(),
    onSettled: () => queryCache.invalidateQueries('locations')
  });
}

const App = () => {
  const { isLoaded, loadError } = useLoadScript({
    /* Google API Key must be enabled for Maps and Places API */
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  });

  /*   const [markers, setMarkers] = useState([]); */
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
    <div>
      <div className="relative flex justify-center w-full">
        <h1 className="absolute z-10 top-0 left-0 p-0 m-0 mt-4 ml-4 text-2xl">
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
    </div>
  );
};

const Search = ({ panTo }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => -34.61315, lng: () => -58.37723 },
      radius: 200 * 1000
    }
  });
  return (
    <div className="absolute leading-loose z-10 top-0 p-0 mt-4 w-1/3 text-xl">
      <Combobox
        onSelect={async (address) => {
          setValue(address, false);
          clearSuggestions();

          try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            panTo({ lat, lng });
          } catch (error) {
            console.log('error!');
          }
        }}>
        <ComboboxInput
          className="w-full px-2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder="Enter an address..."
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === 'OK' &&
              data.map(({ id, description }) => (
                <ComboboxOption key={'address-' + id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
};

const Locate = ({ panTo }) => {
  const handleLocateClick = () => {
    const onLocationSuccess = (position) => {
      panTo({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    };

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        () => {},
        options
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };
  return (
    <button
      className="absolute z-10 top-0 right-0 p-0 m-0 mt-4 mr-4 w-12 h-12"
      onClick={handleLocateClick}>
      <img src="/compass.svg" alt="compass - Locate me" />
    </button>
  );
};

export default App;
