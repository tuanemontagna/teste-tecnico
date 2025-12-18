import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
import Profile from '../models/ProfileModel.js';

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ 
            where: { email },
            include: [{ 
                model: Profile, 
                as: 'profile' 
            }] 
        });

        if (!user) {
            return res.status(401).send({ 
                message: 'Invalid credentials' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.profile.name 
            },
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } 
        );

        return res.status(200).send({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                role: user.profile.name
            }
        });

    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
};

export default { login };