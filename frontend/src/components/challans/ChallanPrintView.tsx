import React from 'react';
import { Challan } from '../../types';
import { Printer } from 'lucide-react';

interface ChallanPrintViewProps {
  challan: Challan;
}

export const ChallanPrintView: React.FC<ChallanPrintViewProps> = ({ challan }) => {
  const handlePrint = () => {
    window.print();
  };

  const totalAmount = challan.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between no-print border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Delivery Challan Printable Copy</h3>
          <p className="text-xs text-slate-400">
            Export or print official delivery document snapshot
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-600/20 text-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Printable Invoice Container */}
      <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl space-y-6 print:p-0 print:shadow-none font-sans">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              WHOLESALE OPERATIONS PORTAL
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Industrial Distribution & Supply Chain Hub
            </p>
            <p className="text-xs text-slate-600">GSTIN: 27AAAAA1234A1Z9 | Phone: +91 22 5550 0100</p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-sm tracking-wider uppercase rounded">
              SALES CHALLAN
            </span>
            <p className="text-lg font-bold text-slate-900 mt-2">{challan.challanNumber}</p>
            <p className="text-xs text-slate-600">
              Date: {new Date(challan.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </p>
            <p className="text-xs font-semibold text-slate-700 mt-1">
              Status: <span className="uppercase">{challan.status}</span>
            </p>
          </div>
        </div>

        {/* Customer & Delivery Details */}
        <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-900 uppercase block mb-1">Billed & Delivered To:</span>
            <p className="font-bold text-sm text-slate-900">{challan.customer.name}</p>
            <p className="font-semibold text-slate-800">{challan.customer.businessName}</p>
            <p className="text-slate-600 mt-1">{challan.customer.address}</p>
            <p className="text-slate-600 mt-1">Mobile: {challan.customer.mobile}</p>
            {challan.customer.gstNumber && (
              <p className="text-slate-700 font-medium">GSTIN: {challan.customer.gstNumber}</p>
            )}
          </div>

          <div className="text-right">
            <span className="font-bold text-slate-900 uppercase block mb-1">Challan Metadata:</span>
            <p className="text-slate-700">Issued By: <span className="font-semibold">{challan.createdBy?.name}</span></p>
            <p className="text-slate-700">Total Line Items: <span className="font-semibold">{challan.items.length}</span></p>
            <p className="text-slate-700">Total Quantity: <span className="font-semibold">{challan.totalQuantity} units</span></p>
          </div>
        </div>

        {/* Product Items Table */}
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-semibold">
              <th className="p-2.5 rounded-l">#</th>
              <th className="p-2.5">Product Name</th>
              <th className="p-2.5">SKU Code</th>
              <th className="p-2.5 text-right">Unit Price</th>
              <th className="p-2.5 text-right">Quantity</th>
              <th className="p-2.5 text-right rounded-r">Total (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {challan.items.map((item, idx) => (
              <tr key={item.id}>
                <td className="p-2.5 font-medium">{idx + 1}</td>
                <td className="p-2.5 font-semibold text-slate-900">{item.productName}</td>
                <td className="p-2.5 font-mono">{item.sku}</td>
                <td className="p-2.5 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-right font-bold">{item.quantity}</td>
                <td className="p-2.5 text-right font-mono font-bold">
                  ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-900 font-bold bg-slate-100 text-slate-900">
              <td colSpan={4} className="p-2.5 text-right font-bold uppercase">
                Grand Total
              </td>
              <td className="p-2.5 text-right font-bold text-sm">{challan.totalQuantity} units</td>
              <td className="p-2.5 text-right font-mono text-sm text-cyan-900 font-bold">
                ₹{totalAmount.toLocaleString('en-IN')}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Declaration Footer */}
        <div className="pt-8 border-t border-slate-300 flex justify-between items-end text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-800">Terms & Conditions:</p>
            <p>1. Goods once sold/delivered will not be taken back without authorization.</p>
            <p>2. Subject to local jurisdiction.</p>
          </div>

          <div className="text-center pt-8 border-t border-slate-400 w-48">
            <p className="font-bold text-slate-900">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
};
