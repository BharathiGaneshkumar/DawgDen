import { NextResponse } from "next/server";

function getAiTip(perPerson: number, numPeople: number, rent: number, utilities: number): string {
  const totalCost = rent + utilities;
  const perPersonRounded = Math.round(perPerson);

  if (numPeople === 1) {
    if (perPerson < 1400) return `Solo living at $${perPersonRounded}/mo is solid for this area. You're keeping housing lean — make sure to build a 3-month emergency fund.`;
    if (perPerson < 1800) return `At $${perPersonRounded}/mo solo, this is manageable on a grad stipend or part-time job. Consider meal prepping to save on food costs.`;
    return `$${perPersonRounded}/mo solo is steep. Look for a roommate to cut this in half — even 1 roommate saves you ~$${Math.round(perPerson * 0.5)}/mo instantly.`;
  }

  if (numPeople === 2) {
    if (perPerson < 1000) return `Great split! At $${perPersonRounded}/mo each for 2 people, you're well under the 30% rule even on a TA stipend (~$2,800/mo). Smart choice.`;
    if (perPerson < 1400) return `$${perPersonRounded}/mo each is reasonable for 2 roommates. Total shared cost is $${totalCost}/mo — budget $200 extra each for groceries and you're set.`;
    return `$${perPersonRounded}/mo each is a bit high for a 2-person split. Check if adding a third roommate or negotiating rent down $200-300 helps.`;
  }

  if (numPeople >= 3) {
    if (perPerson < 800) return `Excellent! $${perPersonRounded}/mo per person for ${numPeople} roommates is one of the best deals near UWB. Lock this in fast.`;
    if (perPerson < 1100) return `$${perPersonRounded}/mo per person is very reasonable for ${numPeople} roommates. Total house cost is $${totalCost}/mo — split utilities clearly to avoid conflicts.`;
    return `Even split ${numPeople} ways, $${perPersonRounded}/mo is above average. Make sure everyone's clear on the lease terms before signing.`;
  }

  return `With ${numPeople} people sharing, each person pays $${perPersonRounded}/mo. Total monthly house cost: $${totalCost}.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rent, numPeople, utilitiesTotal } = body as {
      rent: number;
      numPeople: number;
      utilitiesTotal: number;
    };

    const n = Math.max(1, numPeople);
    const total = rent + utilitiesTotal;
    const perPerson = total / n;
    const perPersonRent = rent / n;
    const perPersonUtilities = utilitiesTotal / n;

    const tip = getAiTip(perPerson, n, rent, utilitiesTotal);

    return NextResponse.json({
      total,
      perPerson: Math.round(perPerson),
      perPersonRent: Math.round(perPersonRent),
      perPersonUtilities: Math.round(perPersonUtilities),
      tip,
    });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
