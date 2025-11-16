import React from 'react';

const ExitWindow = ({ open, onCancel, onConfirm, darkMode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] backdrop-blur-md bg-black/40">
      <div className="w-full max-w-sm mx-4 bg-white/10 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700 rounded-2xl shadow-xl p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100">Konfirmasi Logout</h2>
        <p className="text-sm mb-6 text-slate-700 dark:text-slate-300">Apakah yakin mau keluar?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-400/40 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200/40 dark:hover:bg-slate-700/40 transition text-sm"
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition text-sm"
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitWindow;
