import "./App.css";
import MapComponent from "./Map/map";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <div>
        MAP
        <MapComponent />
        <Toaster />
      </div>
    </>
  );
}

export default App;
