import * as React from 'react';

interface AccordionRootProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  defaultValue?: string;
}

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const Root = ({
  children,
  type: _type,
  collapsible: _collapsible,
  defaultValue: _defaultValue,
  ...props
}: AccordionRootProps) => <div {...props}>{children}</div>;

export const Item = React.forwardRef<HTMLDivElement, DivProps>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
);
Item.displayName = 'AccordionItem';

export const Header = ({ children, ...props }: DivProps) => (
  <div {...props}>{children}</div>
);

export const Trigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button ref={ref} type="button" {...props}>
    {children}
  </button>
));
Trigger.displayName = 'AccordionTrigger';

export const Content = React.forwardRef<HTMLDivElement, DivProps>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
);
Content.displayName = 'AccordionContent';
