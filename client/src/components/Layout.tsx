import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Calculator, Database, Users, Stethoscope, Brain } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Calculator },
    { name: 'Outpatient', href: '/outpatient', icon: Users },
    { name: 'Inpatient', href: '/inpatient', icon: Stethoscope },
    { name: 'Database', href: '/database', icon: Database },
    { name: 'AI Analytics', href: '/ai-analytics', icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="header-enhanced text-white sticky top-0 z-50 border-b border-medical-primary/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-center h-14 sm:h-16 relative">
            {/* Logo and Title - Centered - Mobile Optimized */}
            <div className="flex items-center justify-center flex-1">
              <Calculator className="h-7 w-7 sm:h-8 sm:w-8 text-white mr-2 sm:mr-3" />
              <div className="text-center">
                <h1 className="text-base sm:text-xl font-bold text-white leading-tight">
                  Hospital Bill Calculator
                </h1>
                <p className="text-xs text-white/80 mt-0.5 hidden sm:block">
                  Professional Medical Billing System
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation Bar - Separate Row - Mobile Optimized */}
          <div className="border-t border-white/10">
            <nav className="flex justify-center py-2.5 px-1 overflow-x-auto">
              <div className="flex space-x-0.5 sm:space-x-1 min-w-max max-w-full">
                {navigation.map((item) => {
                  const isActive = location === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`nav-button-enhanced flex items-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium min-w-[70px] sm:min-w-[100px] max-w-[85px] sm:max-w-none justify-center flex-shrink-0 transition-all ${
                        isActive
                          ? 'nav-button-active bg-white/25 text-white font-semibold border border-white/30'
                          : 'text-white/90 hover:text-white hover:bg-white/15'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="whitespace-nowrap leading-tight truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;