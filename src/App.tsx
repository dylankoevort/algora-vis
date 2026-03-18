import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar';
import { HomePage } from './pages/HomePage';
import { VisualiserPage } from './pages/VisualiserPage';

const App: React.FC = () => {
  return (
      <BrowserRouter>
        <div className="min-h-screen bg-stone-50 flex flex-col">
          <TopBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/visualise" element={<VisualiserPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
  );
};

export default App;