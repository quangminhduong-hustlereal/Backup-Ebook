class User {
  constructor(userData) {
    this.id = userData._id;
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.profilePicture = userData.profilePicture;
    this.coverPicture = userData.coverPicture;
    this.followers = userData.followers;
    this.following = userData.following;
    this.createdAt = userData.createdAt;
    this.updatedAt = userData.updatedAt;
  }
}

export default User;
