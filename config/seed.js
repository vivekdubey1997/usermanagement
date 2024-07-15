const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const Menu = require('../models/Menu');
const connectDB = require('./db');

const seedDatabase = async () => {
    await connectDB();

    try {
        // Create menus if they don't exist
        const menuNames = [
            'User-management',
            'Role-management',
            'Profile',
            'Notifications',
            'Dashboard',
            'Reports',
            'Settings'
        ];
        
        const menus = await Promise.all(menuNames.map(async name => {
            let menu = await Menu.findOne({ name });
            if (!menu) {
                menu = new Menu({ name });
                await menu.save();
            }
            return menu;
        }));

        // Create superadmin role if it doesn't exist
        let superAdminRole = await Role.findOne({ name: 'superadmin' });
        if (!superAdminRole) {
            superAdminRole = new Role({ 
                name: 'superadmin', 
                menus: menus.map(menu => menu._id) // Assigning menu ids to the superadmin role
            });
            await superAdminRole.save();
        }

        // Create superadmin user if it doesn't exist
        const existingSuperAdmin = await User.findOne({ email: 'superadmin@example.com' });
        if (!existingSuperAdmin) {
            const hashedPassword = await bcrypt.hash('superadminpassword', 10);
            const superAdmin = new User({
                firstname: 'Super',
                lastname: 'Admin',
                email: 'superadmin@example.com',
                password: hashedPassword,
                role: superAdminRole._id,
                menus: superAdminRole.menus // Assigning menus from the superadmin role
            });
            await superAdmin.save();
            console.log('Superadmin user created');
        } else {
            console.log('Superadmin user already exists');
        }
    } catch (error) {
        console.error('Error seeding database', error);
    }

    mongoose.connection.close();
};

seedDatabase();
