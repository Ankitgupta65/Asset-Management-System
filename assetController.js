const Asset = require('../models/Asset');

exports.addAsset = async (req, res) => {
    const { name, description, assignedTo, dateAssigned } = req.body;
    const asset = new Asset({ name, description, assignedTo, dateAssigned });
    await asset.save();
    res.json({ message: 'Asset added successfully' });
};

exports.getAssets = async (req, res) => {
    const assets = await Asset.find();
    res.json(assets);
};

exports.deleteAsset = async (req, res) => {
    const { id } = req.params;
    await Asset.findByIdAndDelete(id);
    res.json({ message: 'Asset deleted successfully' });
};
