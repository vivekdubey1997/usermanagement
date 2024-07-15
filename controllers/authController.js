
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



const Role = require('../models/Role');
const User = require('../models/User');
const Menu = require('../models/Menu');

exports.signup = async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
 
    try {
         
            userRole = new Role({ name: 'user' });
            const defaultMenus = ['Profile', 'Settings'];
            const menuObjects = await Promise.all(defaultMenus.map(async (menuName) => {
                let menu = await Menu.findOne({ name: menuName });

                if (!menu) {
                    menu = new Menu({ name: menuName });
                    await menu.save();
                }
               
                return menu; 
            }));

            // Assign collected menu objects to the role
     
            userRole.menus = menuObjects;

            // Save the new role
            await userRole.save();
        

        // Create the new user with assigned role
      
        const newUser = new User({
            firstname,
            lastname,
            email,
            password,
            role: userRole._id // Assign the ObjectId of the role to the user
        });

        // Save the new user
        await newUser.save();

        // Return the user with populated role (including menus)
        const savedUser = await User.findById(newUser._id).populate({
            path: 'role',
            populate: { path: 'menus' } // Populate menus within the role
        });

        res.status(201).json(savedUser);
    } catch (error) {
       
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).populate('role');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token,user });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};









exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('role');

        // Manually populate 'menus' in 'role' for each user
        const populatedUsers = await Promise.all(users.map(async user => {
            if (user.role && user.role.menus) {
                const menus = await Menu.find({ _id: { $in: user.role.menus } }).select('_id name');
                user.role.menus = menus;
            }
            return user;
        }));

        res.json(populatedUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};









exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

  
    const isPasswordUpdated = updates.password !== undefined;

    try {
        // If password is updated, hash the new password
        if (isPasswordUpdated) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        // Handle updating role if present in updates
        if (updates.role) {
            const role = await Role.findOne({ _id: updates.role });
            if (!role) {
                return res.status(404).json({ message: 'Role not found' });
            }
            updates.role = updates.role; // Assign role ID from updates to update in User document
        }

        // Handle updating menus if present in updates
        if (updates.menus) {
            // Assuming updates.menus contains an array of menu IDs
            updates.menus = updates.menus; // Assign menu IDs from updates to update in User document
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Function to delete a user by ID
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
      
        res.status(500).json({ message: 'Server Error' });
    }
};


