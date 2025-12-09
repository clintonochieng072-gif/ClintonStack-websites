"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Package, Copy, ExternalLink } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalContext";
import AffiliateSidebar from "@/components/AffiliateSidebar";

interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  commissionRate: number;
  features?: string[];
  pricing?: any[];
}

interface AffiliateStats {
  referralCode: string;
}

export default function AffiliateProductsPage() {
  const { user } = useGlobalContext();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === "affiliate") {
      fetchData();
    } else if (user && user.role !== "affiliate") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        fetch("/api/affiliate/products"),
        fetch("/api/affiliate/stats"),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = async (productSlug: string, productName: string) => {
    if (!stats?.referralCode) return;

    setCopyLoading(productSlug);
    try {
      const referralUrl = `${window.location.origin}/client-signup?ref=${stats.referralCode}&product=${productSlug}`;
      await navigator.clipboard.writeText(referralUrl);
      alert(`Referral link for ${productName} copied to clipboard!`);
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy link. Please try again.");
    } finally {
      setCopyLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="hidden lg:block">
        <AffiliateSidebar />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden">
          <AffiliateSidebar mobile onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Products to Promote
                </h1>
                <p className="text-sm text-gray-600">
                  Choose products and earn commissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        Commission: KES {product.commissionRate}
                      </span>
                    </div>
                  </div>
                  <Package className="w-8 h-8 text-blue-600 flex-shrink-0 ml-4" />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => copyReferralLink(product.slug, product.name)}
                    disabled={copyLoading === product.slug}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {copyLoading === product.slug ? "Copying..." : "Copy Link"}
                    </span>
                  </button>

                  <Link
                    href={`/client-signup?ref=${stats?.referralCode || ""}&product=${product.slug}`}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm font-medium">View Product</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products available
            </h3>
            <p className="text-gray-600 mb-6">
              Check back soon for new products to promote.
            </p>
            <Link
              href="/dashboard/affiliate"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}