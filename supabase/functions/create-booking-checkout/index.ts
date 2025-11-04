import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { bookingDetails } = await req.json();
    
    if (!bookingDetails) {
      throw new Error("Missing required parameter: bookingDetails");
    }

    const {
      userId,
      slotId,
      slotDate,
      slotMode,
      slotLocation,
      startTime,
      endTime,
      duration,
      notes,
      amount,
    } = bookingDetails;

    // Format booking details for display
    const startDateTime = new Date(`${slotDate}T${startTime}`);
    const endDateTime = new Date(`${slotDate}T${endTime}`);
    
    const formattedDate = startDateTime.toLocaleDateString("en-US", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
    
    const formattedStartTime = startDateTime.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true 
    });
    
    const formattedEndTime = endDateTime.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit", 
      hour12: true 
    });

    const durationHours = Math.floor(duration / 60);
    const durationMins = duration % 60;
    const durationText = durationHours > 0 
      ? `${durationHours} hour${durationHours !== 1 ? 's' : ''}${durationMins > 0 ? ` ${durationMins} min` : ''}`
      : `${durationMins} minutes`;

    const mode = slotMode === 'online' ? 'Online' : 'In-Person';
    const sessionName = `Jenius Education`;
    
    const descriptionParts = [
      `• Date: ${formattedDate}`,
      `• Time: ${formattedStartTime} - ${formattedEndTime}`,
      `• Duration: ${durationText}`,
      `• Mode: ${mode}`,
      slotLocation ? `• Location: ${slotLocation}` : '',
      notes ? `• Additional Notes: ${notes}` : '',
    ].filter(Boolean);
    
    const description = descriptionParts.join('\n');

    console.log("Creating checkout session with booking details:", { 
      sessionName,
      description,
      amount,
      userEmail: user.email 
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session for one-time payment
    // Store all booking details in metadata to create booking after payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "aud",
            product_data: {
              name: sessionName,
              description: description,
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/profile?tab=bookings&payment=success`,
      cancel_url: `${req.headers.get("origin")}/booking?payment=canceled`,
      metadata: {
        user_id: userId,
        slot_id: slotId,
        slot_date: slotDate,
        slot_mode: slotMode,
        slot_location: slotLocation || '',
        start_time: startTime,
        end_time: endTime,
        duration: duration.toString(),
        notes: notes || '',
        amount: amount.toString(),
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-booking-checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
