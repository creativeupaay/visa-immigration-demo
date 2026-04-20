import { Box, Button, Card, Divider, Stack, Typography, Link } from "@mui/material";
import { useState } from "react";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import CheckIcon from "@mui/icons-material/Check";

const DemoReadinessPage = () => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, index: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const CopyIconButton = ({ text, index, label }: { text: string; index: string; label: string }) => (
    <Button
      startIcon={copiedIndex === index ? <CheckIcon sx={{ fontSize: 16 }} /> : <FileCopyIcon sx={{ fontSize: 16 }} />}
      onClick={() => handleCopy(text, index)}
      variant="contained"
      size="small"
      sx={{
        textTransform: "none",
        fontSize: "0.75rem",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "6px",
        background: copiedIndex === index 
          ? "linear-gradient(135deg, #e8d5b7 0%, #d4c5a0 100%)" 
          : "linear-gradient(135deg, #1a1a2e 0%, #2d2d4a 100%)",
        color: copiedIndex === index ? "#1a1a2e" : "#e8d5b7",
        boxShadow: copiedIndex === index
          ? "0 3px 8px rgba(232, 213, 183, 0.2)"
          : "0 3px 8px rgba(26, 26, 46, 0.2)",
        border: "none",
        "&:hover": {
          background: copiedIndex === index
            ? "linear-gradient(135deg, #d4c5a0 0%, #c0b08b 100%)"
            : "linear-gradient(135deg, #2d2d4a 0%, #3f3f5e 100%)",
          boxShadow: copiedIndex === index
            ? "0 4px 10px rgba(232, 213, 183, 0.3)"
            : "0 4px 10px rgba(26, 26, 46, 0.3)",
          transform: "translateY(-1px)",
        },
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {copiedIndex === index ? "Copied!" : label}
    </Button>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f4f4f6",
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Card
        sx={{
          maxWidth: 980,
          margin: "0 auto",
          p: { xs: 2.5, md: 4 },
          borderRadius: 3,
          border: "0.5px solid #e2e4e9",
          boxShadow: "0 8px 30px rgba(20, 20, 40, 0.06)",
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h4" fontWeight={700} color="#1f2937">
            VisaFlow Readiness Guide
          </Typography>
          <Typography color="#6b7280">
            Use this checklist before starting a demo.
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography fontWeight={700}>What we have done here</Typography>

          <Typography>
            1. The superadmin is seeded in the database and credentials are:
          </Typography>
          <Stack spacing={1} sx={{ pl: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography sx={{ minWidth: "200px" }}>ID - <strong>superadmin@demo.com</strong></Typography>
              <CopyIconButton text="superadmin@demo.com" index="id" label="Copy ID" />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography sx={{ minWidth: "200px" }}>PASS - <strong>SuperAdmin@123</strong></Typography>
              <CopyIconButton text="SuperAdmin@123" index="password" label="Copy Pass" />
            </Stack>
          </Stack>

          <Typography>
            2. The OTP has been hardcoded to <strong>111111</strong> in the whole system.
          </Typography>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography>
              3. The password for created clients is hardcoded to <strong>Client@12345</strong>.
            </Typography>
            <CopyIconButton text="Client@12345" index="clientPassword" label="Copy" />
          </Stack>

          <Typography>
            4. The link to the lead generation form is:{" "}
            <Link
              href={`${window.location.origin}/demo/lead-form`}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ fontWeight: 600, color: "#1f2937" }}
            >
              {window.location.origin}/demo/lead-form
            </Link>
          </Typography>

          <Typography>
            5. Mocked Calendly is implemented, with copy-link button and reschedule working.
          </Typography>

          <Typography>6. Mock payment gateway is implemented.</Typography>

          <Divider sx={{ my: 1 }} />

          <Typography fontWeight={700}>Card Details</Typography>
          <Typography sx={{ pl: 2 }}>Card Number: 4242 4242 4242 4242</Typography>
          <Typography sx={{ pl: 2 }}>Card Holder: John Doe</Typography>
          <Typography sx={{ pl: 2 }}>Expiry Date: 12 / 26</Typography>
          <Typography sx={{ pl: 2 }}>CVC: 123</Typography>

          <Divider sx={{ my: 1 }} />

          <Typography fontWeight={700}>Billing Address</Typography>
          <Typography sx={{ pl: 2 }}>Email: client@example.com</Typography>
          <Typography sx={{ pl: 2 }}>Name: John Doe</Typography>
          <Typography sx={{ pl: 2 }}>Country: United States</Typography>
          <Typography sx={{ pl: 2 }}>Address: 123 Main Street</Typography>
          <Typography sx={{ pl: 2 }}>City: New York</Typography>
          <Typography sx={{ pl: 2 }}>State: NY</Typography>
          <Typography sx={{ pl: 2 }}>ZIP Code: 10001</Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => window.location.assign("/login")}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                bgcolor: "#1a1a2e",
                color: "#e8d5b7",
                "&:hover": { bgcolor: "#2d2d4a" },
              }}
            >
              Back to Login
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.assign("/demo/lead-form")}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                borderColor: "#d1d5db",
                color: "#374151",
              }}
            >
              Open Lead Form
            </Button>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};

export default DemoReadinessPage;