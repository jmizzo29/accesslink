import { useState, useEffect } from 'react'
import { MapPin, CheckCircle2, AlertCircle, Upload, Filter } from 'lucide-react'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchSection from './components/SearchSection'
import ReportSection from './components/ReportSection'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <SearchSection />
      <ReportSection />
      <Footer />
    </div>
  )
}
