/**
 * Aurora — src/components/admin/inventory/BasicDetailsFields.tsx
 *
 * Form fields for product identity, pricing, and display metadata.
 */
import { useCategoriesQuery } from "@/hooks/queries";

interface BasicDetailsFieldsProps {
  editingProduct: boolean;
  formId: string;
  onFormIdChange: (val: string) => void;
  formName: string;
  onFormNameChange: (val: string) => void;
  formSlug: string;
  onFormSlugChange: (val: string) => void;
  formCategory: string;
  onFormCategoryChange: (val: string) => void;
  formPrice: string;
  onFormPriceChange: (val: string) => void;
  formBadge: string;
  onFormBadgeChange: (val: string) => void;
  formSpan: string;
  onFormSpanChange: (val: string) => void;
  formAspectRatio: string;
  onFormAspectRatioChange: (val: string) => void;
  formAltText: string;
  onFormAltTextChange: (val: string) => void;
}

/** Renders input fields for product ID, name, slug, category, price, badge, span, aspect ratio, and alt text. */
export function BasicDetailsFields(props: BasicDetailsFieldsProps) {
  const { data: dbCategories = [] } = useCategoriesQuery();
  const fallbackCategories = ["Outerwear", "Knitwear", "Trousers", "Dresses", "Accessories"];
  const categoriesList = dbCategories.length > 0 ? dbCategories.map((c) => c.name) : fallbackCategories;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
          Product ID (e.g. p15)
        </label>
        <input
          type="text"
          required
          disabled={props.editingProduct}
          value={props.formId}
          onChange={(e) => props.onFormIdChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm disabled:opacity-50 focus:border-accent-primary focus:outline-none"
          placeholder="p15"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
          Product Name
        </label>
        <input
          type="text"
          required
          value={props.formName}
          onChange={(e) => props.onFormNameChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
          placeholder="Classic Wool Coat"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
          Slug (unique identifier)
        </label>
        <input
          type="text"
          required
          value={props.formSlug}
          onChange={(e) => props.onFormSlugChange(e.target.value)}
          className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
          placeholder="classic-wool-coat"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Category
          </label>
          <select
            value={props.formCategory}
            onChange={(e) => props.onFormCategoryChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={props.formPrice}
            onChange={(e) => props.onFormPriceChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
            placeholder="350.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Badge (optional)
          </label>
          <input
            type="text"
            value={props.formBadge}
            onChange={(e) => props.onFormBadgeChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
            placeholder="New / Limited"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Span grid size (optional)
          </label>
          <input
            type="text"
            value={props.formSpan}
            onChange={(e) => props.onFormSpanChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
            placeholder="col-span-2 / tall"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Aspect Ratio (optional)
          </label>
          <input
            type="text"
            value={props.formAspectRatio}
            onChange={(e) => props.onFormAspectRatioChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
            placeholder="3/4 or portrait"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
            Alt Text
          </label>
          <input
            type="text"
            required
            value={props.formAltText}
            onChange={(e) => props.onFormAltTextChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-bg-primary border border-border-medium rounded-full text-sm focus:border-accent-primary focus:outline-none"
            placeholder="Wool coat on model"
          />
        </div>
      </div>
    </div>
  );
}
