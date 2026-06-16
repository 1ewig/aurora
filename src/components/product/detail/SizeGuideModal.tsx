"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBodyScrollLock } from "@/hooks/ui/useBodyScrollLock";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"in" | "cm">("cm");

  useBodyScrollLock(isOpen);

  const isAccessory = category.toLowerCase() === "accessories";
  // Determine if it is likely a belt based on the category/sizing style
  const isBelt = isAccessory && category.toLowerCase() !== "dresses"; // general checks

  // Sizing data
  const apparelSizes = [
    { size: "XS", chestIn: "32-34", chestCm: "81-86", waistIn: "26-28", waistCm: "66-71", hipsIn: "33-35", hipsCm: "84-89" },
    { size: "S", chestIn: "35-37", chestCm: "89-94", waistIn: "29-31", waistCm: "74-79", hipsIn: "36-38", hipsCm: "91-97" },
    { size: "M", chestIn: "38-40", chestCm: "97-102", waistIn: "32-34", waistCm: "81-86", hipsIn: "39-41", hipsCm: "99-104" },
    { size: "L", chestIn: "41-43", chestCm: "104-109", waistIn: "35-37", waistCm: "89-94", hipsIn: "42-44", hipsCm: "107-112" },
    { size: "XL", chestIn: "44-46", chestCm: "112-117", waistIn: "38-40", waistCm: "97-102", hipsIn: "45-47", hipsCm: "114-119" },
  ];

  const beltSizes = [
    { size: "80", lengthIn: "36.5", lengthCm: "93", waistIn: "29-31", waistCm: "74-79" },
    { size: "85", lengthIn: "38.5", lengthCm: "98", waistIn: "31-33", waistCm: "79-84" },
    { size: "90", lengthIn: "40.5", lengthCm: "103", waistIn: "33-35", waistCm: "84-89" },
    { size: "95", lengthIn: "42.5", lengthCm: "108", waistIn: "35-37", waistCm: "89-94" },
    { size: "100", lengthIn: "44.5", lengthCm: "113", waistIn: "37-39", waistCm: "94-99" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="font-display font-black uppercase text-lg tracking-wider text-text-primary">
                  Size Guide
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  {isBelt ? "Belt Sizing Guide" : "Apparel Sizing Guide"}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close size guide"
                className="p-1.5 hover:bg-bg-secondary rounded-full transition-colors cursor-pointer text-text-secondary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Unit Switcher */}
              <div className="flex justify-end">
                <div className="inline-flex p-0.5 bg-bg-secondary rounded-lg border border-border-subtle">
                  <button
                    onClick={() => setUnit("in")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                      unit === "in"
                        ? "bg-white text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    Inches
                  </button>
                  <button
                    onClick={() => setUnit("cm")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                      unit === "cm"
                        ? "bg-white text-text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    Metric (cm)
                  </button>
                </div>
              </div>

              {/* Sizing Table */}
              {isBelt ? (
                <div className="border border-border-subtle rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-bg-secondary border-b border-border-subtle text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <th className="p-3">Size</th>
                        <th className="p-3">Fits Waist</th>
                        <th className="p-3">Total Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-text-secondary">
                      {beltSizes.map((row) => (
                        <tr key={row.size} className="hover:bg-bg-secondary/40 transition-colors">
                          <td className="p-3 font-semibold text-text-primary">{row.size}</td>
                          <td className="p-3">
                            {unit === "in" ? `${row.waistIn}″` : `${row.waistCm} cm`}
                          </td>
                          <td className="p-3">
                            {unit === "in" ? `${row.lengthIn}″` : `${row.lengthCm} cm`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-border-subtle rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-bg-secondary border-b border-border-subtle text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <th className="p-3">Size</th>
                        <th className="p-3">Chest</th>
                        <th className="p-3">Waist</th>
                        <th className="p-3">Hips</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-text-secondary">
                      {apparelSizes.map((row) => (
                        <tr key={row.size} className="hover:bg-bg-secondary/40 transition-colors">
                          <td className="p-3 font-semibold text-text-primary">{row.size}</td>
                          <td className="p-3">
                            {unit === "in" ? `${row.chestIn}″` : `${row.chestCm} cm`}
                          </td>
                          <td className="p-3">
                            {unit === "in" ? `${row.waistIn}″` : `${row.waistCm} cm`}
                          </td>
                          <td className="p-3">
                            {unit === "in" ? `${row.hipsIn}″` : `${row.hipsCm} cm`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  How to Measure
                </h4>
                <ul className="space-y-2.5 text-xs text-text-secondary list-disc pl-4 leading-relaxed">
                  <li>
                    <strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.
                  </li>
                  <li>
                    <strong>Waist:</strong> Measure around the narrowest part of your waistline, typically where your body bends side to side.
                  </li>
                  <li>
                    <strong>Hips:</strong> Measure around the fullest part of your hips, keeping the feet together.
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-bg-secondary border-t border-border-subtle flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border border-border-subtle hover:border-text-primary bg-white text-text-primary transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
