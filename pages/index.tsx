import {
  GoogleMap,
  InfoWindow,
  Marker,
  useLoadScript
} from '@react-google-maps/api';
/* import { formatRelative } from 'date-fns'; */
import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
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

type Inputs = {
  description: string;
  contact: string;
};

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
  const { register, handleSubmit, watch, errors } = useForm<Inputs>();

  const [createLocation] = useCreateLocation();

  const [selected, setSelected] = useState<Location | null>(null);

  const handleMapClick = useCallback((e) => {
    createLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng()
    });
  }, []);

  const onSubmit = (data) => console.log(data);

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
            {/*               
              TODO: Fix formatRelative createdAt not date error
              <p>
                Verified last {formatRelative(selected.createdAt, new Date())}
              </p> */}
            {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded px-8 pt-6 pb-8 mb-4">
              <h2 className="block text-gray-700 text-xl font-bold m-4">
                Locación disponible
              </h2>
              {/* register your input into the hook by invoking the "register" function */}
              <label
                htmlFor="description"
                className="block text-gray-700 text-sm font-bold mb-2">
                Descripción
                <input
                  name="description"
                  defaultValue="Disponible para fotos o videos."
                  ref={register}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                />
              </label>

              {/* include validation with required or other standard HTML validation rules */}
              <label
                htmlFor="contact"
                className="block text-gray-700 text-sm font-bold mb-2">
                Contacto
                <input
                  name="contact"
                  ref={register({ required: true })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </label>
              {/* errors will return when field validation fails  */}
              {errors.contact && (
                <span className="text-red-500 text-xs italic">
                  This field is required
                </span>
              )}

              <input
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              />
            </form>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </>
  );
};

export default App;
