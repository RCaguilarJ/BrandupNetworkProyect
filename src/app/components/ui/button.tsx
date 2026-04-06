import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'default' | 'icon';

type ButtonVariantOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantOptions {
  children: React.ReactNode;
}

const baseStyles =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600',
  outline:
    'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 focus-visible:ring-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
  ghost: 'hover:bg-gray-100 focus-visible:ring-gray-300',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4',
  lg: 'h-12 px-6',
  default: 'h-10 px-4',
  icon: 'h-10 w-10',
};

export function buttonVariants({
  variant = 'default',
  size = 'default',
}: ButtonVariantOptions = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size]);
}

export function Button({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
