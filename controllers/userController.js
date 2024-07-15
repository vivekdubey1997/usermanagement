const User = require('../models/User');
const Role = require('../models/Role');
const Menu = require('../models/Menu')

exports.assignRole = async (req, res) => {
    const { userId, roleId } = req.body;
    try {
        const user = await User.findById({_id:userId});
        if (!user) return res.status(404).json({ message: 'User not found' });

        const role = await Role.findById({_id:roleId});
        if (!role) return res.status(404).json({ message: 'Role not found' });

        user.role = role._id;
     
        await user.save();
        res.json({ message: 'Role assigned successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning role', error });
    }
};




exports.updateMenus = async (req, res) => {
    const { userId, menus } = req.body;

    try {
        // Validate that all provided menu IDs exist
        const validMenus = await Menu.find({ _id: { $in: menus } });
        if (validMenus.length !== menus.length) {
            return res.status(400).json({ message: 'One or more menu IDs are invalid' });
        }

        // Find the user by ID and update their menus
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update the user's menus
        user.menus = validMenus.map(menu => menu._id);
        await user.save();

        res.json({ message: 'Menus updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating menus', error });
    }
};
exports.getById = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId).populate({
            path: 'role',
            populate: { path: 'menus' } // Populate menus within the role
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get User by ID Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

