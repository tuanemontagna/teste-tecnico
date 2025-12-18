import Profile from '../models/ProfileModel.js';

const get = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;

        if (!id) {
            const response = await Profile.findAll({ order: [['id', 'desc']] });
            return res.status(200).send({ 
                message: 'data found', data: response 
            });
        }

        const response = await Profile.findOne({ 
            where: { id } 
        });

        if (!response) return res.status(404).send({ 
            message: 'record not found' 
        });

        return res.status(200).send({ 
            message: 'data found', data: response 
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

const create = async (body) => {
    try {
        const { 
            name, 
            description 
        } = body;
        
        return await Profile.create({ 
            name, 
            description 
        });
    } catch (error) {
        throw new Error(error.message);
    }
}

const update = async (body, id) => {
    try {
        const response = await Profile.findOne({ 
            where: { id } 
        });

        if (!response) {
            throw new Error('record not found');
        }

        Object.keys(body).forEach((item) => response[item] = body[item]);
        await response.save();
        return response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const persist = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
        if (!id) {
            const response = await create(req.body);
            return res.status(201).send({ 
                message: 'created successfully', 
                data: response 
            });
        }

        const response = await update(req.body, id);
        return res.status(201).send({ 
            message: 'updated successfully', 
            data: response 
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

const destroy = async (req, res) => {
    try {
        const id = req.params.id ? req.params.id.toString().replace(/\D/g, '') : null;
        if (!id) {
            return res.status(400).send({ 
                message: 'please provide an id' 
            });
        }

        const response = await Profile.findOne({ 
            where: { id } 
        });
        if (!response) {
            return res.status(404).send({ 
                message: 'record not found' 
            });
        }
        
        await response.destroy();
        return res.status(200).send({ 
            message: 'record deleted', data: response 
        });
    } catch (error) {
        return res.status(500).send({ 
            message: error.message 
        });
    }
}

export default { 
    get, 
    persist, 
    destroy 
};