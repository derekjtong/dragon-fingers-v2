import { SpeedInsights } from "@vercel/speed-insights/next";
import NavBar from "./components/Navbar";
import AuthContext from "./context/AuthContext";

import "./globals.css";

export const metadata = {
  title: "Dragon Fingers",
  description: "May your fingers flow like dragon",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-w-full">
        <AuthContext>
          <NavBar />
          {children}
        </AuthContext>
        <SpeedInsights />
      </body>
    </html>
  );
}
