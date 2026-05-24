"use client"
import Footer from "@/components/footer";
import Header from "@/components/header";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSyncer from "@/components/ThemeSyncer";
import CookieBanner from "@/components/CookieBanner";
import '@/styles/main.css';
import Favicon from "@/components/Favicon";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Favicon />
        {/* Prevent flash of wrong theme on initial load */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              var p = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              if ((t || p) === 'dark') document.documentElement.classList.add('dark');
            } catch(e){}
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <ThemeProvider>
          <ConvexClientProvider>
            <AuthProvider>
              {/* Syncs saved theme from Convex on login — enables cross-device consistency */}
              <ThemeSyncer />
              <Header />
              {children}
              <Footer />
              {/* Cookie & storage consent banner */}
              <CookieBanner />
            </AuthProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
