import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PERIOD_CONFIG, Period } from '@/types';
import * as Lucide from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface HeaderProps {
  overdueCount: number;
  children?: React.ReactNode; // Added children prop for mobile menu trigger
}

export function Header({ overdueCount, children }: HeaderProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const getPeriodInfo = () => {
    const hour = today.getHours();
    let period: Period;
    let greeting: string;

    if (hour < 12) {
      period = 'Manhã';
      greeting = 'Bom dia';
    } else if (hour < 18) {
      period = 'Tarde';
      greeting = 'Boa tarde';
    } else {
      period = 'Noite';
      greeting = 'Boa noite';
    }
    
    const config = PERIOD_CONFIG[period];
    const Icon = Lucide[config.icon as keyof typeof Lucide] as React.ElementType;
    
    // Use the period color variable for the icon color
    const colorClass = period === 'Manhã' ? 'text-period-morning' :
                       period === 'Tarde' ? 'text-period-afternoon' : 'text-period-night';

    return { greeting, Icon, colorClass };
  };
  
  const { greeting, Icon, colorClass } = getPeriodInfo();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Mobile Menu Trigger (Children) and Greeting */}
          <div className="flex items-center gap-3">
            {/* Render mobile menu trigger here */}
            {children} 
            
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                {greeting}
                <Icon className={cn("w-6 h-6", colorClass)} />
              </h1>
              <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
            </div>
          </div>
          
          {/* Right side (currently empty) */}
          <div />
        </div>
      </div>
    </header>
  );
}