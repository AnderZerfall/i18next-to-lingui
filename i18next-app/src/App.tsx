import { Content } from "./components/Content";
import { Navbar } from "./components/Navbar";
import { Status } from "./components/Status";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Content />
      <Status />
    </div>
  );
}

export default App;