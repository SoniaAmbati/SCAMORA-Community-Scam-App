import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { id: "sample" },
    { id: "98XXXXX210" },
    { id: "xyz@upi" },
    { id: "fake-update.in" },
    { id: "1800112211" }
  ];
}

export default async function DynamicLookupPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/lookup?query=${encodeURIComponent(id)}`);
}
