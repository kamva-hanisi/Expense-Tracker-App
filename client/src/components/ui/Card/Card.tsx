import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

const Card = ({ children, className = "", ...props }: CardProps) => {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
