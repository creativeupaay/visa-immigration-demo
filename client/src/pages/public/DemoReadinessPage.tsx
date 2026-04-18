import { Box, Button, Card, Divider, Stack, Typography } from "@mui/material";

const DemoReadinessPage = () => {
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
            Demo Readiness Guide
          </Typography>
          <Typography color="#6b7280">
            Use this checklist before starting a demo.
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography fontWeight={700}>What we have done here</Typography>

          <Typography>
            1. The superadmin is seeded in the database and credentials are:
          </Typography>
          <Typography sx={{ pl: 2 }}>ID - superadmin@demo.com</Typography>
          <Typography sx={{ pl: 2 }}>PASS - SuperAdmin@123</Typography>
          <Typography sx={{ pl: 2 }}>
            If not created, run <strong>npm run seed:superadmin</strong> to seed superadmin.
          </Typography>

          <Typography>
            2. The OTP has been hardcoded to <strong>111111</strong> in the whole system.
          </Typography>

          <Typography>
            3. The password for created clients is hardcoded to <strong>Client@12345</strong>.
          </Typography>

          <Typography>
            4. The link to the lead generation form is:
            <strong> {window.location.origin}/demo/lead-form</strong>
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