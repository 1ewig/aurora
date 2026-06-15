interface BulletDetailsFieldsProps {
  formDetailInput: string;
  onFormDetailInputChange: (val: string) => void;
  onAddDetail: () => void;
  formDetails: string[];
  onRemoveDetail: (index: number) => void;
}

export function BulletDetailsFields({
  formDetailInput,
  onFormDetailInputChange,
  onAddDetail,
  formDetails,
  onRemoveDetail,
}: BulletDetailsFieldsProps) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-3">
        Detail bullet points
      </h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="e.g. 100% cashmere, Made in Italy"
          value={formDetailInput}
          onChange={(e) => onFormDetailInputChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={onAddDetail}
          className="px-4 py-2 bg-bg-ink text-text-inverted rounded-full text-xs hover:bg-text-primary transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>

      <ul className="space-y-1.5">
        {formDetails.length === 0 ? (
          <li className="text-xs text-text-muted italic">No detail bullet points added.</li>
        ) : (
          formDetails.map((detail, index) => (
            <li key={index} className="flex items-start justify-between text-xs bg-bg-primary/20 p-2.5 rounded-lg border border-border-subtle">
              <span className="flex-1 pr-4 text-text-secondary">{detail}</span>
              <button
                type="button"
                onClick={() => onRemoveDetail(index)}
                className="text-error hover:text-red-700 cursor-pointer text-xs"
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
