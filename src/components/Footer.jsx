import { Heart, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-3">About AccessLink</h4>
            <p className="text-sm text-gray-400">
              Making travel accessible for wheelchair users through verified community data and blockchain trust.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Guidelines</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Connect</h4>
            <div className="flex gap-4">
              <a href="https://github.com/jmizzo29/accesslink" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p className="flex items-center justify-center gap-2">
            Built with <Heart className="w-4 h-4 text-red-500" /> for accessibility
          </p>
          <p className="mt-2">© 2026 AccessLink. Hackathon Project.</p>
        </div>
      </div>
    </footer>
  )
}
