/**
 * Aurora — src/components/admin/inventory/SizeStockFields.tsx
 *
 * Form section for adding, editing, and removing product sizes with stock levels.
 */
import { type SizeStock } from "@/stores/useAdminStore";

interface SizeStockFieldsProps {
  newSizeName: string;
  onNewSizeNameChange: (val: string) => void;
  newSizeStock: string;
  onNewSizeStockChange: (val: string) => void;
  onAddSize: () => void;
  formSizes: SizeStock[];
  onStockChange: (size: string, stock: number) => void;
  onRemoveSize: (size: string) => void;
}

/** Renders inputs for adding new sizes and a list of existing sizes with editable stock and remove action. */
export function SizeStockFields({
  newSizeName,
  onNewSizeNameChange,
  newSizeStock,
  onNewSizeStockChange,
  onAddSize,
  formSizes,
  onStockChange,
  onRemoveSize,
}: SizeStockFieldsProps) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
        Sizes & Stock levels
      </h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Size (e.g. XL, 38)"
          value={newSizeName}
          onChange={(e) => onNewSizeNameChange(e.target.value)}
          className="w-1/2 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
        />
        <input
          type="number"
          placeholder="Stock"
          value={newSizeStock}
          onChange={(e) => onNewSizeStockChange(e.target.value)}
          className="w-1/4 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={onAddSize}
          className="px-4 py-2 bg-bg-ink text-text-inverted rounded-full text-xs hover:bg-text-primary transition-colors cursor-pointer"
        >
          Add Size
        </button>
      </div>

      <div className="space-y-2">
        {formSizes.length === 0 ? (
          <div className="text-xs text-text-muted italic">No sizes specified.</div>
        ) : (
          formSizes.map((s) => (
            <div key={s.size} className="flex items-center justify-between bg-bg-primary/40 p-2 px-3 border border-border-subtle rounded-lg">
              <span className="font-mono text-sm font-semibold">{s.size}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-secondary">Stock:</span>
                <input
                  type="number"
                  value={s.stock}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (isNaN(val)) return;
                    onStockChange(s.size, Math.max(0, val));
                  }}
                  className="w-16 px-2 py-1 bg-white border border-border-medium rounded text-xs text-center focus:outline-none focus:border-accent-primary"
                />
                <button
                  type="button"
                  onClick={() => onRemoveSize(s.size)}
                  className="text-error font-bold text-xs hover:text-red-700 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
