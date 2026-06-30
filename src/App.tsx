import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Documents } from './pages/Documents';
import { Dependencies } from './pages/Dependencies';
import { About } from './pages/About';
import { FireworksPage } from './pages/FireworksPage';

const App = () => {
  return (
    <PreferencesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/effects/fireworks" element={<FireworksPage />} />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/dependencies" element={<Dependencies />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PreferencesProvider>
  );
};

export default App;
