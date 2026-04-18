import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SLOT_TIMES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30",
];

const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EVENT_TITLE = "Visa Strategy Session";
const ORG_NAME = "Creative Upaay Enterprise";
const EVENT_DURATION = "30 min";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toPrettyTime = (time24: string): string => {
  const [hourRaw, minuteRaw] = time24.split(":");
  const hour = Number(hourRaw);
  const suffix = hour >= 12 ? "pm" : "am";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized}:${minuteRaw} ${suffix}`;
};

const combineToIso = (dateKey: string, time24: string): string => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hours, minutes] = time24.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
};

/** Generate mock availability for next ~21 weekdays with random slot gaps */
const createAvailability = (): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let offset = 1; offset <= 21; offset++) {
    const day = new Date(base);
    day.setDate(base.getDate() + offset);
    if (day.getDay() === 0) continue; // skip Sundays
    // random subset of slots so it looks realistic
    const slots = ALL_SLOT_TIMES.filter(() => Math.random() > 0.3);
    if (slots.length > 0) map[toDateKey(day)] = slots;
  }
  return map;
};

/** Build a 7-column calendar cell array (nulls = blank padding) */
const buildCalendarCells = (visibleMonth: Date): Array<Date | null> => {
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const startPad = firstDay.getDay();
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

// ─── Component ────────────────────────────────────────────────────────────────

const MockCalendlyPage = () => {
  const [params] = useSearchParams();
  const leadId = params.get("leadId") ?? "";

  const backendBaseUrl = useMemo(() => import.meta.env.VITE_BACKEND_BASE_URL, []);
  const availability = useMemo(() => createAvailability(), []);
  const availableDateKeys = useMemo(() => Object.keys(availability), [availability]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    availableDateKeys[0] ?? "",
  );
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    selectedDateKey ? new Date(`${selectedDateKey}T00:00:00`) : new Date(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedText, setConfirmedText] = useState("");

  const selectedDate = selectedDateKey
    ? new Date(`${selectedDateKey}T00:00:00`)
    : null;

  const selectedSlot =
    selectedDateKey && selectedTime
      ? combineToIso(selectedDateKey, selectedTime)
      : "";

  const daySlots = selectedDateKey ? (availability[selectedDateKey] ?? []) : [];

  const calendarCells = useMemo(
    () => buildCalendarCells(visibleMonth),
    [visibleMonth],
  );

  const selectedDateHeading = selectedDate
    ? selectedDate.toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    : "Pick a date";

  // ── Schedule handler ────────────────────────────────────────────────────────
  const scheduleSlot = async () => {
    if (!leadId) { toast.error("Missing leadId in URL"); return; }
    if (!selectedSlot) { toast.error("Please select a slot first"); return; }
    if (!backendBaseUrl) { toast.error("VITE_BACKEND_BASE_URL is missing"); return; }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${backendBaseUrl}/api/v1/public/mock-calendly/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, startTime: selectedSlot }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message ?? "Unable to schedule consultation");
      }
      const displayDate = new Date(selectedSlot).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      });
      setConfirmedText(displayDate);
      toast.success("Consultation scheduled successfully");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule consultation",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1.5, md: 3 },
        py: { xs: 2, md: 5 },
        background: "#f4f4f6",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 3,
          border: "0.5px solid #e2e4e9",
          boxShadow: "0 8px 32px rgba(20,20,40,0.07)",
          overflow: "hidden",
        }}
        elevation={0}
      >
        {/* ── Two-column grid ── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "300px minmax(0, 1fr)" },
            minHeight: { xs: "auto", md: 520 },
            alignItems: "stretch",
          }}
        >
          {/* ── Left panel ── */}
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              bgcolor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: 0,
              borderRight: { xs: "none", md: "0.5px solid #eceef2" },
            }}
          >
            {/* Logo mark */}
            <Box
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#1a1a2e",
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2.5,
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{
                  color: "#e8d5b7",
                  fontFamily: "'Georgia', serif",
                  fontSize: 18,
                  fontStyle: "italic",
                  lineHeight: 1,
                }}
              >
                C
              </Typography>
            </Box>

            <Typography
              sx={{ color: "#6b7280", fontWeight: 600, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", mb: 1 }}
            >
              {ORG_NAME}
            </Typography>

            <Typography
              sx={{ color: "#1f2937", fontWeight: 700, fontSize: { xs: 26, md: 30 }, lineHeight: 1.15, mb: 2.5, fontFamily: "'Georgia', serif" }}
            >
              {EVENT_TITLE}
            </Typography>

            {/* Meta rows */}
            <Stack spacing={1.2} sx={{ mb: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeRoundedIcon sx={{ color: "#6b7280", fontSize: 17 }} />
                <Typography sx={{ color: "#4b5563", fontSize: 13 }}>{EVENT_DURATION}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonOutlineRoundedIcon sx={{ color: "#6b7280", fontSize: 17 }} />
                <Typography sx={{ color: "#4b5563", fontSize: 13 }}>One-on-one</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <VideocamOutlinedIcon sx={{ color: "#6b7280", fontSize: 17 }} />
                <Typography sx={{ color: "#4b5563", fontSize: 13 }}>Video call link sent after booking</Typography>
              </Stack>
            </Stack>

            <Typography
              sx={{ color: "#4b5563", fontSize: 13, lineHeight: 1.7, mb: "auto" }}
            >
              Book a focused session with our immigration specialists. We'll walk
              through your visa timeline, eligibility, and exactly what documents
              you need.
            </Typography>

            {leadId && (
              <Typography sx={{ color: "#9ca3af", fontSize: 11, mt: 2 }}>
                Lead: {leadId}
              </Typography>
            )}

            {/* Timezone pill */}
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              sx={{
                mt: 3,
                display: "inline-flex",
                bgcolor: "#f3f4f6",
                border: "0.5px solid #e2e4e9",
                borderRadius: 10,
                px: 1.5,
                py: 0.7,
                width: "fit-content",
              }}
            >
              <PublicRoundedIcon sx={{ color: "#6b7280", fontSize: 14 }} />
              <Typography sx={{ color: "#4b5563", fontSize: 12 }}>
                IST — India Standard Time
              </Typography>
            </Stack>
          </Box>

          {/* ── Right panel ── */}
          <Box sx={{ p: { xs: 2.5, md: 4 }, bgcolor: "#ffffff" }}>
            <Typography
              sx={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "#6b7280", mb: 2.5 }}
            >
              Select a date &amp; time
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: 3, sm: 3 },
              }}
            >
              {/* ── Calendar ── */}
              <Box>
                {/* Month nav */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#1f2937", fontFamily: "'Georgia', serif" }}>
                    {MONTH_NAMES[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <Button
                      onClick={() =>
                        setVisibleMonth(
                          new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                        )
                      }
                      sx={{
                        minWidth: 32, width: 32, height: 32, p: 0, borderRadius: 1,
                        border: "0.5px solid #e2e4e9", color: "#6b7280",
                        "&:hover": { bgcolor: "#f3f4f6" },
                      }}
                    >
                      <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                    </Button>
                    <Button
                      onClick={() =>
                        setVisibleMonth(
                          new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                        )
                      }
                      sx={{
                        minWidth: 32, width: 32, height: 32, p: 0, borderRadius: 1,
                        border: "0.5px solid #e2e4e9", color: "#4338ca",
                        "&:hover": { bgcolor: "#eef2ff" },
                      }}
                    >
                      <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                    </Button>
                  </Stack>
                </Stack>

                {/* Day-of-week labels */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    gap: 0.4,
                    mb: 0.5,
                  }}
                >
                  {WEEK_DAYS.map((d) => (
                    <Typography
                      key={d}
                      sx={{ fontSize: 10, fontWeight: 700, letterSpacing: ".05em", color: "#9ca3af", textAlign: "center", py: 0.5 }}
                    >
                      {d.slice(0, 1)}
                    </Typography>
                  ))}

                  {/* Calendar cells */}
                  {calendarCells.map((cell, idx) => {
                    if (!cell) {
                      return <Box key={`blank-${idx}`} sx={{ height: 38 }} />;
                    }
                    const key = toDateKey(cell);
                    const hasSlots = Boolean(availability[key]);
                    const isSelected = key === selectedDateKey;
                    const isPast = cell < today;
                    const isToday = key === toDateKey(today);

                    return (
                      <Button
                        key={key}
                        onClick={() => {
                          if (!hasSlots || isPast) return;
                          setSelectedDateKey(key);
                          setSelectedTime("");
                        }}
                        disabled={!hasSlots || isPast}
                        sx={{
                          minWidth: 0,
                          height: 38,
                          borderRadius: 1.2,
                          fontSize: 13,
                          p: 0,
                          outline: isToday && !isSelected ? "1.5px solid #c7d2fe" : "none",
                          outlineOffset: "-1px",
                          color: isSelected
                            ? "#ffffff"
                            : hasSlots && !isPast
                            ? "#4338ca"
                            : "#d1d5db",
                          bgcolor: isSelected
                            ? "#1a1a2e"
                            : hasSlots && !isPast
                            ? "#eef2ff"
                            : "transparent",
                          fontWeight: isSelected ? 700 : 500,
                          "&:hover": {
                            bgcolor: isSelected
                              ? "#1a1a2e"
                              : hasSlots && !isPast
                              ? "#c7d2fe"
                              : "transparent",
                          },
                          "&.Mui-disabled": {
                            color: "#d1d5db",
                            bgcolor: "transparent",
                          },
                        }}
                      >
                        {cell.getDate()}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              {/* ── Time slots ── */}
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  sx={{ fontSize: 15, fontWeight: 600, color: "#1f2937", mb: 1.5, fontFamily: "'Georgia', serif" }}
                >
                  {selectedDateHeading}
                </Typography>

                <Box
                  sx={{
                    flex: 1,
                    maxHeight: 320,
                    overflowY: "auto",
                    pr: 0.5,
                    "&::-webkit-scrollbar": { width: 3 },
                    "&::-webkit-scrollbar-thumb": { bgcolor: "#e2e4e9", borderRadius: 4 },
                  }}
                >
                  <Stack spacing={0.8}>
                    {daySlots.length === 0 && (
                      <Typography sx={{ color: "#9ca3af", fontSize: 13, py: 1.5 }}>
                        No slots available for this day.
                      </Typography>
                    )}
                    {daySlots.map((time) => {
                      const isActive = selectedTime === time;
                      return (
                        <Button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          variant="outlined"
                          sx={{
                            justifyContent: "space-between",
                            textTransform: "none",
                            borderRadius: 1.2,
                            borderWidth: "1px",
                            borderColor: isActive ? "#1a1a2e" : "#c7d2fe",
                            bgcolor: isActive ? "#1a1a2e" : "#ffffff",
                            color: isActive ? "#e8d5b7" : "#4338ca",
                            fontWeight: 500,
                            fontSize: 14,
                            py: 1,
                            px: 1.5,
                            "&:hover": {
                              borderColor: "#4338ca",
                              bgcolor: isActive ? "#1a1a2e" : "#eef2ff",
                            },
                          }}
                        >
                          {toPrettyTime(time)}
                          <Typography
                            component="span"
                            sx={{ fontSize: 11, opacity: 0.6, color: "inherit" }}
                          >
                            {EVENT_DURATION}
                          </Typography>
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>

                {/* Actions */}
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={scheduleSlot}
                    disabled={isSubmitting || !selectedSlot || Boolean(confirmedText)}
                    sx={{
                      textTransform: "none",
                      borderRadius: 1.5,
                      fontWeight: 600,
                      fontSize: 14,
                      bgcolor: "#1a1a2e",
                      color: "#e8d5b7",
                      py: 1.1,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#2d2d4a", boxShadow: "none" },
                      "&.Mui-disabled": { bgcolor: "#e2e4e9", color: "#9ca3af" },
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={15} sx={{ mr: 1, color: "#e8d5b7" }} />
                        Scheduling…
                      </>
                    ) : (
                      "Confirm appointment"
                    )}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => window.location.assign("/login")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 1.5,
                      borderColor: "#e2e4e9",
                      color: "#4b5563",
                      fontSize: 13,
                      py: 1,
                      "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
                    }}
                  >
                    Back to login
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Confirmation banner ── */}
        {confirmedText && (
          <Box
            sx={{
              p: 2,
              bgcolor: "#f0fdf4",
              borderTop: "1px solid #bbf7d0",
              display: "flex",
              alignItems: "flex-start",
              gap: 1.2,
            }}
          >
            <CheckCircleOutlineRoundedIcon sx={{ color: "#16a34a", fontSize: 20, mt: 0.1, flexShrink: 0 }} />
            <Box>
              <Typography sx={{ color: "#15803d", fontWeight: 700, fontSize: 13 }}>
                Appointment confirmed
              </Typography>
              <Typography sx={{ color: "#166534", fontSize: 13 }}>
                {confirmedText}
              </Typography>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default MockCalendlyPage;