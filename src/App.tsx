import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PreferencesProvider } from './context/PreferencesContext';
import { Layout } from './components/Layout';
import { KnowledgeGateGuard } from './components/KnowledgeBaseGate';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Documents } from './pages/Documents';
import { Dependencies } from './pages/Dependencies';
import { About } from './pages/About';
import { BookPreviewPage } from './pages/BookPreviewPage';
import { USAddressGenerator } from './pages/Tools/USAddressGenerator';
import { AppleIdShared } from './pages/Tools/AppleIdShared';
import { ImageCompressor } from './pages/Tools/ImageCompressor';
import { ToolsIndex } from './pages/Tools/ToolsIndex';
import { KnowledgeBase } from './pages/KnowledgeBase';
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
            <Route path="/books/:bookId" element={<BookPreviewPage />} />
            <Route path="/tools" element={<ToolsIndex />} />
            <Route path="/tools/us-address" element={<USAddressGenerator />} />
            <Route path="/tools/apple-id-shared" element={<AppleIdShared />} />
            <Route path="/tools/image-compress" element={<ImageCompressor />} />
            <Route
              path="/knowledge-base"
              element={
                <KnowledgeGateGuard>
                  <KnowledgeBase />
                </KnowledgeGateGuard>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </PreferencesProvider>
  );
};

export default App;
