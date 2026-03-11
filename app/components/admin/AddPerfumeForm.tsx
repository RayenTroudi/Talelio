"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/app/components/LocaleProvider";

interface Note {
  name: string;
  image?: FileList;
}

interface PerfumeFormData {
  name: string;
  brand: string;
  price: number;
  category: string;
  sizes: number[];
  topNotes: Note[];
  middleNotes: Note[];
  baseNotes: Note[];
  productImages: FileList;
  description?: string;
  isInStock: boolean;
}

interface AddPerfumeFormProps {
  onSubmit: (data: PerfumeFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: Partial<PerfumeFormData>;
  isEditMode?: boolean;
}

export function AddPerfumeForm({ onSubmit, onCancel, isLoading = false, initialData, isEditMode = false }: AddPerfumeFormProps) {
  const { t } = useTranslation();
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PerfumeFormData>({
    defaultValues: {
      name: initialData?.name || "",
      brand: initialData?.brand || "",
      price: initialData?.price || 0,
      category: initialData?.category || "",
      sizes: initialData?.sizes || [],
      topNotes: initialData?.topNotes || [{ name: "" }],
      middleNotes: initialData?.middleNotes || [{ name: "" }],
      baseNotes: initialData?.baseNotes || [{ name: "" }],
      description: initialData?.description || "",
      isInStock: initialData?.isInStock ?? true,
    },
  });

  const { fields: topNotesFields, append: appendTopNote, remove: removeTopNote } = useFieldArray({
    control,
    name: "topNotes",
  });

  const { fields: middleNotesFields, append: appendMiddleNote, remove: removeMiddleNote } = useFieldArray({
    control,
    name: "middleNotes",
  });

  const { fields: baseNotesFields, append: appendBaseNote, remove: removeBaseNote } = useFieldArray({
    control,
    name: "baseNotes",
  });

  const availableSizes = [30, 50, 100];
  const categories = ["Femme", "Homme", "Unisex", "Coffret", "Pac Misk"];

  const watchedSizes = watch("sizes");

  const handleSizeToggle = (size: number) => {
    const currentSizes = watchedSizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size].sort((a, b) => a - b);
    setValue("sizes", newSizes);
  };

  const onSubmitForm = async (data: PerfumeFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderNoteSection = (
    title: string,
    fieldName: string,
    fields: any[],
    append: (value: any) => void,
    remove: (index: number) => void,
    register: any,
    errors: any,
    description: string
  ) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t.admin.addPerfume.notesSectionTitle} {title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <Button
          type="button"
          onClick={() => append({ name: "" })}
          variant="outline"
          size="sm"
        >
          {t.admin.addPerfume.addNote}
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Input
                placeholder={t.admin.addPerfume.notePlaceholder}
                {...register(`${fieldName}Notes.${index}.name`, {
                required: `${t.admin.addPerfume.notesSectionTitle} ${title} ${t.admin.addPerfume.noteRequired}`
                })}
                className="mb-2 text-right"
              />
              {errors[`${fieldName}Notes`]?.[index]?.name && (
                <p className="text-red-500 text-sm mb-2">
                  {errors[`${fieldName}Notes`][index].name.message}
                </p>
              )}
            </div>
            {fields.length > 1 && (
              <Button
                type="button"
                onClick={() => remove(index)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                {t.common.delete}
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <Card className="max-w-4xl mx-auto" dir="rtl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? t.admin.addPerfume.editTitle : t.admin.addPerfume.formTitle}
        </h2>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-900">
                {t.admin.addPerfume.productName}
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: t.admin.addPerfume.errors.nameRequired })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t.admin.addPerfume.namePlaceholder}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="brand" className="text-sm font-medium text-gray-900">
                {t.admin.addPerfume.brandLabel}
              </label>
              <input
                type="text"
                id="brand"
                {...register("brand", { required: t.admin.addPerfume.errors.brandRequired })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right ${
                  errors.brand ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t.admin.addPerfume.brandPlaceholder}
              />
              {errors.brand && <p className="text-red-500 text-sm">{errors.brand.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-gray-900">
                {t.admin.addPerfume.priceLabel}
              </label>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                {...register("price", {
                  required: t.admin.addPerfume.errors.priceRequired,
                  min: { value: 0.01, message: t.admin.addPerfume.errors.priceMin }
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gray-900">
                {t.admin.addPerfume.categoryLabel}
              </label>
              <select
                id="category"
                {...register("category", { required: t.admin.addPerfume.errors.categoryRequired })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">{t.admin.addPerfume.selectCategory}</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-900">
              {t.admin.addPerfume.descriptionLabel}
            </label>
            <textarea
              id="description"
              rows={4}
              {...register("description")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              placeholder={t.admin.addPerfume.descriptionPlaceholder}
            />
          </div>

          {/* Available Sizes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              {t.admin.addPerfume.sizesLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`px-4 py-2 rounded-md border transition-colors ${
                    watchedSizes?.includes(size)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                  }`}
                >
                  {size}{t.admin.addPerfume.sizeSuffix}
                </button>
              ))}
            </div>
            {errors.sizes && <p className="text-red-500 text-sm">{errors.sizes.message}</p>}
          </div>

          {/* Product Images */}
          <div className="space-y-2">
            <label htmlFor="productImages" className="text-sm font-medium text-gray-900">
              {t.admin.addPerfume.imagesLabel}
            </label>
            <input
              type="file"
              id="productImages"
              multiple
              accept="image/*"
              {...register("productImages")}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.productImages ? "border-red-500" : "border-gray-300"
              }`}
            />
            <p className="text-sm text-gray-500">
              {t.admin.addPerfume.imagesHint}
            </p>
            {errors.productImages && <p className="text-red-500 text-sm">{errors.productImages.message}</p>}
          </div>

          {/* Fragrance Notes */}
          {/* Fragrance Notes */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t.admin.addPerfume.fragranceNotes}</h3>

            {renderNoteSection(
              t.admin.addPerfume.topNotes,
              "top",
              topNotesFields,
              appendTopNote,
              removeTopNote,
              register,
              errors,
              t.admin.addPerfume.topNotesDesc
            )}

            {renderNoteSection(
              t.admin.addPerfume.middleNotes,
              "middle",
              middleNotesFields,
              appendMiddleNote,
              removeMiddleNote,
              register,
              errors,
              t.admin.addPerfume.middleNotesDesc
            )}

            {renderNoteSection(
              t.admin.addPerfume.baseNotes,
              "base",
              baseNotesFields,
              appendBaseNote,
              removeBaseNote,
              register,
              errors,
              t.admin.addPerfume.baseNotesDesc
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="px-8"
            >
              {isLoading
                ? (isEditMode ? t.admin.addPerfume.updatingBtn : t.admin.addPerfume.creatingBtn)
                : (isEditMode ? t.admin.addPerfume.updateBtn : t.admin.addPerfume.createBtn)
              }
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

export default AddPerfumeForm;
