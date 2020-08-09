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
      className="absolute top-0 right-0 z-10 w-12 h-12 p-0 m-0 mt-4 mr-4"
      onClick={handleLocateClick}>
      <img src="/compass.svg" alt="compass - Locate me" />
    </button>
  );
};

export default Locate;
