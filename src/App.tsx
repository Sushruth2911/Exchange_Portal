import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import UniversitySearch from './pages/UniversitySearch'
import UniversityDetail from './pages/UniversityDetail'
import CourseFinder from './pages/CourseFinder'
import ComparisonTool from './pages/ComparisonTool'
import SeatAllocation from './pages/SeatAllocation'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<UniversitySearch />} />
        <Route path="/university/:id" element={<UniversityDetail />} />
        <Route path="/courses" element={<CourseFinder />} />
        <Route path="/seats" element={<SeatAllocation />} />
        <Route path="/compare" element={<ComparisonTool />} />
      </Routes>
    </BrowserRouter>
  )
}
