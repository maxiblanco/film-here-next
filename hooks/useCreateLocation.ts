import { queryCache, useMutation } from 'react-query';

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

export default useCreateLocation;
