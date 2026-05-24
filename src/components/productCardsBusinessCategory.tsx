"use client";

import { useState } from "react";
import Link from "next/link";
import Loader from "./Loader";
import { ChevronLeft, ChevronRight, MapPin, Mail, Phone, Building2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@cvx/_generated/api";

const BUSINESS_CATEGORY_META: Record<string, { full: string; description: string; color: string }> = {
  SME:   { full: "Small & Medium Enterprise",       description: "Businesses with 10–249 employees driving economic growth across Sierra Leone.",         color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300" },
  SOHO:  { full: "Small Office / Home Office",      description: "Entrepreneurs operating from home or a small workspace — agile, independent, and growing.", color: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300" },
  MICRO: { full: "Micro Enterprise",                description: "Businesses with fewer than 10 employees — the backbone of Sierra Leone's women-led economy.", color: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300" },
  MACRO: { full: "Macro Enterprise",                description: "Large-scale businesses operating at national or regional level with significant market reach.", color: "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300" },
};

interface ProductCardBusinessCategoryProps { category: string; size?: number }

const ProductCardBusinessCategory: React.FC<ProductCardBusinessCategoryProps> = ({ category, size }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;
  const raw = useQuery(api.businesses.listByCategory, { category });

  if (raw === undefined) return <Loader />;

  const totalPages = Math.max(1, Math.ceil(raw.length / itemsPerPage));
  const current = raw.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (raw.length === 0) return (
    <div className="py-20 text-center">
      <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
      <p className="text-gray-500 dark:text-gray-400 font-medium">No businesses in this category yet.</p>
    </div>
  );

  const meta = BUSINESS_CATEGORY_META[category.toUpperCase()];

  return (
    <div>
      {/* Full meaning banner */}
      {meta && (
        <div className={`mb-5 border rounded-2xl px-5 py-4 flex items-start gap-3 ${meta.color}`}>
          <Building2 className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-70" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-0.5">{category}</p>
            <p className="text-base font-bold leading-tight">{meta.full}</p>
            <p className="text-xs mt-1 opacity-75 leading-relaxed">{meta.description}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{category} Businesses</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{raw.length} business{raw.length !== 1 ? 'es' : ''} found</p>
        </div>
      </div>

      <div className={`grid gap-4 ${size === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {current.map((business) => (
          <Link key={business._id} href={`/business/${business._id}`} className="group">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex gap-4 p-4">
              <div className="flex-shrink-0">
                <img
                  src={business.imageUrls[0] || "/placeholder.svg"}
                  alt={business.businessName}
                  className="w-20 h-20 object-cover rounded-xl bg-gray-100 dark:bg-gray-700 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{business.businessName}</h4>
                  <span className="flex-shrink-0 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-500 px-2 py-0.5 rounded-full">
                    {business.category}
                  </span>
                </div>
                {business.businessLocation && (
                  <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />{business.businessLocation}
                  </p>
                )}
                {business.contactEmail && (
                  <p className="flex items-center gap-1 text-xs text-blue-500 mt-1 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />{business.contactEmail}
                  </p>
                )}
                {business.contactPhone && (
                  <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Phone className="w-3 h-3 flex-shrink-0" />{business.contactPhone}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white disabled:opacity-30 transition-colors dark:text-gray-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${currentPage === page
                ? 'bg-blue-500 text-white'
                : 'border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>
              {page}
            </button>
          ))}
          {totalPages > 5 && <span className="text-gray-400 text-sm">…</span>}
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white disabled:opacity-30 transition-colors dark:text-gray-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCardBusinessCategory;
