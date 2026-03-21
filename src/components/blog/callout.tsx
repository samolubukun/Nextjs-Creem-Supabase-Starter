import * as React from 'react';

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 bg-primary/5 border-l-4 border-primary rounded-r-2xl my-8 backdrop-blur-sm">
      <div className="text-foreground font-medium italic">
        {children}
      </div>
    </div>
  );
}
