import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

interface ContactTemplateProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const main = {
  backgroundColor: "#0f172a",
  color: '#f0f0f0',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  maxWidth: "100%",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "48px",
  color: '#f59e0b',
};

const text = {
  margin: "0 0 16px",
  lineHeight: "1.6",
};

export const ContactTemplate = ({ name, email, phone, message }: ContactTemplateProps) => (
  <Html>
    <Head />
    <Preview>New Enquiry from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>New Website Enquiry</Heading>
        <Text style={text}>You received a new message from your website contact form.</Text>
        
        <Text><strong>From:</strong> {name}</Text>
        <Text><strong>Email:</strong> {email}</Text>
        {phone && <Text><strong>Phone:</strong> {phone}</Text>}
        
        <Heading as="h2" style={{ ...heading, fontSize: '22px', marginTop: '30px' }}>Message</Heading>
        <Text style={{ ...text, whiteSpace: "pre-wrap" }}>{message}</Text>
      </Container>
    </Body>
  </Html>
);

export default ContactTemplate;
