import { BookOpen, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center space-x-2 mb-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-semibold text-slate-900">ModernBlog</span>
            </Link>
            <p className="text-sm text-slate-500">
              Share your thoughts and ideas with the world.
            </p>
          </div>

          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-8 items-center">
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-indigo-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-indigo-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>

            <div className="flex space-x-6 text-sm">
              <Link to="/" className="text-slate-500 hover:text-indigo-600 transition-colors">
                Home
              </Link>
              <Link to="/login" className="text-slate-500 hover:text-indigo-600 transition-colors">
                Login
              </Link>
              <Link to="/register" className="text-slate-500 hover:text-indigo-600 transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} ModernBlog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}