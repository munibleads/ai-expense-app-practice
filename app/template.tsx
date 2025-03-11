'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingSpinner from './components/LoadingSpinner';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    setIsChanging(true);
    const timeout = setTimeout(() => setIsChanging(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {isChanging && <LoadingSpinner />}
      {children}
    </>
  );
} 