export function getStatusCopy(status: string) {
  if (status === "paid") {
    return "Registration confirmed. Your QR ticket has been generated.";
  }
  if (status === "pending") {
    return "Registration received. Payment instructions will follow from the organizer.";
  }
  return "Registration submitted. Our team will contact you with next steps.";
}
