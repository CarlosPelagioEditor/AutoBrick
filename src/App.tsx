import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, AppTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { VehicleList } from './components/VehicleList';
import { ChatSimulator } from './components/ChatSimulator';
import { TradeInEvaluator } from './components/TradeInEvaluator';
import { TaxReport } from './components/TaxReport';
import { CardFeeCalculator } from './components/CardFeeCalculator';
import { AntiScamChecklist } from './components/AntiScamChecklist';
import { PublicCatalogView } from './components/PublicCatalogView';
import { ProfitGoalsAndTurnover } from './components/ProfitGoalsAndTurnover';
import { CopywritingGenerator } from './components/CopywritingGenerator';
import { ClientCrm } from './components/ClientCrm';
import { DataBackupExport } from './components/DataBackupExport';
import { VehicleFormModal } from './components/VehicleFormModal';
import { MarkSoldModal } from './components/MarkSoldModal';
import { CopilotModal } from './components/CopilotModal';
import { AuthModal } from './components/AuthModal';
import { ReceiptGeneratorModal } from './components/ReceiptGeneratorModal';
import { BrickItem } from './types';

function MainApp() {
  const { saveVehicle, deleteVehicle } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');

  // Modal States
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [selectedVehicleForEdit, setSelectedVehicleForEdit] = useState<BrickItem | null>(null);

  const [isMarkSoldOpen, setIsMarkSoldOpen] = useState(false);
  const [itemForMarkSold, setItemForMarkSold] = useState<BrickItem | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [itemForReceipt, setItemForReceipt] = useState<BrickItem | null>(null);

  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotVehicle, setCopilotVehicle] = useState<BrickItem | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [chatSimulatorVehicle, setChatSimulatorVehicle] = useState<BrickItem | null>(null);
  const [copywritingItem, setCopywritingItem] = useState<BrickItem | null>(null);

  // Handlers
  const handleOpenNewVehicle = () => {
    setSelectedVehicleForEdit(null);
    setIsVehicleFormOpen(true);
  };

  const handleEditVehicle = (vehicle: BrickItem) => {
    setSelectedVehicleForEdit(vehicle);
    setIsVehicleFormOpen(true);
  };

  const handleSaveVehicle = (vehicle: BrickItem) => {
    saveVehicle(vehicle);
  };

  const handleOpenCopilot = (vehicle: BrickItem) => {
    setCopilotVehicle(vehicle);
    setIsCopilotOpen(true);
  };

  const handleOpenCopywriting = (item?: BrickItem) => {
    if (item) setCopywritingItem(item);
    setCurrentTab('copywriting');
  };

  const handleOpenChatSimulator = (vehicle?: BrickItem) => {
    if (vehicle) {
      setChatSimulatorVehicle(vehicle);
    }
    setCurrentTab('chat');
  };

  const handleMarkSold = (vehicle: BrickItem) => {
    setItemForMarkSold(vehicle);
    setIsMarkSoldOpen(true);
  };

  const handleOpenReceiptModal = (vehicle?: BrickItem) => {
    setItemForReceipt(vehicle || null);
    setIsReceiptModalOpen(true);
  };

  const handleConfirmSold = (updatedVehicle: BrickItem, newTradeItem?: BrickItem) => {
    saveVehicle(updatedVehicle);
    if (newTradeItem) {
      saveVehicle(newTradeItem);
    }
    setIsMarkSoldOpen(false);
    setItemForMarkSold(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onOpenNewVehicle={handleOpenNewVehicle}
        onOpenReceiptModal={() => handleOpenReceiptModal()}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
        {currentTab === 'dashboard' && (
          <Dashboard
            onSelectVehicle={handleEditVehicle}
            onOpenNewVehicle={handleOpenNewVehicle}
            onOpenCopilot={handleOpenCopilot}
            onOpenChatSimulator={handleOpenChatSimulator}
            onOpenTradeIn={() => setCurrentTab('trade')}
            onOpenTaxReport={() => setCurrentTab('tax')}
            onOpenCardCalculator={() => setCurrentTab('card_fees')}
            onOpenSecurityChecklist={() => setCurrentTab('security')}
            onOpenCatalog={() => setCurrentTab('catalog')}
            onOpenGoals={() => setCurrentTab('goals')}
            onOpenReceiptModal={() => handleOpenReceiptModal()}
            onOpenCopywriting={(item) => handleOpenCopywriting(item)}
            onOpenCrm={() => setCurrentTab('crm')}
            onOpenBackup={() => setCurrentTab('backup')}
          />
        )}

        {currentTab === 'vehicles' && (
          <VehicleList
            onSelectVehicle={handleEditVehicle}
            onOpenNewVehicle={handleOpenNewVehicle}
            onEditVehicle={handleEditVehicle}
            onOpenCopilot={handleOpenCopilot}
            onOpenChatSimulator={handleOpenChatSimulator}
            onMarkSold={handleMarkSold}
            onGenerateReceipt={(item) => handleOpenReceiptModal(item)}
            onOpenCopywriting={(item) => handleOpenCopywriting(item)}
          />
        )}

        {currentTab === 'copywriting' && (
          <CopywritingGenerator initialItem={copywritingItem} />
        )}

        {currentTab === 'crm' && <ClientCrm />}

        {currentTab === 'trade' && <TradeInEvaluator />}

        {currentTab === 'card_fees' && <CardFeeCalculator />}

        {currentTab === 'catalog' && <PublicCatalogView />}

        {currentTab === 'security' && <AntiScamChecklist />}

        {currentTab === 'goals' && <ProfitGoalsAndTurnover />}

        {currentTab === 'backup' && <DataBackupExport />}

        {currentTab === 'chat' && (
          <ChatSimulator initialVehicle={chatSimulatorVehicle} />
        )}

        {currentTab === 'tax' && <TaxReport />}
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AutoBrick & Brik Master &bull; Sistema Universal de Gestão Financeira, Giro & Negociações</span>
          <span className="text-amber-400/80">Games &bull; TVs &bull; Celulares &bull; Carros &bull; Informática &bull; Ferramentas</span>
        </div>
      </footer>

      {/* Modals */}
      <VehicleFormModal
        isOpen={isVehicleFormOpen}
        onClose={() => setIsVehicleFormOpen(false)}
        onSave={handleSaveVehicle}
        onDelete={deleteVehicle}
        initialVehicle={selectedVehicleForEdit}
      />

      <MarkSoldModal
        isOpen={isMarkSoldOpen}
        item={itemForMarkSold}
        onClose={() => {
          setIsMarkSoldOpen(false);
          setItemForMarkSold(null);
        }}
        onConfirm={handleConfirmSold}
        onGenerateReceipt={(item) => handleOpenReceiptModal(item)}
      />

      {isReceiptModalOpen && (
        <ReceiptGeneratorModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setItemForReceipt(null);
          }}
          prefilledItem={itemForReceipt || undefined}
        />
      )}

      {copilotVehicle && (
        <CopilotModal
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          vehicle={copilotVehicle}
        />
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
export default App;
