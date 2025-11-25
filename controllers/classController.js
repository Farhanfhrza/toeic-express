const { Class } = require("../models");

exports.getAllClasses = async (req, res) => {
    const classes = await Class.findAll();
    res.json(classes);
  };
