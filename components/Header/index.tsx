import CameraIcon from '../CameraIcon';
import Locate from '../Locate';
import Search from '../Search';

const Header = ({ panTo }): JSX.Element => {
  return (
    <header className="relative flex justify-center w-full">
      <h1 className="absolute top-0 left-0 z-10 p-0 m-0 mt-4 ml-4 text-2xl">
        Film Here <CameraIcon />
      </h1>
      <Search panTo={panTo} />
      <Locate panTo={panTo} />
    </header>
  );
};

export default Header;
