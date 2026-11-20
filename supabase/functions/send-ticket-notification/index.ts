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
    .select("id,user_id,request_type,property_title,property_price,applicant_name,applicant_email,applicant_phone,contact_method,move_in_date,number_of_occupants,message,status,created_at")
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

  const isNewRequest = payload.type === "property_request_created";
  const requestLabel = request.request_type === "purchase" ? "Purchase request" : "Rental application";
  const applicantHtml = `
    <h1>${isNewRequest ? "Request received" : "Request status updated"}</h1>
    <p>Hello ${escapeHtml(request.applicant_name)},</p>
    <p>${isNewRequest
      ? `Your ${request.request_type === "purchase" ? "purchase request" : "rental application"} has been received. Our property team will contact you shortly.`
      : `The status of your request is now ${escapeHtml(request.status.replace("_", " "))}.`}</p>
    <p><strong>Property:</strong> ${escapeHtml(request.property_title)}</p>
    <p><strong>Request ID:</strong> ${escapeHtml(request.id)}</p>
  `;
  const adminEmail = Deno.env.get("PROPERTY_REQUEST_NOTIFICATION_EMAIL")?.trim();
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(request.property_price));
  const submittedAt = new Date(request.created_at).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
  const adminHtml = `
    <div style="margin:0;padding:32px 12px;background-color:#f3f5f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="padding:24px 32px;background-color:#172337;border-bottom:4px solid #c9a45c;">
            <p style="margin:0;color:#e5c783;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">BIG EXP REALTY COMPANY</p>
            <h1 style="margin:12px 0 0;color:#ffffff;font-size:24px;line-height:1.3;">New ${requestLabel.toLowerCase()}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 12px;">
            <p style="margin:0 0 8px;font-size:16px;line-height:1.6;">A new property request has been submitted and is awaiting your review.</p>
            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">Submitted ${escapeHtml(submittedAt)} UTC</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f7f4;border-left:3px solid #c9a45c;">
              <tr><td style="padding:16px 18px;">
                <p style="margin:0 0 6px;color:#6b7280;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Property</p>
                <p style="margin:0;color:#172337;font-size:18px;font-weight:bold;line-height:1.4;">${escapeHtml(request.property_title)}</p>
                <p style="margin:8px 0 0;color:#374151;font-size:14px;">${escapeHtml(requestLabel)} &nbsp;·&nbsp; ${escapeHtml(formattedPrice)}</p>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 4px;">
            <h2 style="margin:0 0 12px;color:#172337;font-size:15px;">Applicant details</h2>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="width:38%;padding:10px 12px;border-top:1px solid #e5e7eb;color:#6b7280;">Name</td>
                <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#1f2937;font-weight:bold;">${escapeHtml(request.applicant_name)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#6b7280;">Email</td>
                <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#1f2937;"><a href="mailto:${escapeHtml(request.applicant_email)}" style="color:#8a692c;text-decoration:underline;">${escapeHtml(request.applicant_email)}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#6b7280;">Phone</td>
                <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#1f2937;">${escapeHtml(request.applicant_phone)}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#6b7280;">Preferred contact</td>
                <td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#1f2937;">${escapeHtml(request.contact_method === "email" ? "Email" : "Phone")}</td>
              </tr>
              ${request.move_in_date ? `<tr><td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#6b7280;">Preferred move-in</td><td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#1f2937;">${escapeHtml(request.move_in_date)}</td></tr>` : ""}
              ${request.number_of_occupants ? `<tr><td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#6b7280;">Occupants</td><td style="padding:10px 12px;border-top:1px solid #e5e7eb;color:#1f2937;">${request.number_of_occupants}</td></tr>` : ""}
            </table>
          </td>
        </tr>
        ${request.message ? `
          <tr>
            <td style="padding:20px 32px 8px;">
              <h2 style="margin:0 0 10px;color:#172337;font-size:15px;">Message from applicant</h2>
              <p style="margin:0;padding:14px 16px;background-color:#f8fafc;border:1px solid #e5e7eb;border-radius:4px;color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(request.message)}</p>
            </td>
          </tr>
        ` : ""}
        <tr>
          <td style="padding:24px 32px 28px;">
            <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">Request ID: <span style="color:#374151;font-family:monospace;">${escapeHtml(request.id)}</span></p>
            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">Please review this submission in the Admin Dashboard under <strong>Buy &amp; Rent Requests</strong>.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background-color:#f8fafc;border-top:1px solid #e5e7eb;">
            <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.5;">This is an automated property-request notification from BIG EXP REALTY COMPANY.</p>
          </td>
        </tr>
      </table>
    </div>
  `;
  const recipients = [{
    email: request.applicant_email,
    subject: isNewRequest
      ? `Property request received: ${request.property_title}`
      : `Property request status updated: ${request.property_title}`,
    html: applicantHtml,
  }];
  if (isNewRequest && adminEmail) {
    recipients.push({
      email: adminEmail,
      subject: `[Action required] New ${requestLabel.toLowerCase()}: ${request.property_title}`,
      html: adminHtml,
    });
  }
  let deliveryFailed = isNewRequest && !adminEmail;
  if (deliveryFailed) {
    console.error("Property request admin notification email is not configured.");
  }

  for (const recipient of recipients) {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "BIG EXP REALITY COMPANY <no-reply@realting-ceo.com>",
        to: [recipient.email],
        subject: recipient.subject,
        html: recipient.html,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error(`Property request email failed for ${recipient.email}:`, errorText);
      deliveryFailed = true;
    }
  }

  if (deliveryFailed) {
    return new Response(JSON.stringify({ error: "The request was saved, but one or more email notifications could not be sent." }), {
      status: isNewRequest && !adminEmail ? 503 : 502,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
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
