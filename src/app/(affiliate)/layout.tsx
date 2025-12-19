import AffiliateLayout from "@/components/AffiliateLayout";

export default function AffiliateRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AffiliateLayout>{children}</AffiliateLayout>;
}
