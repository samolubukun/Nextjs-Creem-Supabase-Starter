import { Link } from '@react-email/components';
import * as React from 'react';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'dark';
}

export function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const buttonStyle = {
    ...styles.base,
    ...styles[variant],
  };

  return (
    <Link href={href} style={buttonStyle}>
      {children}
    </Link>
  );
}

const styles = {
  base: {
    borderRadius: '8px',
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: '600' as const,
    lineHeight: '1',
    padding: '14px 28px',
    textAlign: 'center' as const,
    textDecoration: 'none',
    width: '240px',
    boxSizing: 'border-box' as const,
  },
  primary: {
    backgroundColor: '#ffbe98',
    border: '2px solid #ffbe98',
    color: '#000000',
  },
  secondary: {
    backgroundColor: '#ffffff',
    border: '2px solid #e2e8f0',
    color: '#314158',
  },
  dark: {
    backgroundColor: '#0f172a',
    border: '2px solid #0f172a',
    color: '#ffffff',
  },
};
