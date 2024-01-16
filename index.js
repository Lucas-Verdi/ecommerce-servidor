const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize('ecommerce', 'root', '64784585', {
  host: 'localhost',
  dialect: 'mysql'
});

app.use(express.json());
app.use(cors({
  origin: true,
}))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.post('/teste', async (req, res) => {
  const clientes = await clientes.create({
    nome: req.body.nome,
    sobrenome: req.body.sobrenome,
    dtnascimento: req.body.dtnascimento,
    cpf: req.body.cpf,
    email: req.body.email,
    celular: req.body.celular
  })
})
