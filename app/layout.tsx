import NavBar from "./components/Navbar";
import "./globals.css";

export const metadata = {
  title: "Dragon Fingers",
  description: "May your fingers flow like dragon",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
