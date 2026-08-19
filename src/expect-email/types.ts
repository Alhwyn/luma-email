export interface LumaGuestRow {
  guest_id: string;
  name: string;
  first_name: string;
  email: string;
  approval_status: string;
  ticket_name: string;
  city: string;
  company: string;
  traveling_to_victoria: string;
  avatar_url: string;
  raw: Record<string, string>;
}

export interface ExpectEmailGuest {
  guestId: string;
  email: string;
  firstName: string;
  name: string;
  ticketName: string;
  city?: string;
  company?: string;
  travelingToVictoria?: boolean | string;
  avatarUrl?: string;
  approvalStatus: string;
}
