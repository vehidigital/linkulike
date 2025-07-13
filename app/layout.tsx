import type { Metadata } from "next"
import { Inter, Roboto, Open_Sans, Poppins, Montserrat, Playfair_Display } from 'next/font/google';
import "./globals.css"
import ClientRoot from "./client-root"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { uploadRouter } from "./api/uploadthing/uploadthingRouter";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })
const roboto = Roboto({ subsets: ["latin"], variable: '--font-roboto', weight: ["400", "700"] })
const openSans = Open_Sans({ subsets: ["latin"], variable: '--font-open-sans' })
const poppins = Poppins({ subsets: ["latin"], variable: '--font-poppins', weight: ["400", "700"] })
const montserrat = Montserrat({ subsets: ["latin"], variable: '--font-montserrat' })
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: "linkulike - Link what you like",
  description: "Create your personalized bio link page for all your social media links",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${roboto.variable} ${openSans.variable} ${poppins.variable} ${montserrat.variable} ${playfair.variable}`}>
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(uploadRouter)}
        />
        <ClientRoot>
          {children}
        </ClientRoot>
      </body>
    </html>
  )
}
