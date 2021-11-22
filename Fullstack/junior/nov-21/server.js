const {Sequelize, STRING, DataTypes, UUID, UUIDV4} = require('sequelize')
const express = require('express')
const app = express()
const connect = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_db')

app.get('/api/department', async(req, res, next) => {
	try{
		res.send(await Department.findAll({
			include: [
				{
					model: Employee,
					as: 'manager'
				}
			]
		}))
	}
	catch(ex) {
		next(ex)
	}
})

app.get('/api/employee', async(req, res, next) => {
	try{
		res.send(await Employee.findAll())
	}
	catch(ex) {
		next(ex)
	}
})
const Department = connect.define('department', {
	name: {
		type: STRING(20),
	}
});
const Employee = connect.define('employee', {
	id: {
		type: UUID,
		primaryKey: true,
		defaultValue: UUIDV4
	},
	name: {
		type: STRING(20),
	}
});

Department.belongsTo(Employee, {as: 'manager'})
Employee.hasMany(Department, {foreignKey: 'managerId'})

const seed = async() => {
	await connect.sync({force: true})
	const [moe, lucy, hr, engineering] = await Promise.all([
	Employee.create({name: 'moe'}),
	Employee.create({name: 'lucy'}),
	Department.create({name: 'hr'}),
	Department.create({name: 'engineering'})
	])

	hr.managerId = lucy.id
	await hr.save()
}

const init = async() => {
	try {
		await connect.authenticate()
		await seed()
		const port = process.env.PORT || 3000
		app.listen(port, ()=> console.log(`Listening port on ${port}`))
	}
	catch(ex) {
		next(ex)
	}
}

init()