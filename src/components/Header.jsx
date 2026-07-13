import { Users } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Users className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-gray-900">AccessLink</span>
        </a>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#search" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Search
          </a>
          <a href="#report" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Report
          </a>
          <a href="https://github.com/jmizzo29/accesslink" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            GitHub
          </a>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
            Verify on Monad ⛓️
          </button>
        </nav>
      </div>
    </header>
  )
}
