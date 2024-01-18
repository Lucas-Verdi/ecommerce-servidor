const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const { Sequelize, DataTypes } = require('sequelize')


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use(express.json());
app.use(cors({
  origin: true,
}))

const sequelize = new Sequelize('ecommerce', 'root', '64784585', {
  host: 'localhost',
  dialect: 'mysql'
});

const Cliente = sequelize.define('clientes', {
  nome: {
    type: DataTypes.STRING
  },
  sobrenome: {
    type: DataTypes.STRING
  },
  dtnascimento: {
    type: DataTypes.DATE
  },
  cpf: {
    type: DataTypes.INTEGER
  },
  email: {
    type: DataTypes.STRING
  },
  celular: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING
  }

})

app.post('/cadastro', async (req, res) => {
  try {
    const novoCliente = await Cliente.create({
      nome: req.body.nome,
      sobrenome: req.body.sobrenome,
      dtnascimento: req.body.dtnascimento,
      cpf: req.body.cpf,
      email: req.body.email,
      celular: req.body.celular,
      password: req.body.password
    })
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    res.status(500).json({ error: 'Erro ao inserir usuário' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const logado = await Cliente.findOne({ where: {email, password} })

  if(logado){
    res.json({ success: true })
  }
  else{
    res.json({ success: false })
  }
})
