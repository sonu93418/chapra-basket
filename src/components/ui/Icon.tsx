/**
 * Chapra Basket — Unified SVG Icon Component
 * Uses lucide-react-native for all icons (no PNG, no emoji)
 */
import React from 'react';
import { LucideIcon } from 'lucide-react-native';
import { Colors } from '../../theme';

export type IconSize = 16 | 20 | 24 | 28 | 32 | 40;

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}

export const Icon: React.FC<IconProps> = ({
  icon: LucideIconComponent,
  size = 24,
  color = Colors.textPrimary,
  strokeWidth = 2,
  fill = 'none',
}) => {
  return (
    <LucideIconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
    />
  );
};

// ─── Pre-bound icon exports for convenience ─────────────────────────────────
export {
  House,
  LayoutGrid,
  ShoppingCart,
  Package,
  User,
  Search,
  Mic2,
  Bell,
  MapPin,
  Wallet,
  Gift,
  Headphones,
  Settings,
  LogOut,
  Heart,
  Star,
  Bike,
  Store,
  CreditCard,
  Plus,
  Minus,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  X,
  XCircle,
  Check,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  Zap,
  Clock,
  SlidersHorizontal,
  ArrowUpDown,
  Copy,
  Share2,
  Camera,
  Image,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info,
  Navigation,
  Navigation2,
  Map,
  Truck,
  Tag,
  Percent,
  BadgePercent,
  Flame,
  TrendingUp,
  Award,
  Leaf,
  ShoppingBag,
  ReceiptText,
  IndianRupee,
  CircleDollarSign,
  QrCode,
  Scan,
  FileText,
  HelpCircle,
  LifeBuoy,
  LogIn,
  UserPlus,
  Users,
  Building2,
  Home,
  Smartphone,
  Banknote,
  PartyPopper,
  Timer,
  Play,
  Square,
  Battery,
  Signal,
  UserCheck,
  Activity,
  Compass,
  Radio,
  ShieldAlert,
} from 'lucide-react-native';
