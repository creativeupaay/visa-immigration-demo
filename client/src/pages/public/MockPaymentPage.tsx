import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Container,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";

interface ProductItem {
  name: string;
  quantity: number;
  price: number;
}

const MockPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leadId = searchParams.get("leadId") || "";
  const stepStatusId = searchParams.get("stepStatusId") || "";
  const queryAmount = searchParams.get("amount");
  const queryCurrency = searchParams.get("currency") || "usd";

  // Get currency symbol
  const getCurrencySymbol = (curr: string): string => {
    switch (curr.toLowerCase()) {
      case "usd": return "$";
      case "eur": return "€";
      case "inr": return "₹";
      case "gbp": return "£";
      default: return curr.toUpperCase();
    }
  };

  // Parse amount from query parameter, default to 0 if not provided
  const paymentAmount = queryAmount ? parseFloat(queryAmount) : 0;
  const currencySymbol = getCurrencySymbol(queryCurrency);

  // Dummy product data - adjusted for different currencies
  const products: ProductItem[] = [
    { name: "Visa Processing", quantity: 1, price: paymentAmount * 0.4 },
    { name: "Document Verification", quantity: 1, price: paymentAmount * 0.35 },
    { name: "Consultation Fee", quantity: 1, price: paymentAmount * 0.25 },
  ];

  const shipping = Math.round(paymentAmount * 0.05 * 100) / 100; // 5% of amount
  const subtotal = paymentAmount;
  const total = subtotal + shipping;

  // Form state
  const [email, setEmail] = useState("client@example.com");
  const [fieldName, setFieldName] = useState("John Doe");
  const [country, setCountry] = useState("United States");
  const [address, setAddress] = useState("123 Main Street");
  const [city, setCity] = useState("New York");
  const [state, setState] = useState("NY");
  const [zipCode, setZipCode] = useState("10001");
  
  // Payment details state - pre-filled with test data
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiryMonth, setExpiryMonth] = useState("12");
  const [expiryYear, setExpiryYear] = useState("2026");
  const [cvc, setCvc] = useState("123");
  const [cardHolder, setCardHolder] = useState("John Doe");
  
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadId && !stepStatusId) {
      toast.error("Lead or step status ID not found");
      return;
    }

    // Validate card (basic validation)
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Invalid card number");
      return;
    }

    if (cvc.length !== 3) {
      toast.error("Invalid CVC");
      return;
    }

    setLoading(true);

    try {
      const endpoint = stepStatusId
        ? `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/public/mock-payment/process-dubai`
        : `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/public/mock-payment/process`;

      const response = await fetch(
        endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId,
            stepStatusId,
            cardNumber: cardNumber.replace(/\s/g, ""),
            cardHolder,
            amount: total,
            currency: queryCurrency,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Payment processing failed");
      }

      const result = await response.json();

      setSuccessMessage(`Payment Successful! Transaction ID: ${result.transactionId}`);
      toast.success("Payment processed successfully!");

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if ((!leadId && !stepStatusId) || !queryAmount) {
    return (
      <Container>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error">
            Invalid payment link. Required payment details not found.
          </Typography>
        </Box>
      </Container>
    );
  }

  if (successMessage) {
    return (
      <Container>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card sx={{ maxWidth: 500, textAlign: "center", p: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "green", fontWeight: "bold" }}>
              ✓ Payment Successful
            </Typography>
            <Typography sx={{ mb: 2 }}>{successMessage}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Redirecting to login in 3 seconds...
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{ bgcolor: "#2C3E50", textTransform: "none" }}
            >
              Go to Login
            </Button>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4, display: "flex", gap: 4, flexWrap: { xs: "wrap", md: "nowrap" } }}>
        {/* Left Side - Order Summary */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 45%" } }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "#2C3E50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Typography sx={{ color: "white", fontWeight: "bold", fontSize: 20 }}>
                    D
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Visa Demo
                </Typography>
                <Typography
                  sx={{
                    ml: 2,
                    bgcolor: "#FFA500",
                    color: "white",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  TEST MODE
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Order Summary
              </Typography>

              {/* Products */}
              {products.map((product, index) => (
                <Box key={index} sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Box>
                    <Typography variant="body2">{product.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Qty {product.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: "500" }}>
                    {currencySymbol}
                    {(product.price * product.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Totals */}
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">
                  {currencySymbol}
                  {subtotal.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2">Shipping</Typography>
                <Typography variant="body2">
                  {currencySymbol}
                  {shipping.toFixed(2)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Total due
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {currencySymbol}
                  {total.toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ bgcolor: "#F5F5F5", p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  {stepStatusId
                    ? `Step Status ID: ${stepStatusId}`
                    : `Lead ID: ${leadId}`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Side - Payment Form */}
        <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 55%" } }}>
          <form onSubmit={handlePayment}>
            {/* Apple Pay Button */}
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: "black",
                color: "white",
                py: 2,
                mb: 2,
                textTransform: "none",
                fontSize: 16,
                fontWeight: "bold",
                "&:hover": { bgcolor: "#1a1a1a" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.05 13.5c-.91 0-1.82-.45-2.25-1.3h2.5c.37 0 .67-.3.67-.67s-.3-.67-.67-.67h-3.07c.13-.35.2-.73.2-1.11 0-1.66-1.34-3-3-3-1.66 0-3 1.34-3 3 0 1.66 1.34 3 3 3 .4 0 .78-.08 1.13-.22-.04.41.27.79.68.79h2.62c.91 0 1.82.45 2.25 1.3.42.85.42 2.3 0 3.15-.43.85-1.34 1.3-2.25 1.3h-2.5c-.37 0-.67.3-.67.67s.3.67.67.67h2.5c1.66 0 3-1.34 3-3 0-1.66-1.34-3-3-3zm-6-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0 6c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
              </svg>
              Pay
            </Button>

            <Box sx={{ textAlign: "center", my: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography variant="body2" color="textSecondary">
                Or pay with card
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* Shipping Information Section */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Shipping information
            </Typography>

            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />

            <Typography variant="body2" sx={{ my: 2 }}>
              Shipping address
            </Typography>

            <TextField
              fullWidth
              label="Name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Country</InputLabel>
              <Select value={country} label="Country" onChange={(e) => setCountry(e.target.value)}>
                <MenuItem value="United States">United States</MenuItem>
                <MenuItem value="Canada">Canada</MenuItem>
                <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                <MenuItem value="India">India</MenuItem>
                <MenuItem value="UAE">UAE</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              margin="normal"
              required
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2, flexWrap: "wrap" }}>
              <TextField
                sx={{ flex: "1 1 auto", minWidth: 150 }}
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <TextField
                sx={{ flex: "0.5 1 auto", minWidth: 80 }}
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <TextField
                sx={{ flex: "0.5 1 auto", minWidth: 80 }}
                label="ZIP"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Payment Details Section */}
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Payment details
            </Typography>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Card information
            </Typography>

            <TextField
              fullWidth
              label="Card number"
              placeholder="1234 1234 1234 1234"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              margin="normal"
              required
              inputProps={{ maxLength: 19 }}
            />

            <Typography variant="caption" color="textSecondary" sx={{ display: "block", my: 1 }}>
              Test: Use 4242 4242 4242 4242 for success
            </Typography>

            <TextField
              fullWidth
              label="Name on card"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              margin="normal"
              required
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2, flexWrap: "wrap" }}>
              <TextField
                sx={{ flex: 2 }}
                label="MM / YY"
                placeholder="12 / 26"
                value={`${expiryMonth} / ${expiryYear}`}
                onChange={(e) => {
                  const val = e.target.value;
                  const parts = val.split(" / ");
                  if (parts[0]) setExpiryMonth(parts[0]);
                  if (parts[1]) setExpiryYear(parts[1]);
                }}
                required
              />
              <TextField
                sx={{ flex: 1 }}
                label="CVC"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                inputProps={{ maxLength: 3 }}
                required
              />
            </Box>

            <Box sx={{ p: 2, bgcolor: "#F5F5F5", borderRadius: 1, my: 2 }}>
              <Typography variant="caption" color="textSecondary">
                ✓ Billing address is same as shipping
              </Typography>
            </Box>

            {/* Pay Button */}
            <Button
              fullWidth
              type="submit"
              disabled={loading}
              variant="contained"
              sx={{
                bgcolor: "#2C3E50",
                color: "white",
                py: 2,
                mt: 3,
                textTransform: "none",
                fontSize: 16,
                fontWeight: "bold",
                "&:hover": { bgcolor: "#1a252f" },
                "&:disabled": { bgcolor: "#ccc" },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                `Pay ${currencySymbol}${total.toFixed(2)}`
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="caption" color="textSecondary">
                Powered by Stripe
              </Typography>
            </Box>
          </form>
        </Box>
      </Box>
    </Container>
  );
};

export default MockPaymentPage;
