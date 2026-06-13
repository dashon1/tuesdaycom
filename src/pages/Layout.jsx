
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
        LayoutGrid, 
        Search, 
        Bell, 
        Settings, 
        HelpCircle,
        Folder,
        Users,
        Menu as MenuIcon,
        X,
        TrendingUp,
        Calendar,
        Command
      } from "lucide-react";
import NotificationCenter from "./components/notifications/NotificationCenter";
import GlobalSearch from "./components/search/GlobalSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutGrid,
  },
  {
    title: "My Boards",
    url: createPageUrl("Boards"),
    icon: Folder,
  },
  {
    title: "Calendar",
    url: createPageUrl("Calendar"),
    icon: Calendar,
  },
  {
    title: "Workload",
    url: createPageUrl("Workload"),
    icon: Users,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: TrendingUp,
  },
];

const userNavigation = [
    { name: 'Your Profile', href: createPageUrl("Settings") },
    { name: 'Settings', href: createPageUrl("Settings") },
    { name: 'Sign out', href: '#' },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F8]">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-[#E1E5F3] shadow-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Logo and Main Nav */}
            <div className="flex items-center">
              {/* Logo */}
              <Link to={createPageUrl("Dashboard")} className="flex-shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF3D00] rounded-lg flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-[#323338] text-xl">Momentum</span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === item.url
                        ? 'bg-[#E1E5F3] text-[#0073EA]'
                        : 'text-[#323338] hover:bg-[#F5F6F8] hover:text-[#0073EA]'
                    }`}
                    aria-current={location.pathname === item.url ? 'page' : undefined}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Center Section: Search (Desktop) */}
            <div className="hidden md:flex flex-1 justify-center px-2 lg:ml-6 lg:justify-end">
              <div className="max-w-lg w-full lg:max-w-xs">
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span className="flex-1 text-left">Search everything...</span>
                  <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-white border rounded">
                    <Command className="w-3 h-3" />K
                  </kbd>
                </button>
              </div>
            </div>
            
            {/* Right Section: Icons and User Menu */}
            <div className="hidden md:ml-4 md:flex md:items-center md:space-x-2">
              <NotificationCenter />
              <Button variant="ghost" size="icon" className="hover:bg-[#E1E5F3] rounded-lg h-10 w-10">
                <HelpCircle className="w-5 h-5 text-[#676879]" />
              </Button>
              <Link to={createPageUrl("Settings")}>
                <Button variant="ghost" size="icon" className="hover:bg-[#E1E5F3] rounded-lg h-10 w-10">
                  <Settings className="w-5 h-5 text-[#676879]" />
                </Button>
              </Link>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full h-10 w-10 p-0">
                     <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B00] to-[#FF3D00] rounded-full flex items-center justify-center shadow-md">
                       <span className="text-white font-bold text-xs">U</span>
                     </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.href}>{item.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover:bg-[#E1E5F3] rounded-lg h-10 w-10"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E1E5F3]">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    location.pathname === item.url
                      ? 'bg-[#E1E5F3] text-[#0073EA]'
                      : 'text-[#323338] hover:bg-[#F5F6F8] hover:text-[#0073EA]'
                  }`}
                  aria-current={location.pathname === item.url ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
            </div>
            {/* Mobile Search */}
            <div className="pt-4 pb-3 border-t border-gray-200">
               <div className="px-2">
                <label htmlFor="search-mobile" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <Input
                    id="search-mobile"
                    name="search-mobile"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#0073EA] focus:border-[#0073EA] sm:text-sm"
                    placeholder="Search everything..."
                    type="search"
                  />
                </div>
              </div>
            </div>
            {/* Mobile User Menu */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B00] to-[#FF3D00] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">U</span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">User Name</div>
                  <div className="text-sm font-medium text-gray-500">user@example.com</div>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto hover:bg-[#E1E5F3] rounded-lg h-10 w-10">
                  <Bell className="w-5 h-5 text-[#676879]" />
                </Button>
              </div>
              <div className="mt-3 px-2 space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
}
