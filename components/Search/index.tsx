import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover
} from '@reach/combobox';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng
} from 'use-places-autocomplete';

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
    <div className="absolute top-0 z-10 w-1/3 p-0 mt-6 text-xl leading-loose">
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
          className="w-full px-2 bg-gray-700 placeholder-white text-gray-100 rounded shadow bg-opacity-75"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder="Search location by address"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === 'OK'
              ? data.map(({ id, description }) => (
                  <ComboboxOption key={id} value={description} />
                ))
              : null}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
};

export default Search;
