import User from '../models/User.model.js';

class UserController {
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select('-password -refreshTokens')
        .lean();
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  async getAllUsers(req, res) {
    try {
      const users = await User.find()
        .select('-password -refreshTokens')
        .lean();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new UserController();
