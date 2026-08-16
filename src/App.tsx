/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  Customer, 
  InstallmentSale, 
  PaymentReceipt, 
  BranchStats 
} from './types';
import { 
  INITIAL_CUSTOMERS, 
  INITIAL_SALES, 
  INITIAL_RECEIPTS, 
  INITIAL_BRANCH_STATS,
  AGENT_PROFILE
} from './data/initialData';
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { CustomersView } from './components/CustomersView';
import { NewSaleView } from './components/NewSaleView';
import { ReceiptView } from './components/ReceiptView';
import { SalesView } from './components/SalesView';
import { PaymentsView } from './components/PaymentsView';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { SchedulePreviewModal } from './components/SchedulePreviewModal';
import { CustomerDetailDrawer } from './components/CustomerDetailDrawer';
import { SearchSpotlightModal } from './components/SearchSpotlightModal';
import { Plus, CreditCard, UserPlus, FilePlus } from 'lucide-react';

export default function App() {
  // Local storage initialization or fallback to rich mock data
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('fintrack_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [sales, setSales] = useState<InstallmentSale[]>(() => {
    const saved = localStorage.getItem('fintrack_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => {
    const saved = localStorage.getItem('fintrack_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [stats, setStats] = useState<BranchStats>(INITIAL_BRANCH_STATS);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('fintrack_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('fintrack_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('fintrack_receipts', JSON.stringify(receipts));
  }, [receipts]);

  // Recalculate stats dynamically
  useEffect(() => {
    const activeInstallmentsCount = sales.filter(s => s.remainingBalance > 0).length;
    const overdueCount = customers.filter(c => c.status === 'OVERDUE').length;
    setStats(prev => ({
      ...prev,
      activeInstallments: activeInstallmentsCount || 124,
      totalCustomers: customers.length,
      overduePaymentsCount: overdueCount
    }));
  }, [customers, sales, receipts]);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt>(INITIAL_RECEIPTS[0]);

  // Modal States
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSchedulePreviewOpen, setIsSchedulePreviewOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  // Selected customer / sale for contextual actions
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [paymentPreloadCustomer, setPaymentPreloadCustomer] = useState<Customer | null>(null);
  const [paymentPreloadSale, setPaymentPreloadSale] = useState<InstallmentSale | null>(null);
  const [schedulePreviewSale, setSchedulePreviewSale] = useState<InstallmentSale | null>(null);
  const [schedulePreviewDraft, setSchedulePreviewDraft] = useState<any | null>(null);
  const [newSaleCustomer, setNewSaleCustomer] = useState<Customer | null>(null);

  // Keyboard shortcut for Cmd+K Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleOpenNewSale = (customer?: Customer) => {
    if (customer) {
      setNewSaleCustomer(customer);
    } else {
      setNewSaleCustomer(null);
    }
    setCurrentTab('new-sale');
    setIsFabMenuOpen(false);
  };

  const handleCreateSaleSuccess = (newSale: InstallmentSale) => {
    setSales(prev => [newSale, ...prev]);

    // Update customer outstanding balance & active count
    setCustomers(prev => prev.map(c => {
      if (c.id === newSale.customerId) {
        return {
          ...c,
          outstandingBalance: c.outstandingBalance + newSale.remainingBalance,
          totalCount: c.totalCount + newSale.installmentCount,
          status: 'ACTIVE'
        };
      }
      return c;
    }));

    setCurrentTab('sales');
  };

  const handleOpenRecordPayment = (customer?: Customer, sale?: InstallmentSale) => {
    setPaymentPreloadCustomer(customer || null);
    setPaymentPreloadSale(sale || null);
    setIsRecordPaymentOpen(true);
    setIsFabMenuOpen(false);
  };

  const handlePaymentSuccess = (
    receipt: PaymentReceipt,
    updatedCustomer: Customer,
    updatedSale: InstallmentSale
  ) => {
    // Add to receipts
    setReceipts(prev => [receipt, ...prev]);

    // Update customer in state
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));

    // Update sale in state
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));

    // Show Digital Receipt View
    setActiveReceipt(receipt);
    setCurrentTab('receipt');
  };

  const handleAddCustomerSuccess = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const handleViewReceipt = (receipt: PaymentReceipt) => {
    setActiveReceipt(receipt);
    setCurrentTab('receipt');
  };

  const handleViewSchedule = (sale: InstallmentSale) => {
    setSchedulePreviewSale(sale);
    setSchedulePreviewDraft(null);
    setIsSchedulePreviewOpen(true);
  };

  const handleOpenDraftSchedulePreview = (draftData: any) => {
    setSchedulePreviewSale(null);
    setSchedulePreviewDraft(draftData);
    setIsSchedulePreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col antialiased">
      {/* Top App Bar (Suppressed on New Sale or Receipt if desired, or kept sticky for full consistency) */}
      <TopAppBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setDrawerCustomer(null);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNewSale={() => handleOpenNewSale()}
        onOpenRecordPayment={() => handleOpenRecordPayment()}
        branchName="Gulberg Main, Lahore"
      />

      {/* Main Content Viewport */}
      <main className="flex-1 px-4 md:px-8 py-5 md:py-8 max-w-[1440px] mx-auto w-full">
        {currentTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            customers={customers}
            sales={sales}
            receipts={receipts}
            onSelectCustomer={(cust) => setDrawerCustomer(cust)}
            onOpenNewSale={() => handleOpenNewSale()}
            onOpenRecordPayment={handleOpenRecordPayment}
            onNavigateToCustomers={() => setCurrentTab('customers')}
            onNavigateToSales={() => setCurrentTab('sales')}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersView
            customers={customers}
            sales={sales}
            onSelectCustomer={(cust) => setDrawerCustomer(cust)}
            onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            onOpenRecordPayment={handleOpenRecordPayment}
            onOpenNewSaleForCustomer={(cust) => handleOpenNewSale(cust)}
          />
        )}

        {currentTab === 'sales' && (
          <SalesView
            sales={sales}
            customers={customers}
            onOpenNewSale={() => handleOpenNewSale()}
            onOpenRecordPayment={handleOpenRecordPayment}
            onViewSchedule={handleViewSchedule}
          />
        )}

        {currentTab === 'payments' && (
          <PaymentsView
            receipts={receipts}
            onOpenRecordPayment={() => handleOpenRecordPayment()}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {currentTab === 'new-sale' && (
          <NewSaleView
            customers={customers}
            selectedCustomerInit={newSaleCustomer}
            onBack={() => setCurrentTab('dashboard')}
            onCreateSale={handleCreateSaleSuccess}
            onOpenSchedulePreview={handleOpenDraftSchedulePreview}
            onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
          />
        )}

        {currentTab === 'receipt' && (
          <ReceiptView
            receipt={activeReceipt}
            onReturnToDashboard={() => setCurrentTab('dashboard')}
            onViewSales={() => setCurrentTab('sales')}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) (Matching Screen 1 & Screen 2) */}
      {currentTab !== 'new-sale' && currentTab !== 'receipt' && (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
          {/* Quick Action Flyout */}
          {isFabMenuOpen && (
            <div className="absolute bottom-16 right-0 mb-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 space-y-1 animate-in fade-in slide-in-from-bottom-3 duration-150">
              <button
                onClick={() => handleOpenNewSale()}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] rounded-xl transition-colors text-left"
              >
                <FilePlus className="w-4 h-4 text-[#006c49]" />
                <span>New Installment Sale</span>
              </button>

              <button
                onClick={() => handleOpenRecordPayment()}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] rounded-xl transition-colors text-left"
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Record Payment</span>
              </button>

              <button
                onClick={() => {
                  setIsAddCustomerOpen(true);
                  setIsFabMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] rounded-xl transition-colors text-left"
              >
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Add Customer</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
            aria-label="Create New Sale or Payment"
            className="bg-[#0F172A] hover:bg-slate-800 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 group relative"
          >
            <Plus className={`w-7 h-7 transition-transform duration-200 ${isFabMenuOpen ? 'rotate-45' : ''}`} />
            
            {/* Tooltip on desktop hover */}
            {!isFabMenuOpen && (
              <div className="absolute right-16 bg-[#213145] text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md hidden md:block">
                New Sale / Payment
              </div>
            )}
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar (Mobile Only) */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setDrawerCustomer(null);
        }}
      />

      {/* Modals & Drawers */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        customers={customers}
        sales={sales}
        initialCustomer={paymentPreloadCustomer}
        initialSale={paymentPreloadSale}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onAddCustomer={handleAddCustomerSuccess}
      />

      <SchedulePreviewModal
        isOpen={isSchedulePreviewOpen}
        onClose={() => setIsSchedulePreviewOpen(false)}
        sale={schedulePreviewSale}
        draftData={schedulePreviewDraft}
      />

      <CustomerDetailDrawer
        customer={drawerCustomer}
        sales={sales}
        receipts={receipts}
        onClose={() => setDrawerCustomer(null)}
        onOpenRecordPayment={handleOpenRecordPayment}
        onOpenNewSale={(cust) => handleOpenNewSale(cust)}
        onViewReceipt={handleViewReceipt}
      />

      <SearchSpotlightModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        customers={customers}
        sales={sales}
        receipts={receipts}
        onSelectCustomer={(c) => {
          setDrawerCustomer(c);
          setCurrentTab('customers');
        }}
        onSelectSale={(s) => {
          handleViewSchedule(s);
          setCurrentTab('sales');
        }}
        onSelectReceipt={(r) => {
          handleViewReceipt(r);
        }}
      />
    </div>
  );
}
