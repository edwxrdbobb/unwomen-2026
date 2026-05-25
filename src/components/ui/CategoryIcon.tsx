'use client'

import {
  Tag, ShoppingBag, ShoppingCart, Store, Wallet, CreditCard, DollarSign, Package, Gift,
  BadgeDollarSign, BarChart2, TrendingUp, Boxes, Banknote, Percent, Receipt,
  Wheat, Apple, Leaf, Cherry, Fish, Coffee, Milk, Sandwich, Salad,
  Soup, Utensils, ChefHat, Beef, Egg, Wine, Beer, Banana, Carrot, Grape,
  Sprout, TreeDeciduous, Sun, Cloud, Droplets, Tractor,
  Sparkles, Heart, Flower2, Star, Gem, Crown, Palette, Brush, Scissors, Wand2,
  Shirt, Glasses, Watch, Footprints, Diamond,
  Home, Sofa, Lightbulb, Flame, Key, Hammer, Wrench, Drill, BedDouble, Bath,
  Smartphone, Laptop, Monitor, Headphones, Camera, Tv, Plug, Battery, Wifi, Radio, Cpu,
  BookOpen, GraduationCap, FileText, Pen, Pencil, Clipboard, Paperclip, Printer,
  Activity, Stethoscope, Pill, Syringe, Cross, HeartPulse, Dna,
  Truck, Plane, Globe, Phone, Mail, MessageSquare, Users, Building, Car, Ship,
  Dumbbell, Trophy, Target, Bike, Music, Mic, Film, Gamepad2, Mountain, Waves,
  Zap, Rocket, Shield, Lock, Eye, Bell, MapPin, Clock,
  UtensilsCrossed, Layers, Baby, CakeSlice, Wind, PartyPopper,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  Tag, ShoppingBag, ShoppingCart, Store, Wallet, CreditCard, DollarSign, Package, Gift,
  BadgeDollarSign, BarChart2, TrendingUp, Boxes, Banknote, Percent, Receipt,
  Wheat, Apple, Leaf, Cherry, Fish, Coffee, Milk, Sandwich, Salad,
  Soup, Utensils, ChefHat, Beef, Egg, Wine, Beer, Banana, Carrot, Grape,
  Sprout, TreeDeciduous, Sun, Cloud, Droplets, Tractor,
  Sparkles, Heart, Flower2, Star, Gem, Crown, Palette, Brush, Scissors, Wand2,
  Shirt, Glasses, Watch, Footprints, Diamond,
  Home, Sofa, Lightbulb, Flame, Key, Hammer, Wrench, Drill, BedDouble, Bath,
  Smartphone, Laptop, Monitor, Headphones, Camera, Tv, Plug, Battery, Wifi, Radio, Cpu,
  BookOpen, GraduationCap, FileText, Pen, Pencil, Clipboard, Paperclip, Printer,
  Activity, Stethoscope, Pill, Syringe, Cross, HeartPulse, Dna,
  Truck, Plane, Globe, Phone, Mail, MessageSquare, Users, Building, Car, Ship,
  Dumbbell, Trophy, Target, Bike, Music, Mic, Film, Gamepad2, Mountain, Waves,
  Zap, Rocket, Shield, Lock, Eye, Bell, MapPin, Clock,
  UtensilsCrossed, Layers, Baby, CakeSlice, Wind, PartyPopper,
}

/** Canonical slug → flat Lucide icon mapping used across the whole platform. */
export const SLUG_TO_ICON: Record<string, LucideIcon> = {
  'beauty-skincare':        Sparkles,
  'fashion-clothing':       Shirt,
  'accessories-jewellery':  Gem,
  'food-beverages':         UtensilsCrossed,
  'farm-produce':           Wheat,
  'crafts-artwork':         Palette,
  'home-household':         Home,
  'textiles-fabrics':       Layers,
  'health-wellness':        Leaf,
  'baby-kids':              Baby,
  'hair-beauty-services':   Scissors,
  'catering-baking':        CakeSlice,
  'tailoring-design':       Wand2,
  'education-training':     GraduationCap,
  'cleaning-home-services': Wind,
  'event-planning':         PartyPopper,
  'electronics-tech':       Smartphone,
  'stationery-office':      Paperclip,
}

interface CategoryIconProps {
  /** Lucide icon name stored in DB (e.g. "Sparkles"). Ignored when `slug` is provided. */
  value?: string
  /** Category slug — preferred; resolves via SLUG_TO_ICON map. */
  slug?: string
  className?: string
  strokeWidth?: number
}

export function CategoryIcon({
  value = '',
  slug,
  className = 'w-5 h-5',
  strokeWidth = 1.5,
}: CategoryIconProps) {
  // Slug lookup takes precedence — always renders a flat icon
  if (slug) {
    const Icon = SLUG_TO_ICON[slug] ?? Tag
    return <Icon className={className} strokeWidth={strokeWidth} />
  }
  // Fall back to icon-name lookup for admin-entered values
  const Icon = ICON_MAP[value]
  if (Icon) return <Icon className={className} strokeWidth={strokeWidth} />
  // Last resort: render whatever string is stored (legacy emoji)
  return <span className="text-lg leading-none">{value}</span>
}
