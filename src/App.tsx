import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import StartPage from "./pages/StartPage";
import DocsPage from "./pages/DocsPage";
import AuthPage from "./pages/AuthPage";
import AccountPage from "./pages/AccountPage";
import TemplatesPage from "./pages/TemplatesPage";
import { AgentPage } from "./pages/AgentPage";
import CommunityPage from "./pages/CommunityPage";

// Blog is served as static, crawlable HTML from dist/blog/ (SEO).
// React Router only handles client-side paths; force a full page load so
// the static blog tree (not the SPA shell) renders.
function BlogRedirect() {
  window.location.href = "/blog/";
  return null;
}

// Scrolls the window to the top on every route change. Without this, React
// Router keeps the previous scroll position, so pages open mid-section.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/start" element={<StartPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/blog" element={<BlogRedirect />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/" element={<CommunityPage />} />
          <Route path="/agents/lead-gen" element={<AgentPage slug="lead-gen" />} />
          <Route path="/agents/team" element={<AgentPage slug="team" />} />
          <Route path="/agents/home" element={<AgentPage slug="home" />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
