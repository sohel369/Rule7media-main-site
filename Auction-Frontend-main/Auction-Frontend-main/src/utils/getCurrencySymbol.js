export const getCurrencySymbol = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const country = data?.country_name || "United States";

    switch (country) {
      case "India":
        return "₹";
      case "Australia":
        return "A$";
      case "France":
        return "€";
      case "United States":
        return "$";
      case "Canada":
        return "C$";
      case "Japan":
        return "¥";
      case "Thailand":
        return "฿";
      case "Indonesia":
        return "Rp";
      case "Spain":
        return "€";
      case "United Kingdom":
        return "£";
      case "China":
        return "¥";
      default:
        return "A$"; // Default: Australia
    }
  } catch (error) {
    console.error("Error fetching IP info:", error);
    return "$"; // default
  }
};
