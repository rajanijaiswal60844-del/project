'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderKanban, Bot, User, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
];

interface TopNavProps {
  onLogout: () => void;
}

export default function TopNav({ onLogout }: TopNavProps) {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
      <TooltipProvider>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
             <Link href="/" className="text-xl font-bold font-headline text-primary">
                FaceFilter AI
             </Link>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    size="icon"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </TooltipProvider>

        {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t h-16 flex items-center justify-around">
         {navItems.map((item) => (
              <Button
                key={item.label}
                asChild
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className="flex-1 h-full rounded-none flex-col gap-1 text-xs"
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </Button>
        ))}
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="flex-1 h-full rounded-none flex-col gap-1 text-xs">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/admin">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
