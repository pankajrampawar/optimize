import "./globals.css";
import { UserProvider } from "@/context/userContext";
import Sidebar from "./component/sidbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <UserProvider>
          <div className="flex gap-2">
            <div>
              <Sidebar />
            </div>
            <div>
              {children}
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
