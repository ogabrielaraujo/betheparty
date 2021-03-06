'use strict'

const { validate } = use('Validator')
const Party = use('App/Models/Party')

class PartyController {
  async index({ request }) {
    const { page = 1 } = request.get()

    // paginate 5 items per page
    return await Party.query()
      .with('company')
      .paginate(page, 5)
  }

  async store({ request, response }) {
    const { title, description, value } = request.body

    const company_id = request.header('authorization')

    if (!company_id) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    return await Party.create({ title, description, value, company_id })
  }

  async destroy({ request, response }) {
    const rules = {
      id: 'required|number',
    }

    const validation = await validate(request.params, rules)

    if (validation.fails()) {
      return response.status(401).json([
        {
          message: 'You must provide a valid id',
          field: 'id',
          validation: 'number',
        },
      ])
    }

    const { id } = request.params
    const company_id = request.header('Authorization')
    const party = await Party.find(id)

    if (company_id !== party.company_id) {
      return response.status(401).json({ error: 'Unauthorized' })
    }

    return await party.delete()
  }
}

module.exports = PartyController
