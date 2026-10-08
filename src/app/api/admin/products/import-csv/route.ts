import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { importProductsFromCsv } from "@/lib/product-importer";

export async function POST() {
  const authCheck = await requirePermission("products.create");
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const result = await importProductsFromCsv();

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully processed ${result.createdCount + result.updatedCount} products (${result.totalProducts} total in database)!`,
    });
  } catch (error: any) {
    console.error("Error importing products from CSV:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error importing products" },
      { status: 500 }
    );
  }
}
