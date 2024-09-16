"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "./auth";
import {
  createBooking,
  deleteBooking,
  getBookings,
  updateBooking,
  updateGuest,
} from "./data-service";

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateProfile(formData) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,14}$/.test(nationalID)) {
    throw new Error("Invalid national ID Please check your input");
  }

  const updateData = {
    nationalID,
    nationality,
    countryFlag,
  };
  await updateGuest(session.user.guestId, updateData);

  revalidatePath("/account/profile");
}

export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(bookingId)) throw new Error("Not authorized");

  await deleteBooking(bookingId);

  revalidatePath("/account/reservations");
}

export async function updateReservation(formData) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const bookingId = formData.get("bookingId");

  const guestBookings = await getBookings(session.user.guestId);

  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  if (!guestBookingsIds.includes(Number(bookingId)))
    throw new Error("Not authorized");

  const numGuests = formData.get("numGuests");
  const observations = formData.get("observations").slice(0, 1000);

  const updateData = {
    numGuests,
    observations,
  };

  await updateBooking(bookingId, updateData);
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  redirect("/account/reservations");
}
export async function createReservation(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestId,
    observations: formData.get("observations").slice(0, 1000),
    numGuests: Number(formData.get("numGuests")),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };
  await createBooking(newBooking);
  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}
