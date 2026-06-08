import { Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar, title = 'Dashboard' }) => {
  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-surfaceHighlight flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-textMuted hover:text-textBase p-2 rounded-xl transition-colors hover:bg-surfaceHighlight"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-display font-medium text-textBase hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        

        
        <Link to="/profile" className="flex items-center gap-2 p-1.5 pl-3 border border-surfaceHighlight bg-background rounded-full hover:bg-surfaceHighlight transition-colors ml-2">
          <span className="text-sm font-medium text-textBase hidden sm:block">Profile</span>
          <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
            <User className="w-4 h-4 text-primary" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
