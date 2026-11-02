import type { ReactNode } from 'react';

type OperatorProps = {
  name: string;
  tag?: string;
  price: string;
  pick?: boolean;
  children: ReactNode;
};

export const Operator = ({ name, tag, price, pick = false, children }: OperatorProps) => (
  <div className={pick ? 'op pick' : 'op'}>
    <div className="op-top">
      <span className="op-name">
        {name}
        {tag && <span className="tag">{tag}</span>}
      </span>
      <span className="price">{price}</span>
    </div>
    {children}
  </div>
);
