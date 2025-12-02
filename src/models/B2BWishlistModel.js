export class B2BWishlistItemModel {
  /**
   * Constructor - Essential fields only
   * @param {*} param0
   */
  constructor({ productId, productData = {}, variants = [], userId = null }) {
    this.productId = productId;
    this.userId = userId;

    /**
     * Essential product information
     */
    this.name = productData.name || productData.title || "Unknown Product";
    this.price = productData.price || 0;
    this.image = productData.imageUrls?.[0] || productData.image || "/placeholder.jpg";
    this.description = productData.description || "";

    /**
     * B2B variants array - CORE FEATURE
     */
    this.variants = variants.map((v) => ({
      color: v.color,
      size: v.size,
      quantity: v.quantity || 1,
    }));

    /**
     * Calculated fields
     */
    this.totalQuantity = this.variants.reduce((sum, v) => sum + v.quantity, 0);
    this.subtotal = this.price * this.totalQuantity;

    /**
     * B2B specific fields
     */
    this.isB2B = true;
    this.userRole = "B2B";

    /**
     * Timestamps
     */
    this.addedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Helper method to update variants
   * @param {*} newVariants
   */
  updateVariants(newVariants) {
    this.variants = newVariants;
    this.totalQuantity = this.variants.reduce((sum, v) => sum + v.quantity, 0);
    this.subtotal = this.price * this.totalQuantity;
    this.updatedAt = new Date();
  }

  /**
   * Convert to plain object for storage
   * @returns
   */
  toFirestore() {
    return {
      productId: this.productId,
      userId: this.userId,
      name: this.name,
      price: this.price,
      image: this.image,
      description: this.description,
      variants: this.variants,
      totalQuantity: this.totalQuantity,
      subtotal: this.subtotal,
      isB2B: this.isB2B,
      userRole: this.userRole,
      addedAt: this.addedAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create from existing wishlist item (for editing)
   * @param {*} existingItem
   * @param {*} newVariants
   * @returns
   */
  static fromExisting(existingItem, newVariants = null) {
    return new B2BWishlistItemModel({
      productId: existingItem.productId || existingItem.id,
      productData: {
        name: existingItem.name,
        price: existingItem.price,
        image: existingItem.image,
        description: existingItem.description,
      },
      variants: newVariants || existingItem.variants,
      userId: existingItem.userId,
    });
  }

  /**
   * Check if item has variants (B2B specific)
   * @returns {boolean}
   */
  hasVariants() {
    return this.variants && this.variants.length > 0;
  }

  /**
   * Get total price for all variants
   * @returns {number}
   */
  getTotalPrice() {
    return this.subtotal;
  }
}
