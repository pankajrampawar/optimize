import "./globals.css";
import { UserProvider } from "@/context/userContext";
import Sidebar from "./component/sidbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-neutral-50`}
      >
        <UserProvider>
          <div className="flex gap-2">
            <div>
              <Sidebar />
            </div>
            <div className="w-full">
              {children}
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
