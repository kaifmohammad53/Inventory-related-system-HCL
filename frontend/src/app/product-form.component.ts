import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  categoryId: number | null;
  price: number | null;
  costPrice: number | null;
  reorderLevel: number | null;
  unit: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (open) {
      <div class="modal-backdrop" (click)="close()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>{{ editMode ? 'Edit Product' : 'Add Product' }}</h2>
              <p>
                {{
                  editMode ? 'Update product information.' : 'Create a new product in the catalog.'
                }}
              </p>
            </div>
            <button class="close-btn" type="button" (click)="close()">×</button>
          </div>

          @if (errorMessage) {
            <div class="error-box">{{ errorMessage }}</div>
          }

          <form (ngSubmit)="save()">
            <div class="form-grid">
              <label>
                SKU
                <input name="sku" [(ngModel)]="form.sku" required />
              </label>

              <label>
                Product Name
                <input name="name" [(ngModel)]="form.name" required />
              </label>

              <label class="full">
                Description
                <textarea name="description" [(ngModel)]="form.description" rows="3"></textarea>
              </label>

              <label>
                Category
                <select
                  name="categoryId"
                  [ngModel]="form.categoryId"
                  (ngModelChange)="form.categoryId = +$event"
                >
                  <option [ngValue]="null">Select Category</option>
                  @for (category of categories; track category.id) {
                    <option [ngValue]="category.id">{{ category.name }}</option>
                  }
                </select>
              </label>

              <label>
                Unit
                <input name="unit" [(ngModel)]="form.unit" placeholder="pcs" required />
              </label>

              <label>
                Selling Price
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  [(ngModel)]="form.price"
                  required
                />
              </label>

              <label>
                Cost Price
                <input
                  name="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  [(ngModel)]="form.costPrice"
                  required
                />
              </label>

              <label>
                Reorder Level
                <input name="reorderLevel" type="number" min="0" [(ngModel)]="form.reorderLevel" />
              </label>
            </div>

            <div class="modal-actions">
              <button class="secondary-btn" type="button" (click)="close()">Cancel</button>
              <button class="primary-btn" type="submit" [disabled]="saving">
                {{ saving ? 'Saving...' : editMode ? 'Update Product' : 'Add Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.48);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
      }

      .modal {
        width: min(680px, 100%);
        max-height: 90vh;
        overflow: auto;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        padding: 24px;
        color: #172033;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
      }

      h2 {
        margin: 0 0 5px;
        font-size: 22px;
      }
      p {
        margin: 0;
        color: #64748b;
        font-size: 13px;
      }

      .close-btn {
        border: 0;
        background: transparent;
        font-size: 28px;
        line-height: 1;
        color: #64748b;
        cursor: pointer;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
      }

      label {
        display: flex;
        flex-direction: column;
        gap: 7px;
        font-size: 13px;
        font-weight: 600;
        color: #334155;
      }

      .full {
        grid-column: 1 / -1;
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #dbe2ea;
        border-radius: 7px;
        background: #fff;
        color: #172033;
        font: inherit;
        outline: none;
      }

      input:focus,
      textarea:focus,
      select:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      .error-box {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 11px 13px;
        margin-bottom: 16px;
        font-size: 13px;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 22px;
      }

      .primary-btn,
      .secondary-btn {
        border: 0;
        padding: 10px 16px;
        border-radius: 7px;
        cursor: pointer;
        font-weight: 600;
      }

      .primary-btn {
        background: #2563eb;
        color: white;
      }

      .primary-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .secondary-btn {
        background: #f1f5f9;
        color: #334155;
      }

      @media (max-width: 620px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
        .full {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class ProductFormComponent implements OnChanges {
  @Input() open = false;
  @Input() product: any = null;
  @Input() categories: any[] = [];

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  editMode = false;
  saving = false;
  errorMessage = '';

  form: ProductFormData = this.emptyForm();

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] || changes['product']) {
      this.editMode = !!this.product;
      this.form = this.product
        ? {
            sku: this.product.sku ?? '',
            name: this.product.name ?? '',
            description: this.product.description ?? '',
            categoryId: this.product.category?.id ?? null,
            price: this.product.price ?? null,
            costPrice: this.product.costPrice ?? null,
            reorderLevel: this.product.reorderLevel ?? 10,
            unit: this.product.unit ?? 'pcs',
          }
        : this.emptyForm();

      this.errorMessage = '';
      this.saving = false;
    }
  }

  async save(): Promise<void> {
    if (
      !this.form.sku.trim() ||
      !this.form.name.trim() ||
      this.form.price === null ||
      this.form.costPrice === null
    ) {
      this.errorMessage = 'Please fill SKU, Product Name, Selling Price and Cost Price.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      sku: this.form.sku.trim(),
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      categoryId: this.form.categoryId,
      price: this.form.price,
      costPrice: this.form.costPrice,
      reorderLevel: this.form.reorderLevel ?? 10,
      unit: this.form.unit.trim() || 'pcs',
    };

    try {
      const response = this.editMode
        ? await this.api.put<any>(`/products/${this.product.id}`, payload)
        : await this.api.post<any>('/products', payload);

      this.saved.emit(response);
      this.close();
    } catch (error: any) {
      console.error('Product save failed:', error);
      this.errorMessage = error?.error?.error || error?.message || 'Unable to save product.';
    } finally {
      this.saving = false;
    }
  }

  close(): void {
    this.closed.emit();
  }

  private emptyForm(): ProductFormData {
    return {
      sku: '',
      name: '',
      description: '',
      categoryId: null,
      price: null,
      costPrice: null,
      reorderLevel: 10,
      unit: 'pcs',
    };
  }
}
