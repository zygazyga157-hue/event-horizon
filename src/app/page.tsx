import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to Gate - every visitor must sign the ledger
  redirect("/gate");
}
