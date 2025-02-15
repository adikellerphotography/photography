
import { SVGProps } from 'react';

export function Yoga(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 17c3 0 7-3 7-7 0-2-2-3-4-3s-3 1-3 3c0-2-1-3-3-3s-4 1-4 3c0 4 4 7 7 7Z" />
      <path d="M8 17c0 3 2 5 4 5s4-2 4-5" />
    </svg>
  );
}
