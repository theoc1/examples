import LambdaHelper from 'path/to/LambdaHelper'
import Validation from 'path/to/Validation'
import { saveUser } from 'path/to/db/user'
import { generateRandomString, hash } from 'path/to/tools/authorization'
import dbConnection from 'path/to/tools/DBConnection'

const lambdaHelper = new LambdaHelper()

/**
 * handler - registers new user, generates password and sends it via email
 * then it calls loginGet lambda and returns its output
 *
 * @param  {Object} options
 * @param  {Object} context
 * @param  {Function} callback
 * @return {Object}  object that contains userId
 */
export async function handler (options, context, callback) {
	try {
		lambdaHelper.init(options)
		dbConnection.connect()

		const data = validation.removeUnexpectedFields(JSON.parse(options.body))
		// validate request data
		const errors = validation.validate(data)
		if (errors) {
			callback(null, lambdaHelper.generateResponse(false, 400, {}, lambdaHelper.errorsFromValidation(errors)))
			return
		}

		// generate password
		const generatedPassword = generateRandomString()
		const passwordHash = hash(generatedPassword)

		const user = {
				...validation.removeUnexpectedFields(data),
			password: passwordHash.hash,
			salt: passwordHash.salt
	}

		try {
			// save user into DB
			await saveUser(user)
		} catch (err) {
			callback(null, lambdaHelper.generateResponse(false, 400, {}, [{
				source: 'email',
				wrongInput: true,
				message: 'Unable to save user. Duplicate email address',
				detail: err.message
			}]))
			return
		}


		// send email with generated password
		await lambdaHelper.invokeLambda('emailSender', {
			template: 'userWelcome',
			data: { password: generatedPassword, name: user.firstName, email: user.email },
			recipients: [user.email]
		})

		// invoke loginGet to authorize user
		const loginResponse = await lambdaHelper.invokeLambda('loginGet', {
			headers: {
				'Origin': options.headers.Origin
			},
			stageVariables: {
				environment: lambdaHelper.env
			},
			queryStringParameters: {
				email: user.email,
				password: generatedPassword
			}
		})

		// hack that needed to correctly return loginGet Payload
		const responseJson = typeof loginResponse.Payload === 'string' ?
			JSON.parse(loginResponse.Payload) :
			loginResponse.Payload

		callback(null, responseJson)

	} catch (err) {
		callback(null, lambdaHelper.generateResponse(false, 500, {}, lambdaHelper.errorsFromException(err)))
	} finally {
		dbConnection.end()
	}
}

const validation = new Validation({
	email: [Validation.is.required, Validation.is.email],
	phone: [Validation.is.required, Validation.is.phone],
	firstName: [Validation.is.required, Validation.is.string, Validation.is.longerThan(0)],
	lastName: [Validation.is.string],
	company: [Validation.is.string],
	position: [Validation.is.string],
	profileImage: [Validation.is.string]
})