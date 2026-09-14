import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const email = process.env.ADMIN_EMAIL || 'swejaltembhare044@gmail.com';
    const newPassword = process.env.NEW_ADMIN_PASSWORD || 'admin123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (updatedUser) {
      console.log(`Password reset success for: ${email}`);
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Password reset script error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

resetPassword();