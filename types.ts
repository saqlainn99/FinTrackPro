export type NavigationTab = 'dashboard' | 'customers' | 'sales' | 'payments' | 'new-sale' | 'receipt';

export type CustomerStatus = 'ACTIVE' | 'OVERDUE' | 'PAID';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  cnic: string;
  email?: string;
  address?: string;
  avatarUrl: string;
  status: CustomerStatus;
  outstandingBalance: number;
  paidCount: number;
  totalCount: number;
  guarantorName?: string;
  guarantorPhone?: string;
  createdAt: string;
  notes?: string;
}

export type SaleStatus = 'ACTIVE' | 'OVERDUE' | 'PAID';

export interface ScheduleItem {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'PAID' | 'DUE' | 'OVERDUE' | 'UPCOMING';
  paidDate?: string;
  receiptId?: string;
}

export interface InstallmentSale {
  id: string;
  saleNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  productName: string;
  productSerial: string;
  category?: string;
  totalRetailPrice: number;
  downPayment: number;
  remainingBalance: number;
  installmentCount: number;
  frequency: 'Monthly' | 'Bi-Weekly' | 'Weekly';
  firstDueDate: string;
  monthlyInstallment: number;
  status: SaleStatus;
  paidInstallments: number;
  totalInstallments: number;
  nextDueDate: string;
  schedule: ScheduleItem[];
  createdAt: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  saleId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  productName: string;
  installmentProgressText: string; // e.g. "3 of 12"
  installmentProgressCount: number;
  installmentTotalCount: number;
  amountPaid: number;
  remainingBalance: number;
  nextDueDate: string;
  date: string; // "Oct 24, 2023"
  time: string; // "14:30"
  agentName: string; // "Z. Ali"
  paymentMethod: 'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash';
  qrData?: string;
  notes?: string;
}

export interface BranchStats {
  todayCollection: number;
  todayGrowthPercentage: number;
  activeInstallments: number;
  totalCustomers: number;
  overduePaymentsCount: number;
  collectedPercentage: number;
  outstandingPercentage: number;
}
