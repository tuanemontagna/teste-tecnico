import User from '../models/UserModel.js';

export const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            where: { id: req.userId }
         });

        if (!user) {
            return res.status(401).send({ 
                message: 'User not found' 
            });
        }

        if (user.profileId !== 1) {
            return res.status(403).send({
                message: 'Only admins are allowed'
            });
        }

        return next();
    } catch (error) {
        return res.status(500).send({ 
            message: 'Error verifying permission' 
        });
    }
};