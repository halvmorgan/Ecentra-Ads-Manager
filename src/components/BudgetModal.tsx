import React, { useState } from 'react';
import { DollarSign, X, Check } from 'lucide-react';
import { api } from '../services/api';

interface BudgetModalProps {
  clientId: string;
  adId: string;
  currentBudget: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  clientId,
  adId,
  currentBudget,
  onClose,
  onSuccess,
}) => {
  const [budget, setBudget] = useState(currentBudget || 50);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.updateBudget(adId, budget);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update budget');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
            <DollarSign className="w-4 h-4 text-amber-600" />
            <span>Update Daily Budget</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-xs">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Ad Budget ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
              <input
                type="number"
                min={5}
                max={5000}
                required
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 pl-7 text-sm font-bold text-slate-900"
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Projected 30-day spend: <strong>${(budget * 30).toLocaleString()}</strong>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
            >
              {isUpdating ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
