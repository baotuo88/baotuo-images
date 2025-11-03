import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import DesktopPage from "./pages/DesktopPage";
import MobilePage from "./pages/MobilePage";

function TopNav() {
  const loc = useLocation();
  const atMobile = loc.pathname.startsWith("/mobile");
  return (
    <div className="bg-black/80 border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold">
          <Link to="/" className="hover:opacity-80">宝拓壁纸站</Link>
        </div>
        <div className="flex gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-full border ${
              !atMobile
                ? "bg-white text-black"
                : "text-white border-white/30 hover:bg-white/10"
            }`}
          >
            电脑壁纸
          </Link>
          <Link
            to="/mobile"
            className={`px-3 py-1.5 rounded-full border ${
              atMobile
                ? "bg-white text-black"
                : "text-white border-white/30 hover:bg-white/10"
            }`}
          >
            手机壁纸
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
        <TopNav />
        <Routes>
          <Route path="/" element={<DesktopPage />} />
          <Route path="/mobile" element={<MobilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
