const Home = () => {
  return (
    <section
      className="bg-fixed h-screen bg-no-repeat bg-cover bg-center flex"
      style={{ backgroundImage: "url('/Photography-Scouting.png')" }}>
      <div className="mx-auto p-4 max-w-5xl flex-1 h-64 max-h-full">
        <div className="text-center text-gray-100 h-full bg-gray-600 p-8 rounded bg-opacity-75">
          <h1 className="text-4xl">Lets find you a location</h1>
        </div>
      </div>
    </section>
  );
};

export default Home;
