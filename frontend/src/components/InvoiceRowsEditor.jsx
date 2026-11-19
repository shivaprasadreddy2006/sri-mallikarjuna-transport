import React from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';

export default function InvoiceRowsEditor({ rows, onChangeRows }) {
  const handleFieldChange = (index, field, value) => {
    const updated = [...rows];
    const currentRow = { ...updated[index], [field]: value };

    // Auto-calculate row total if freight or unloading changed
    if (field === 'freight' || field === 'unloading') {
      const fNum = Number(field === 'freight' ? value : currentRow.freight) || 0;
      const unVal = field === 'unloading' ? value : currentRow.unloading;
      const unNum = !isNaN(Number(unVal)) && String(unVal).trim() !== '' ? Number(unVal) : 0;

      if (fNum > 0 || unNum > 0) {
        currentRow.total = fNum + unNum;
      } else if (fNum === 0 && unNum === 0 && String(currentRow.freight).trim() === '') {
        currentRow.total = '';
      }
    }

    updated[index] = currentRow;
    onChangeRows(updated);
  };

  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];
    let nextSno = '';
    if (lastRow && typeof lastRow.sNo === 'number') {
      nextSno = lastRow.sNo + 1;
    } else if (lastRow && !isNaN(Number(lastRow.sNo)) && String(lastRow.sNo).trim() !== '') {
      nextSno = Number(lastRow.sNo) + 1;
    }

    const newRow = {
      sNo: nextSno,
      loadingDate: lastRow?.loadingDate || '',
      vehicleNumber: '',
      customerInvoiceNo: '',
      from: '',
      to: '',
      freight: '',
      unloading: '',
      unloadingText: '',
      total: '',
    };
    onChangeRows([...rows, newRow]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length <= 1) {
      onChangeRows([
        {
          sNo: 1,
          loadingDate: '',
          vehicleNumber: '',
          customerInvoiceNo: '',
          from: '',
          to: '',
          freight: '',
          unloading: '',
          total: '',
        },
      ]);
      return;
    }
    const updated = rows.filter((_, idx) => idx !== index);
    onChangeRows(updated);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            Bill Rows ({rows.length})
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500">
            For 2 vehicles or sub-invoice numbers, add extra rows below.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Row</span>
        </button>
      </div>

      {/* 1. Mobile Phone View (< sm screens): Touch-friendly Cards */}
      <div className="sm:hidden p-3 space-y-3 bg-slate-50/50">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2.5 relative"
          >
            {/* Row Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Row {idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400">S.No:</span>
                  <input
                    type="text"
                    value={row.sNo !== undefined && row.sNo !== null ? row.sNo : ''}
                    onChange={(e) => handleFieldChange(idx, 'sNo', e.target.value)}
                    placeholder={String(idx + 1)}
                    className="w-10 text-center text-xs font-bold border border-slate-300 rounded px-1 py-0.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className="p-1.5 text-slate-400 hover:text-red-600 active:text-red-700 rounded-lg transition-colors"
                title="Delete Row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Vehicle Number & Loading Date */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Vehicle No
                </label>
                <input
                  type="text"
                  value={row.vehicleNumber || ''}
                  onChange={(e) => handleFieldChange(idx, 'vehicleNumber', e.target.value.toUpperCase())}
                  placeholder="TS08UH0187"
                  className="w-full text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Loading Date
                </label>
                <input
                  type="text"
                  value={row.loadingDate || ''}
                  onChange={(e) => handleFieldChange(idx, 'loadingDate', e.target.value)}
                  placeholder="DD-MM-YYYY"
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Invoice No */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                Customer Invoice No
              </label>
              <input
                type="text"
                value={row.customerInvoiceNo || ''}
                onChange={(e) => handleFieldChange(idx, 'customerInvoiceNo', e.target.value)}
                placeholder="SPI/26-27/1802 or H005818"
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium"
              />
            </div>

            {/* Route: From & To */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  From (Origin)
                </label>
                <input
                  type="text"
                  value={row.from || ''}
                  onChange={(e) => handleFieldChange(idx, 'from', e.target.value)}
                  placeholder="Jadcherla / ACPL"
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  To (Destination)
                </label>
                <input
                  type="text"
                  value={row.to || ''}
                  onChange={(e) => handleFieldChange(idx, 'to', e.target.value)}
                  placeholder="Sri city / Jadcherla"
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Financials: Freight, Unloading, Row Total */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Freight (₹)
                </label>
                <input
                  type="number"
                  value={row.freight !== undefined && row.freight !== null ? row.freight : ''}
                  onChange={(e) => handleFieldChange(idx, 'freight', e.target.value)}
                  placeholder="25000"
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg px-2 py-1.5 text-right focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Unloading
                </label>
                <input
                  type="text"
                  value={row.unloading !== undefined && row.unloading !== null ? row.unloading : ''}
                  onChange={(e) => handleFieldChange(idx, 'unloading', e.target.value)}
                  placeholder="Nill / 500"
                  className="w-full text-xs border border-slate-300 rounded-lg px-2 py-1.5 text-center focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                  Row Total
                </label>
                <input
                  type="text"
                  value={row.total !== undefined && row.total !== null ? row.total : ''}
                  onChange={(e) => handleFieldChange(idx, 'total', e.target.value)}
                  placeholder="25000"
                  className="w-full text-xs font-extrabold text-emerald-800 bg-emerald-50/70 border border-emerald-200 rounded-lg px-2 py-1.5 text-right focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Desktop Table View (>= sm screens) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
              <th className="py-2 px-2 w-12 text-center">S.No</th>
              <th className="py-2 px-2 min-w-[105px]">Loading Date</th>
              <th className="py-2 px-2 min-w-[125px]">Vehicle No</th>
              <th className="py-2 px-2 min-w-[135px]">Invoice No</th>
              <th className="py-2 px-2 min-w-[110px]">From</th>
              <th className="py-2 px-2 min-w-[110px]">To</th>
              <th className="py-2 px-2 min-w-[95px] text-right">Freight (₹)</th>
              <th className="py-2 px-2 min-w-[85px] text-center">Unloading</th>
              <th className="py-2 px-2 min-w-[95px] text-right">Total (₹)</th>
              <th className="py-2 px-2 w-10 text-center">Del</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                <td className="p-1.5 text-center">
                  <input
                    type="text"
                    value={row.sNo !== undefined && row.sNo !== null ? row.sNo : ''}
                    onChange={(e) => handleFieldChange(idx, 'sNo', e.target.value)}
                    placeholder={String(idx + 1)}
                    className="w-10 text-center text-xs font-semibold border border-slate-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </td>

                <td className="p-1.5">
                  <input
                    type="text"
                    value={row.loadingDate || ''}
                    onChange={(e) => handleFieldChange(idx, 'loadingDate', e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </td>

                <td className="p-1.5">
                  <input
                    type="text"
                    value={row.vehicleNumber || ''}
                    onChange={(e) => handleFieldChange(idx, 'vehicleNumber', e.target.value.toUpperCase())}
                    placeholder="TS08UH0187"
                    className="w-full text-xs font-mono font-semibold uppercase border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </td>

                <td className="p-1.5">
                  <input
                    type="text"
                    value={row.customerInvoiceNo || ''}
                    onChange={(e) => handleFieldChange(idx, 'customerInvoiceNo', e.target.value)}
                    placeholder="SPI/26-27/1802"
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </td>

                <td className="p-1.5">
                  <input
                    type="text"
                    value={row.from || ''}
                    onChange={(e) => handleFieldChange(idx, 'from', e.target.value)}
                    placeholder="Jadcherla"
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </td>

                <td className="p-1.5">
                  <input
                    type="text"
                    value={row.to || ''}
                    onChange={(e) => handleFieldChange(idx, 'to', e.target.value)}
                    placeholder="Sri city"
                    className="w-full text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </td>

                <td className="p-1.5">
                  <input
                    type="number"
                    value={row.freight !== undefined && row.freight !== null ? row.freight : ''}
                    onChange={(e) => handleFieldChange(idx, 'freight', e.target.value)}
                    placeholder="25000"
                    className="w-full text-right text-xs font-semibold border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </td>

                <td className="p-1.5">
                  <input
                    type="text"
                    value={row.unloading !== undefined && row.unloading !== null ? row.unloading : ''}
                    onChange={(e) => handleFieldChange(idx, 'unloading', e.target.value)}
                    placeholder="Nill / 500"
                    className="w-full text-center text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </td>

                <td className="p-1.5">
                  <input
                    type="text"
                    value={row.total !== undefined && row.total !== null ? row.total : ''}
                    onChange={(e) => handleFieldChange(idx, 'total', e.target.value)}
                    placeholder="25000"
                    className="w-full text-right text-xs font-bold text-slate-800 border border-slate-200 bg-slate-50 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </td>

                <td className="p-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    title="Remove this row"
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Tip Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[11px] sm:text-xs">
            Sub-rows: leave S.No & Vehicle blank to add extra invoice numbers (Bill #25 style).
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Another Row</span>
        </button>
      </div>
    </div>
  );
}
