import { NextResponse } from "next/server";

const MOCK_REVIEWS: Record<string, object[]> = {
  "1": [
    {
      id: "r1",
      username: "priya_k",
      isVerified: true,
      rating: 5,
      text: "Amazing landlord, very responsive. Deposit was returned in full within 2 weeks. Highly recommend for any UWB student!",
      date: "2025-03-15",
      comments: [
        { username: "jay_s", text: "Agreed! Same experience here 🙌", date: "2025-03-16" },
      ],
    },
    {
      id: "r2",
      username: "mike_t",
      isVerified: false,
      rating: 4,
      text: "Great location, walking distance to campus. A/C would be nice in summer but overall solid deal.",
      date: "2025-02-20",
      comments: [],
    },
  ],
  "2": [
    {
      id: "r3",
      username: "ana_r",
      isVerified: true,
      rating: 3,
      text: "Decent place but landlord takes a while to respond. Location is convenient though.",
      date: "2025-01-10",
      comments: [
        { username: "carlos_b", text: "Had the same issue. Text instead of email, faster response.", date: "2025-01-12" },
      ],
    },
  ],
  "3": [],
  "4": [
    {
      id: "r4",
      username: "lena_wu",
      isVerified: true,
      rating: 5,
      text: "Perfect house for a group of 3! We split it three ways and it came out to only $900 each. Huge backyard too.",
      date: "2025-04-01",
      comments: [],
    },
  ],
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const listingId = url.searchParams.get("listingId") ?? "";
  const reviews = MOCK_REVIEWS[listingId] ?? [];
  return NextResponse.json(reviews);
}

export async function POST() {
  return NextResponse.json({ ok: true });
}
