export const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-IN", {
      dateStyle: "long",
      timeStyle: "short",
      hour12: true,
    });
  };