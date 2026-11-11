import { Link } from "react-router-dom";
import { ArrowUpRight, ClipboardList } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePropertyRequests } from "@/hooks/useProperties";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-700",
  under_review: "bg-blue-500/10 text-blue-700",
  accepted: "bg-emerald-500/10 text-emerald-700",
  approved: "bg-emerald-500/10 text-emerald-700",
  rejected: "bg-rose-500/10 text-rose-700",
  completed: "bg-slate-500/10 text-slate-700",
  leased: "bg-slate-500/10 text-slate-700",
};

const MyRequests = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: requests = [], isLoading, isError } = usePropertyRequests(user?.id || "");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="site-container py-32">
        <div className="mb-9">
          <span className="section-eyebrow">Account</span>
          <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">My Requests</h1>
          <p className="mt-3 text-muted-foreground">Track purchase requests and rental applications in one place.</p>
        </div>

        {authLoading || isLoading ? (
          <div className="border border-border bg-card p-8 text-muted-foreground">Loading your requests...</div>
        ) : !user ? (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-foreground">Sign in to view your requests.</p>
            <Link to="/auth"><Button variant="gold" className="mt-5">Sign In</Button></Link>
          </div>
        ) : isError ? (
          <div role="alert" className="border border-destructive/30 bg-destructive/5 p-6 text-destructive">
            We couldn&apos;t load your requests. Please try again later.
          </div>
        ) : requests.length === 0 ? (
          <div className="border border-border bg-card p-10 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">No requests yet</h2>
            <p className="mt-2 text-muted-foreground">Your submitted requests will appear here.</p>
            <Link to="/properties"><Button variant="outline" className="mt-5">Browse Properties</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <article key={request.id} className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-foreground">{request.property_title}</h2>
                    <span className="bg-secondary px-2.5 py-1 text-xs font-semibold uppercase text-muted-foreground">
                      {request.request_type === "purchase" ? "Purchase" : "Rental"}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[request.status] || "bg-secondary text-muted-foreground"}`}>
                      {request.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span>{request.request_type === "rental" ? "Rent" : "Price"}: ${Number(request.property_price).toLocaleString()}</span>
                    <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                    {request.move_in_date && <span>Move-in: {new Date(`${request.move_in_date}T00:00:00`).toLocaleDateString()}</span>}
                    <span className="font-mono text-xs">ID: {request.id}</span>
                  </div>
                </div>
                {request.property_id ? (
                  <Link to={`/property/${request.property_id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-dark">
                    View property <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : <span className="text-sm text-muted-foreground">Listing no longer available</span>}
              </article>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
};

export default MyRequests;
