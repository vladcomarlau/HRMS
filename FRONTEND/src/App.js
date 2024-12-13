import './App.css';
import Main from './components/Main';
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "../node_modules/primeicons/primeicons.css";

function App() {
  return (
    <PrimeReactProvider>
      <Main/>
    </PrimeReactProvider>
  );
}

export default App;
