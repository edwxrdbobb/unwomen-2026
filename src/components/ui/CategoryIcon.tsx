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
  // legacy icons used by old slug map
  UtensilsCrossed, Layers, Baby, CakeSlice, Wind, PartyPopper,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  // new picker names
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
  // legacy icons (old slug-based categories may reference these)
  UtensilsCrossed, Layers, Baby, CakeSlice, Wind, PartyPopper,
}

interface CategoryIconProps {
  /** Either a Lucide icon name (e.g. "ShoppingBag") or a legacy emoji string (e.g. "🛍️") */
  value: string
  className?: string
  strokeWidth?: number
}

export function CategoryIcon({ value, className = 'w-5 h-5', strokeWidth = 1.5 }: CategoryIconProps) {
  const Icon = ICON_MAP[value]
  if (Icon) return <Icon className={className} strokeWidth={strokeWidth} />
  return <span className="text-lg leading-none">{value}</span>
}
