import "./globals.css";

export const metadata = {
  title: "Dragon Fingers",
  description: "May your fingers flow like dragon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
