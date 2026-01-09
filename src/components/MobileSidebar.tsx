import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface MobileSidebarProps {
  overdueCount: number;
}

export function MobileSidebar({ overdueCount }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className={cn("p-0 w-[240px] border-r-0 bg-sidebar")}>
        {/* The Sidebar component already contains the navigation and user info */}
        <Sidebar overdueCount={overdueCount} />
      </SheetContent>
    </Sheet>
  );
}