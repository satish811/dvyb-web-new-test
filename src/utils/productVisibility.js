const TRUE_VALUES = new Set(["true", "1", "yes", "published", "active", "live"]);
const FALSE_VALUES = new Set(["false", "0", "no", "unpublished", "draft", "inactive", "hidden"]);

const getStringValue = (value) => (typeof value === "string" ? value.trim().toLowerCase() : undefined);

export const normalizeBooleanValue = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalized = getStringValue(value);
  if (!normalized) return undefined;
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return undefined;
};

export const parsePublicationStatus = (value) => {
  const normalized = getStringValue(value);
  if (!normalized) return undefined;
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  return undefined;
};

const getSuperAdminPublished = (product) =>
  normalizeBooleanValue(product?.isAdminPublished);

const getVendorPublished = (product) =>
  normalizeBooleanValue(product?.isPublished);

const toNumericQuantity = (value) => {
  if (value === undefined || value === null || value === "") return undefined;

  const numericValue = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isNaN(numericValue) ? undefined : numericValue;
};

const sumUnitsQuantity = (units) => {
  if (!units || typeof units !== "object") return 0;

  return Object.values(units).reduce((total, value) => {
    const numericValue = toNumericQuantity(value);
    if (numericValue !== undefined) {
      return total + numericValue;
    }

    if (value && typeof value === "object") {
      return total + sumUnitsQuantity(value);
    }

    return total;
  }, 0);
};

export const getProductQuantity = (product) => {
  const unitQuantity = sumUnitsQuantity(product?.units) + sumUnitsQuantity(product?.availability?.units);
  if (unitQuantity > 0) {
    return unitQuantity;
  }

  const quantityFields = [
    product?.quantity,
    product?.availableQuantity,
    product?.stockQuantity,
    product?.stockQty,
    product?.inventoryQty,
    product?.inventoryQuantity,
    product?.totalQuantity,
  ];

  for (const field of quantityFields) {
    if (field === undefined || field === null || field === "") continue;

    const numericValue = typeof field === "number" ? field : Number(String(field).trim());
    if (!Number.isNaN(numericValue)) {
      return numericValue;
    }
  }

  return 0;
};

export const isProductPublishedByBoth = (product) => {
  if (!product) return false;

  const superAdminPublished = getSuperAdminPublished(product);
  const vendorPublished = getVendorPublished(product);

  return superAdminPublished === true && vendorPublished === true;
};

export const getProductAvailabilityLabel = (product) => {
  if (!product) return "Out of Stock";

  if (!isProductPublishedByBoth(product)) {
    return "Out of Stock";
  }

  if (getProductQuantity(product) <= 0) {
    return "Out of Stock";
  }

  return "In Stock";
};

export const isProductOutOfStock = (product) => getProductAvailabilityLabel(product) === "Out of Stock";