import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "ticket_created" | "ticket_updated" | "reply_added" | "property_request_created" | "property_request_updated";
  ticketId: string;
  recipientEmail: string;
  recipientName: string;
  ticketSubject: string;
  message?: string;
  updatedFields?: string[];
  replyMessage?: string;
  isAdminReply?: boolean;
  requestId?: string;
}

const escapeHtml = (value: string) => {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
};

const sendPropertyRequestNotification = async (
  req: Request,
  payload: NotificationRequest,
): Promise<Response> => {
  const authorization = req.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!authorization?.startsWith("Bearer ") || !supabaseUrl || !serviceRoleKey || !resendApiKey) {
    return new Response(JSON.stringify({ error: "Notification service is not configured or authorized." }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const token = authorization.slice("Bearer ".length);
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user || !payload.requestId) {
    return new Response(JSON.stringify({ error: "A valid user and request ID are required." }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { data: request, error: requestError } = await supabase
    .from("property_requests")
    .select("id,user_id,request_type,property_title,property_price,applicant_name,applicant_email,status")
    .eq("id", payload.requestId)
    .maybeSingle();

  if (requestError || !request) {
    return new Response(JSON.stringify({ error: "Property request not found." }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (payload.type === "property_request_created" && request.user_id !== authData.user.id) {
    return new Response(JSON.stringify({ error: "You cannot notify on behalf of another user." }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (payload.type === "property_request_updated") {
    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", authData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleError || !role) {
      return new Response(JSON.stringify({ error: "Administrator access is required." }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  const htmlContent = `
    <h1>${payload.type === "property_request_created" ? "Request received" : "Request status updated"}</h1>
    <p>Hello ${escapeHtml(request.applicant_name)},</p>
    <p>${payload.type === "property_request_created"
      ? `Your ${request.request_type === "purchase" ? "purchase request" : "rental application"} has been received. Our property team will contact you shortly.`
      : `The status of your request is now ${escapeHtml(request.status.replace("_", " "))}.`}</p>
    <p><strong>Property:</strong> ${escapeHtml(request.property_title)}</p>
    <p><strong>Request ID:</strong> ${escapeHtml(request.id)}</p>
  `;
  const recipients = [request.applicant_email];
  if (payload.type === "property_request_created") {
    const adminEmail = Deno.env.get("PROPERTY_REQUEST_NOTIFICATION_EMAIL");
    if (adminEmail) recipients.push(adminEmail);
  }

  for (const recipientEmail of recipients) {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Luxe Realty <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: payload.type === "property_request_created"
          ? `Property request received: ${request.property_title}`
          : `Property request status updated: ${request.property_title}`,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Property request email failed:", errorText);
      return new Response(JSON.stringify({ error: "The request was saved, but email notification failed." }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationRequest = await req.json();
    console.log("Received notification request:", payload);

    if (payload.type === "property_request_created" || payload.type === "property_request_updated") {
      return await sendPropertyRequestNotification(req, payload);
    }

    const { type, ticketId, recipientEmail, recipientName, ticketSubject, message, updatedFields, replyMessage, isAdminReply } = payload;

    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "ticket_created":
        subject = `Support Ticket Created: ${ticketSubject}`;
        htmlContent = `
          <h1>Support Ticket Created</h1>
          <p>Hello ${recipientName},</p>
          <p>Your support ticket has been successfully created.</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <p>We will get back to you as soon as possible.</p>
          <p>Best regards,<br>Luxe Realty Support Team</p>
        `;
        break;

      case "ticket_updated":
        subject = `Support Ticket Updated: ${ticketSubject}`;
        htmlContent = `
          <h1>Support Ticket Updated</h1>
          <p>Hello ${recipientName},</p>
          <p>Your support ticket has been updated.</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Updated fields:</strong> ${updatedFields?.join(", ") || "Status"}</p>
          <p>Log in to view the latest updates on your ticket.</p>
          <p>Best regards,<br>Luxe Realty Support Team</p>
        `;
        break;

      case "reply_added":
        subject = `New Reply on Ticket: ${ticketSubject}`;
        htmlContent = `
          <h1>New Reply on Your Ticket</h1>
          <p>Hello ${recipientName},</p>
          <p>${isAdminReply ? "An admin has replied to your support ticket." : "A new reply has been added to your ticket."}</p>
          <p><strong>Subject:</strong> ${ticketSubject}</p>
          <p><strong>Reply:</strong></p>
          <p>${replyMessage}</p>
          <p>Log in to view the full conversation.</p>
          <p>Best regards,<br>Luxe Realty Support Team</p>
        `;
        break;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Luxe Realty <onboarding@resend.dev>",
        to: [recipientEmail],
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in send-ticket-notification function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected notification error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
