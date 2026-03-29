export class ReviewModel {
  /**
   * Constructor
   * @param {*} param0
   */
  constructor({
    id = null,
    productId,
    userId,
    userEmail,
    userName,
    userImage = null,
    rating,
    title,
    comment,
    images = [],
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.productId = productId;
    this.userId = userId;
    this.userEmail = userEmail;
    this.userName = userName;
    this.userImage = userImage;
    this.rating = rating;
    this.title = title;
    this.comment = comment;
    this.images = Array.isArray(images) ? images : [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validate review data
   * @returns {boolean}
   */
  validate() {
    if (!this.productId) throw new Error("Product ID is required");
    if (!this.rating || this.rating < 1 || this.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    if (!this.title || this.title.trim().length === 0) {
      throw new Error("Review title is required");
    }
    if (!this.comment || this.comment.trim().length === 0) {
      throw new Error("Review comment is required");
    }
    if (this.title.length > 100) {
      throw new Error("Review title must be less than 100 characters");
    }
    if (this.comment.length > 1000) {
      throw new Error("Review comment must be less than 1000 characters");
    }
    return true;
  }

  /**
   * Convert to plain object for Firestore
   * @returns {Object}
   */
  toFirestore() {
    return {
      productId: this.productId,
      userId: this.userId,
      userEmail: this.userEmail,
      userName: this.userName,
      userImage: this.userImage,
      rating: this.rating,
      title: this.title.trim(),
      comment: this.comment.trim(),
      images: this.images,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create ReviewModel from Firestore data
   * @param {string} id - Document ID
   * @param {Object} data - Firestore data
   * @returns {ReviewModel}
   */
  static fromFirestore(id, data) {
    return new ReviewModel({
      id,
      productId: data.productId,
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      userImage: data.userImage,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: Array.isArray(data.images) ? data.images : data.image ? [data.image] : [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  }
}
