'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { HomeIcon, UserIcon, PackageIcon, PlusCircleIcon } from 'lucide-react'

const nav = [
  { name: 'Overview', href: '/user/dashboard/vendor', icon: HomeIcon },
  { name: 'My Products', href: '/user/dashboard/vendor/products', icon: PackageIcon },
  { name: 'Add Product', href: '/user/dashboard/vendor/products/create', icon: PlusCircleIcon },
  { name: 'My Profile', href: '/user/dashboard/vendor/profile', icon: UserIcon },
]

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout nav={nav} role="Vendor">
      {children}
    </DashboardLayout>
  )
}
