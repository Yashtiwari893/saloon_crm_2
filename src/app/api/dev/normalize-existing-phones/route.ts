import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { normalizePhoneNumber } from "@/lib/phoneNormalizer";

export async function GET() {
  try {
    // 1. Fetch all salons and normalize their phone numbers
    const { data: salons } = await supabaseAdmin.from("salons").select("id, name, phone_number");

    const salonUpdates = [];
    if (salons) {
      for (const salon of salons) {
        if (salon.phone_number) {
          const normalized = normalizePhoneNumber(salon.phone_number);
          if (normalized !== salon.phone_number) {
            salonUpdates.push(
              supabaseAdmin
                .from("salons")
                .update({ phone_number: normalized, updated_at: new Date().toISOString() })
                .eq("id", salon.id)
            );
          }
        }
      }
    }

    // 2. Fetch all phone_document_mappings and normalize
    const { data: mappings } = await supabaseAdmin.from("phone_document_mapping").select("id, phone_number");

    const mappingUpdates = [];
    if (mappings) {
      for (const m of mappings) {
        if (m.phone_number) {
          const normalized = normalizePhoneNumber(m.phone_number);
          if (normalized !== m.phone_number) {
            mappingUpdates.push(
              supabaseAdmin
                .from("phone_document_mapping")
                .update({ phone_number: normalized, updated_at: new Date().toISOString() })
                .eq("id", m.id)
            );
          }
        }
      }
    }

    await Promise.all([...salonUpdates, ...mappingUpdates]);

    return NextResponse.json({
      success: true,
      message: `Normalized ${salonUpdates.length} salons and ${mappingUpdates.length} phone mappings to standard +91 format.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
