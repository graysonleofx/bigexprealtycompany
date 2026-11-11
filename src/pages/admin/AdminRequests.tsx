import { usePropertyRequests, useUpdatePropertyRequest, PropertyRequest } from "@/hooks/useProperties";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const statusesFor = (request: PropertyRequest): PropertyRequest["status"][] => {
  if (request.status === "pending") {
    return ["pending", "under_review", "rejected", request.request_type === "purchase" ? "accepted" : "approved"];
  }
  if (request.status === "under_review") {
    return ["under_review", "rejected", request.request_type === "purchase" ? "accepted" : "approved"];
  }
  if (request.status === "accepted") return ["accepted", "completed"];
  if (request.status === "approved") return ["approved", "leased"];
  return [request.status];
};

const AdminRequests = () => {
  const { data: requests = [], isLoading, isError } = usePropertyRequests();
  const updateRequest = useUpdatePropertyRequest();

  const changeStatus = async (id: string, status: PropertyRequest["status"]) => {
    try {
      await updateRequest.mutateAsync({ id, status });
      toast.success("Request status updated");
      try {
        const { error } = await supabase.functions.invoke("send-ticket-notification", {
          body: { type: "property_request_updated", requestId: id },
        });
        if (error) toast.warning("Status updated, but the email notification could not be sent.");
      } catch {
        toast.warning("Status updated, but the email notification could not be sent.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update request status");
    }
  };

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Buy & Rent Requests</h1>
        <p className="mt-2 text-muted-foreground">Review inquiries and update request status. Only administrators can manage requests.</p>
      </div>
      {isLoading ? (
        <div className="border border-border bg-card p-6 text-muted-foreground">Loading requests...</div>
      ) : isError ? (
        <div role="alert" className="border border-destructive/30 bg-destructive/5 p-6 text-destructive">
          Requests could not be loaded. Verify the database migration has been applied.
        </div>
      ) : requests.length === 0 ? (
        <div className="border border-border bg-card p-10 text-center text-muted-foreground">No purchase requests or rental applications yet.</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="grid gap-5 border border-border bg-card p-5 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-foreground">{request.property_title}</h2>
                  <span className="bg-secondary px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">{request.request_type}</span>
                  <span className="bg-blue-500/10 px-2 py-1 text-xs font-semibold capitalize text-blue-700">{request.status.replace("_", " ")}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  ${Number(request.property_price).toLocaleString()}
                  {request.move_in_date && ` · Move-in ${new Date(`${request.move_in_date}T00:00:00`).toLocaleDateString()}`}
                  {request.number_of_occupants && ` · ${request.number_of_occupants} occupants`}
                </p>
                <div className="mt-4 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                  <p><span className="font-medium text-foreground">Applicant:</span> {request.applicant_name}</p>
                  <p><span className="font-medium text-foreground">Email:</span> <a className="text-gold hover:underline" href={`mailto:${request.applicant_email}`}>{request.applicant_email}</a></p>
                  <p><span className="font-medium text-foreground">Phone:</span> <a className="text-gold hover:underline" href={`tel:${request.applicant_phone}`}>{request.applicant_phone}</a></p>
                  <p><span className="font-medium text-foreground">Preferred contact:</span> {request.contact_method}</p>
                  <p className="font-mono text-xs sm:col-span-2">Request ID: {request.id}</p>
                  {request.message && <p className="mt-2 whitespace-pre-wrap sm:col-span-2"><span className="font-medium text-foreground">Message:</span> {request.message}</p>}
                </div>
              </div>
              <div className="w-full lg:w-48">
                <label htmlFor={`status-${request.id}`} className="mb-2 block text-sm font-medium text-foreground">Update status</label>
                <Select
                  value={request.status}
                  onValueChange={(value) => changeStatus(request.id, value as PropertyRequest["status"])}
                  disabled={updateRequest.isPending}
                >
                  <SelectTrigger id={`status-${request.id}`}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusesFor(request).map((status) => (
                      <SelectItem key={status} value={status}>{status.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
