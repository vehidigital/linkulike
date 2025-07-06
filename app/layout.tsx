import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientRoot from "./client-root"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { uploadRouter } from "./api/uploadthing/uploadthingRouter";

const inter = Inter({ subsets: ["latin"] })

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
    <html lang="en">
      <body className={inter.className}>
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
