import { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Building, LogOut, Menu, X, CreditCard, Ticket } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    if (!loading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/properties", label: "Properties", icon: Building },
    { href: "/admin/payment-methods", label: "Payment Methods", icon: CreditCard },
    { href: "/admin/support-tickets", label: "Support Tickets", icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-primary-foreground/10 bg-slate-dark px-4 text-primary-foreground lg:hidden">
        <span className="font-bold text-primary-foreground">
          Admin Panel
        </span>
        <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? "Close admin menu" : "Open admin menu"}>
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 transform border-r border-primary-foreground/10 bg-slate-dark text-primary-foreground transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-foreground">
              Prestige<span className="text-gold"> Estates</span>
            </span>
          </Link>
          <p className="mt-1 text-xs text-primary-foreground/50">Admin Panel</p>
        </div>

        <nav className="px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth",
                location.pathname === item.href
                  ? "bg-gold/10 text-gold"
                  : "text-primary-foreground/65 hover:bg-primary-foreground/5 hover:text-primary-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
