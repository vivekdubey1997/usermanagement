const Role = require('../models/Role');
const Menu = require('../models/Menu');


exports.createRole = async (req, res) => {
    const { name, menus } = req.body;
    try {
        // Create a new role instance
        const userRole = new Role({ name });

        // Fetch or create menu objects
        const menuObjects = await Promise.all(menus.map(async (menuName) => {
            let menu = await Menu.findOne({ name: menuName });

            if (!menu) {
                menu = new Menu({ name: menuName });
                menu = await menu.save(); // Save the new menu if it doesn't exist
            }

            return menu;
        }));

        // Assign collected menu objects to the role
        userRole.menus = menuObjects;

        // Save the new role with assigned menus
        await userRole.save();

        // Send success response
        res.status(201).json({userRole });
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Error creating role', error });
    }
};

exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, menus } = req.body;
    try {
        const role = await Role.findByIdAndUpdate(id, { name, menus }, { new: true });
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.json({ message: 'Role updated successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Error updating role', error });
    }
};
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().populate('menus');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error });
    }
};

