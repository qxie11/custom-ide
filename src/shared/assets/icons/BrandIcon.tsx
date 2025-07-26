import type {SVGProps} from 'react';

export function BrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" {...props}>
      {/* Abstract representation of stacked layers or files, fitting tech theme */}
      <path d="M6 18L18 18" />
      <path d="M6 14L18 14" />
      <path d="M6 10L18 10" />
      <path d="M6 6L18 6" />
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
    </svg>
  );
}
