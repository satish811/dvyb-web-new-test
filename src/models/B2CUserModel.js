/**
 * b2c User Model
 * Represents an individual retail customer.
 */
export class B2CUserModel {
  constructor({
    uid,
    email = null,
    phoneNumber = null,
    name = "",
    address = "",
    wishlist = [],
    orders = [],
    gender = "",
    dob = "",
    profilePic = "",
    extraData = {},
  }) {
    this.uid = uid;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.name = name;
    this.address = address;
    this.wishlist = wishlist;
    this.orders = orders;
    this.gender = gender;
    this.dob = dob;
    this.profilePic = profilePic;
    this.role = "b2c";
    this.extraData = extraData;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
