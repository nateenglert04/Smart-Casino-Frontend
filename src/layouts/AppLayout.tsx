import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Spade, BookOpen, Trophy, Settings, Menu, User as UserIcon, LogOut, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import smartCasinoLogo from '../assets/smart-casino.png';
import { useAuth } from '../contexts/AuthContext';
import { QrAccessModal } from '../components/QrModal';


export default function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user, logout } = useAuth();
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'SC';

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Card Games', icon: Spade, path: '/games' },
    { label: 'Lessons', icon: BookOpen, path: '/lessons' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-center border-b border-sidebar-border">
        <img src={smartCasinoLogo} alt="Smart Casino" className="h-12 w-auto object-contain" />
        <span className="ml-3 font-bold text-xl tracking-tight text-sidebar-foreground">
          Smart Casino
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group
              ${isActive 
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' 
                : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Version info */}
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/50 text-center">
        Smart Casino v1.0
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all">
        
        {/* Top Navbar */}
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-40">
          
          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 bg-sidebar border-sidebar-border w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          <h1 className="hidden md:block text-lg font-semibold opacity-0">Spacer</h1> {/* Keep layout balanced */}

          {/* User Account Dropdown */}
          <div className="flex items-center gap-4 ml-auto">
            <QrAccessModal />
            <div className="hidden md:flex items-center px-3 py-1.5 bg-sidebar-primary/10 rounded-full border border-sidebar-primary/20">
                <Wallet className="w-4 h-4 mr-2 text-sidebar-primary" />
                <span className="font-bold text-sm text-foreground">
                    {user?.balance?.toLocaleString() ?? 0} Credits
                </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
                    <AvatarFallback>{getInitials(user?.username || '')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Account Info</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Preferences</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={logout} 
                    className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}