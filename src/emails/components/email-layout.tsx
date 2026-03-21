import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logoText}>🚀 SAASXCREEM</Text>
          </Section>
          {children}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              SAASXCREEM • The ultimate SaaS command center.
            </Text>
            <Text style={styles.footerLinks}>
              Built with Next.js, Supabase & Creem
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: '#f8fafc',
    fontFamily:
      "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    margin: '0',
    padding: '40px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    maxWidth: '600px',
    width: '100%',
  },
  header: {
    borderBottom: '1px solid #e2e8f0',
    padding: '24px 32px',
  },
  logoText: {
    color: '#ffbe98',
    display: 'inline-block',
    fontSize: '24px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    margin: '0',
  },
  footer: {
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #f1f5f9',
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#90a1b9',
    fontSize: '12px',
    margin: '0 0 8px 0',
  },
  footerLinks: {
    color: '#62748e',
    fontSize: '12px',
    margin: '0',
  },
};
