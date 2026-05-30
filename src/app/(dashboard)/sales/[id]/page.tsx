import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";

import { getSaleById } from "@/features/sale/api/sale.api";
import { SaleDetail } from "@/features/sale/components/sale-detail";

type SaleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
  const { id } = await params;
  let sale;

  try {
    sale = await getSaleById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <SaleDetail sale={sale} />;
}
