const express = require('express')
const server = express()
const bodyParser = require('body-parser')
const { query } = require('express')

const model = {
  clients: {},
  reset: function () {
    model.clients = {}
  },
  addAppointment: function (name, date) {
    date.status = 'pending'
    if (!model.clients[name]) model.clients = { ...model.clients, [name]: [date] }
    else model.clients[name].push(date)
    return date
  },
  attend: function (name, date) {
    let resultado
    model.clients[name].map((appointment) => {
      if (appointment.date === date) {
        appointment.status = 'attended'
        resultado = appointment
      }
    })
    return resultado
  },

  expire: function (name, date) {
    let resultado

    model.clients[name].map((appointment) => {
      if (appointment.date === date) {
        appointment.status = 'expired'
        resultado = appointment
      }
    })
    return resultado
  },

  cancel: function (name, date) {
    let resultado
    model.clients[name].map((appointment) => {
      if (appointment.date === date) {
        appointment.status = 'cancelled'
        resultado = appointment
      }
    })
    return resultado
  },

  erase: function (name, dateStatus) {
    if (isNaN(parseInt(dateStatus))) {
      const deleted = model.clients[name].filter(appointment => appointment.status === dateStatus)
      model.clients[name] = model.clients[name].filter(appointment => appointment.status !== dateStatus)
      return deleted
    } else {
      const deleted = model.clients[name].filter(appointment => appointment.date === dateStatus)
      model.clients[name] = model.clients[name].filter(appointment => appointment.date !== dateStatus)
      return deleted
    }
  },

  getAppointments: function (name, status) {
    if (!status) return model.clients[name]
    else return model.clients[name].filter(appointment => appointment.status === status)
  },

  getClients: function () {
    return Object.keys(model.clients)
  },

  checkClient: function (name) {
    return model.clients.hasOwnProperty(name)
  },

  checkDate: function (name, date) {
    return model.clients[name].find(obj => obj.date === date)
  }
}

server.use(bodyParser.json())

server.get('/api', (req, res) => {
  res.json(model.clients)
})

server.post('/api/Appointments', (req, res) => {
  if (!req.body.client) {
    res
      .status(400)
      .send('the body must have a client property')
  } else if (typeof req.body.client !== 'string') {
    res
      .status(400)
      .send('client must be a string')
  } else {
    const respuesta = model.addAppointment(req.body.client, req.body.appointment)
    res.json(respuesta)
  }
})

// UBICADO ACA ESTE ENDPOINT FUNCIONA CORRECTAMENTE Y PASAN TODOS LOS TEST
server.get('/api/Appointments/clients', (req, res) => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>> EL ENDPOINT QUE NO QUIERE ENTRAR')
  res.send(model.getClients())
/// ////////////////////////////////////////////////////////////////////////
})

server.get('/api/Appointments/:name', (req, res) => {
  const options = ['attend', 'expire', 'cancel']

  if (!model.checkClient(req.params.name)) {
    // console.log ('NO HAY NAME <<<<<<<<<<<<<<<<<<<<<<<<<')
    res
      .status(400)
      .send('the client does not exist')
  } else if (!model.checkDate(req.params.name, req.query.date)) {
    // console.log ('NO EXISTE ESE NAME<<<<<<<<<<<<<<<<<<<<<<<<<')
    res
      .status(400)
      .send('the client does not have a appointment for that date')
  } else if (!options.includes(req.query.option)) {
    // console.log ('NO EXISTE ESA OPTION<<<<<<<<<<<<<<<<<<<<<<<<<')
    res
      .status(400)
      .send('the option must be attend, expire or cancel')
  } else {
    res.json(model[req.query.option](req.params.name, req.query.date))
  }
})

// UBICADO ACA NO ENTRA EN ESTE ENDPOINT, ENTRA EN EL ANTERIOR
server.get('/api/Appointments/clients', (req, res) => {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>> EL ENDPOINT QUE NO QUIERE ENTRAR')
  res.send(model.getClients())
})
/// ///////////////////////////////////////////////////////////

server.get('/api/Appointments/:name/erase', (req, res) => {
  if (!model.checkClient(req.params.name)) {
    res
      .status(400)
      .send('the client does not exist')
  } else {
    res.json(model.erase(req.params.name, req.query.date))
  }
})

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
  res.send(model.getAppointments(req.params.name, req.query.status))
})

if (!module.parent) server.listen(3000)
// server.listen(3000);

module.exports = { model, server }
