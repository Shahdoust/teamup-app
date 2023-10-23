const mongoose = require("mongoose");

const Event = require("../schemas/Event");
const jwt = require("jsonwebtoken");

const viewOneEvent = async (req, res) => {
  const id = req.params.id;
  try {
    const event = await Event.findOne({ _id: id });

    if (event) {
      res.status(200).json(event);
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  viewOneEvent,
};
