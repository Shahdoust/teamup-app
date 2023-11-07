const User = require("../schemas/User");

const changeImageLink = async (req, res) => {
  try {
    const users = await User.find();
    const pattern = /upload/;
    function insert(str, index, value) {
      return str.substr(0, index) + value + str.substr(index);
    }
    const usersWithImage = users.map(async (user) => {
      if (
        user.userInfo.userImage &&
        user.userInfo.userImage?.includes("upload/")
      ) {
        const index = user.userInfo.userImage?.indexOf("upload/");

        const link = insert(
          user.userInfo.userImage,
          index + 7,
          "c_fill,g_face,h_400,w_400/f_png/r_max/"
        );
        console.log("link after", link);
        const updatedUser = await User.findOneAndUpdate(
          { "userInfo.userImage": user.userInfo.userImage },
          {
            $set: { "userInfo.userImage": link },
          },
          { new: true }
        );
        return updatedUser;
      }
    });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = { changeImageLink };
