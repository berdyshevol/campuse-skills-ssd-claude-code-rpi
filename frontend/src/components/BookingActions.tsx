"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError, apiFetch } from "@/lib/api";
import type { Booking } from "@/lib/types";

export function BookingActions({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(status: Booking["status"]) {
    setBusy(true);
    try {
      await apiFetch(`/api/bookings/${booking.id}/`, {
        method: "PATCH",
        jsonBody: { status },
      });
      toast.success(`Booking ${status}`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Update failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (booking.status === "rejected" || booking.status === "completed" || booking.status === "cancelled") {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {booking.status === "pending" && (
        <>
          <button
            onClick={() => update("accepted")}
            disabled={busy}
            className="btn-primary"
          >
            Accept
          </button>
          <button
            onClick={() => update("rejected")}
            disabled={busy}
            className="btn-danger"
          >
            Reject
          </button>
        </>
      )}
      {booking.status === "accepted" && (
        <button
          onClick={() => update("completed")}
          disabled={busy}
          className="btn-primary"
        >
          Mark completed
        </button>
      )}
    </div>
  );
}
