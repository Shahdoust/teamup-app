const User = require("../schemas/User");

// Calculate and update the average user rating
const calculateAverageRating = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });

    if (!user) {
      throw new Error("User not found to calculate rating");
    }

    // Get user info from User schema
    const userRating = user.userInfo.userRating;

    if (userRating.length === 0) {
      userRating.averageRating = 0;
    } else {
      const totalRatingSum = userRating.reduce(
        (sum, rating) => sum + rating.rating,
        0
      );
      const calRating = totalRatingSum / userRating.length;
      const averageRate = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            "userInfo.averageRating": calRating,
          },
        }
      );
    }
  } catch (error) {
    console.error("Error calculating average user rating: ", error);
  }
};

module.exports = { calculateAverageRating };
