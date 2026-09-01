import { ReactNode, CSSProperties } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  bgClass?: string;
  className?: string;
  style?: CSSProperties;
}

export function SectionWrapper({ children, bgClass = '', className = '', style }: SectionWrapperProps) {
  return (
    <section className={`w-full ${bgClass} py-20 md:py-30 lg:py-3xl xl:py-4xl ${className}`} style={style}>
      <div className="container-site">
        {children}
      </div>
    </section>
  );
}
