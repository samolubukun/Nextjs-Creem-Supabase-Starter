import { Heading, Section, Text } from "@react-email/components";
import { Button } from "../components/button";
import { EmailLayout } from "../components/email-layout";

export interface PaymentConfirmationEmailProps {
  firstName?: string;
  planName: string;
  amount: string;
  dashboardUrl?: string;
}

export function PaymentConfirmationEmail({
  firstName = "there",
  planName,
  amount,
  dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    : "https://saasxcreem.vercel.app/dashboard",
}: PaymentConfirmationEmailProps) {
  return (
    <EmailLayout previewText={`Payment Confirmed: ${planName} Plan is now Active!`}>
      <Section style={styles.content}>
        <Heading as="h1" style={styles.heading}>
          Payment Successful!
        </Heading>
        <Text style={styles.text}>
          Hey {firstName}! We&apos;ve successfully processed your payment for the {planName} plan.
        </Text>
        <Section style={styles.receiptBox}>
          <Text style={styles.receiptTitle}>Order Summary</Text>
          <Text style={styles.receiptItem}>
            <strong>Plan:</strong> {planName}
          </Text>
          <Text style={styles.receiptItem}>
            <strong>Amount Paid:</strong> {amount}
          </Text>
        </Section>
        <Section style={styles.buttonContainer}>
          <Button href={dashboardUrl}>Return to Dashboard →</Button>
        </Section>
        <Text style={styles.text}>
          Your new features are now available. Go forth and build something amazing!
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
  receiptBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "24px",
    margin: "32px 0",
    border: "1px solid #e2e8f0",
  },
  receiptTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    color: "#64748b",
    margin: "0 0 12px 0",
  },
  receiptItem: {
    fontSize: "16px",
    color: "#0f172a",
    margin: "4px 0",
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
};

export default PaymentConfirmationEmail;
