import { Heading, Section, Text } from "@react-email/components";
import { Button } from "../components/button";
import { EmailLayout } from "../components/email-layout";

export interface WelcomeEmailProps {
  firstName?: string;
  dashboardUrl?: string;
}

export function WelcomeEmail({
  firstName = "there",
  dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : "https://saasxcreem.vercel.app/dashboard",
}: WelcomeEmailProps) {
  return (
    <EmailLayout previewText="Welcome to SAASXCREEM! Your system starts now.">
      <Section style={styles.content}>
        <Heading as="h1" style={styles.heading}>
          System Activated!
        </Heading>
        <Text style={styles.text}>
          Hey {firstName}! Welcome to SAASXCREEM. You&apos;re now equipped with the ultimate command
          center for your SaaS.
        </Text>
        <Section style={styles.buttonContainer}>
          <Button href={dashboardUrl}>Open Command Center</Button>
        </Section>
        <Text style={styles.text}>
          If you have any questions, just reply to this email. We&apos;re here to help you scale.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const styles = {
  content: {
    padding: "32px",
  },
  heading: {
    color: "#0f172b",
    fontSize: "24px",
    fontWeight: "bold",
    lineHeight: "32px",
    margin: "0 0 16px 0",
  },
  text: {
    color: "#45556c",
    fontSize: "16px",
    lineHeight: "26px",
    margin: "0 0 24px 0",
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
};

export default WelcomeEmail;
