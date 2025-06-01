import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";
import "@/app/globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { CartIcon } from "@/components/CartIcon";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <CartProvider>
        <body>
          <CartIcon />
          {children}
        </body>
      </CartProvider>

      <PrismicPreview repositoryName={repositoryName} />
    </html>
  );
}
