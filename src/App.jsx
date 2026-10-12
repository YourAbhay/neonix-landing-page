import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import BottomBar from "./components/BottomBar/BottomBar2";

function App() {
  return (
    <main className="landing-page">

      <div className="landing-frame">

        <Navbar />

        <Hero />

        <BottomBar />

      </div>

    </main>
  );
}

export default App;