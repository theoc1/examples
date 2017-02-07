import sortBy from 'lodash/sortBy'
import map from 'lodash/map'
import LambdaHelper from 'path/to/tools/LambdaHelper'
import { getAllProfessions } from 'path/to/db/profession'

const lambdaHelper = new LambdaHelper()

export async function handler (options, context, callback) {
	lambdaHelper.init(options)

	try {
		const professions = await getAllProfessions(lambdaHelper.env)
		const sortedProfessions = map(sortBy(professions, x => x.weight), x => x.name)
		callback(null, lambdaHelper.generateResponse(true, 200, sortedProfessions, null))
	} catch (err) {
		callback(null, lambdaHelper.generateResponse(false, 500, {}, lambdaHelper.errorsFromException(err)))
	}
}