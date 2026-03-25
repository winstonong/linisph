import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendTaskPostedEmail,
  sendNewOfferEmail,
} from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    switch (type) {
      case "welcome": {
        const { to, name } = body;
        const { error } = await sendWelcomeEmail(to, name);
        if (error) return NextResponse.json({ error }, { status: 500 });
        return NextResponse.json({ ok: true });
      }

      case "task_posted": {
        const { to, name, taskTitle, taskId } = body;
        const { error } = await sendTaskPostedEmail(to, name, taskTitle, taskId);
        if (error) return NextResponse.json({ error }, { status: 500 });
        return NextResponse.json({ ok: true });
      }

      case "new_offer": {
        const { to, customerName, taskerName, taskTitle, taskId, offerAmount } =
          body;
        const { error } = await sendNewOfferEmail(
          to,
          customerName,
          taskerName,
          taskTitle,
          taskId,
          offerAmount
        );
        if (error) return NextResponse.json({ error }, { status: 500 });
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
