import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Read raw body for webhook verification
    const body = await req.text();
    console.log("Body length:", body.length);
    
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);

    if (event.type !== "checkout.session.completed") {
      // We only care about checkout completions here
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Extract booking details from metadata (all values are strings)
    const md = (session.metadata || {}) as Record<string, string>;
    const user_id = md.user_id;
    const slot_id = md.slot_id;
    const slot_date = md.slot_date;
    const raw_slot_mode = md.slot_mode;
    const slot_location = md.slot_location;
    const start_time = md.start_time;
    const end_time = md.end_time;
    const durationRaw = md.duration;
    const notes = md.notes;
    const amountRaw = md.amount;

    console.log("Extracted values:", {
      user_id,
      slot_id,
      slot_date,
      raw_slot_mode,
      start_time,
      end_time,
      durationRaw,
      amountRaw
    });

    if (!user_id || !slot_id || !slot_date || !start_time || !end_time) {
      console.error("Missing fields:", {
        user_id: !user_id,
        slot_id: !slot_id,
        slot_date: !slot_date,
        start_time: !start_time,
        end_time: !end_time
      });
      return new Response(JSON.stringify({ error: "Missing booking metadata" }), { status: 400 });
    }

    // Use slot_mode as-is (DB accepts 'online' or 'in-person' with hyphen)
    const slot_mode = raw_slot_mode || "online";

    const duration = Number(durationRaw) || 0;
    const amount = Number(amountRaw) || 0;
    console.log("Parsed numbers - duration:", duration, "amount:", amount);

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    console.log("Supabase URL configured:", !!supabaseUrl);
    console.log("Service key configured:", !!supabaseServiceKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Idempotency: don't create duplicate bookings for the same Stripe session
    console.log("🔍 Checking for existing booking with session:", session.id);
    const { data: existingBookings, error: existingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("stripe_session_id", session.id)
      .limit(1);

    if (existingError) {
      console.error("Error checking existing bookings:", existingError);
    }

    if (existingBookings && existingBookings.length > 0) {
      console.log("Booking already exists for session:", session.id, existingBookings[0].id);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // 1. Create the booking (match actual database schema)
    // Combine date + time and treat as Australia/Sydney timezone
    const startDateTime = new Date(`${slot_date}T${start_time}+11:00`);
    const endDateTime = new Date(`${slot_date}T${end_time}+11:00`);
    
    const bookingData = {
      user_id,
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      duration_minutes: duration,
      mode: slot_mode,
      location: slot_location || null,
      notes: notes || null,
      status: "confirmed",
      payment_status: "paid",
      price_cents: amount,
      stripe_payment_id: session.id,
      is_free_trial: false,
    };
    console.log("📝 Inserting booking:", JSON.stringify(bookingData, null, 2));

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", JSON.stringify(bookingError, null, 2));
      console.error("Error details:", {
        message: bookingError.message,
        details: bookingError.details,
        hint: bookingError.hint,
        code: bookingError.code
      });
      return new Response(JSON.stringify({ error: "Booking create failed", details: bookingError }), { status: 500 });
    }

    // 2. Update availability slot
    const { data: slot, error: slotError } = await supabase
      .from("availability")
      .select("*")
      .eq("id", slot_id)
      .single();

    if (slotError) {
      console.error("Error fetching slot:", slotError);
    } else {
      console.log("Updating availability slot:", slot.id);

      if (slot_mode === "in-person") {
        // Delete the slot for in-person bookings
        const { error: deleteError } = await supabase
          .from("availability")
          .delete()
          .eq("id", slot_id);

        if (deleteError) {
          console.error("Error deleting slot:", deleteError);
        } else {
          console.log("Slot deleted for in-person booking");
        }
      } else {
        // Online booking: split the slot if needed
        try {
          const slotStart = new Date(`${slot_date}T${slot.start_time}+11:00`);
          const slotEnd = new Date(`${slot_date}T${slot.end_time}+11:00`);
          const bookingStart = new Date(`${slot_date}T${start_time}+11:00`);
          const bookingEnd = new Date(`${slot_date}T${end_time}+11:00`);

          const isFullSlot =
            bookingStart.getTime() === slotStart.getTime() &&
            bookingEnd.getTime() === slotEnd.getTime();

          if (isFullSlot) {
            // Delete the slot if fully booked
            const { error: deleteError } = await supabase
              .from("availability")
              .delete()
              .eq("id", slot_id);

            if (deleteError) {
              console.error("Error deleting fully booked slot:", deleteError);
            } else {
              console.log("Fully booked slot deleted");
            }
          } else {
            // Split the slot
            const slotsToInsert = [];

            // Create slot before booking if there's time
            if (bookingStart.getTime() > slotStart.getTime()) {
              slotsToInsert.push({
                date: slot_date,
                start_time: slot.start_time,
                end_time: start_time,
                mode: slot.mode,
                location: slot.location,
                is_booked: false,
              });
            }

            // Create slot after booking if there's time
            if (bookingEnd.getTime() < slotEnd.getTime()) {
              slotsToInsert.push({
                date: slot_date,
                start_time: end_time,
                end_time: slot.end_time,
                mode: slot.mode,
                location: slot.location,
                is_booked: false,
              });
            }

            // Delete original slot
            const { error: deleteError } = await supabase
              .from("availability")
              .delete()
              .eq("id", slot_id);

            if (deleteError) {
              console.error("Error deleting original slot:", deleteError);
            }

            // Insert new slots
            if (slotsToInsert.length > 0) {
              const { error: insertError } = await supabase
                .from("availability")
                .insert(slotsToInsert);

              if (insertError) {
                console.error("Error inserting split slots:", insertError);
              } else {
                console.log(`Created ${slotsToInsert.length} split slot(s)`);
              }
            }
          }
        } catch (ex) {
          console.error("Error while splitting online slot:", ex);
        }
      }
    }

    // 3. Send notification emails (fire-and-forget)
    try {
      const { error: emailError } = await supabase.functions.invoke("send-booking-notification", {
        body: {
          bookingId: booking.id,
          studentEmail: session.customer_details?.email || session.customer_email,
          tutorEmail: slot?.tutor_id,
          bookingDetails: {
            date: slot_date,
            startTime: start_time,
            endTime: end_time,
            mode: slot_mode,
            location: slot_location,
            duration,
            paymentMethod: "stripe",
            paymentStatus: "paid",
          },
        },
      });

      if (emailError) {
        console.error("Error sending notification emails:", emailError);
      } else {
        console.log("Notification emails sent successfully");
      }
    } catch (ex) {
      console.error("Error invoking notification function:", ex);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
