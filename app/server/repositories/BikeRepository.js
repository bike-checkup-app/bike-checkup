const Repository = require('./Repository');

const BikeModel = require('../schemas/Bike').BikeModel;

class BikeRepository extends Repository{

    constructor(bikeModel){
        super(bikeModel);
    }

	GetUsersBikes(userId){
		return this.documentModel.find({owner: userId}).exec();
	}
}

const bikeRepository = new BikeRepository(BikeModel);
module.exports = bikeRepository;