const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const { Sequelize, DataTypes } = require('sequelize')
const jwt = require('jsonwebtoken')
const segredo = 'yN5"xD7!dM9<fF8!eO6!tF5}sD9"kZ0,'


function verifyJWT(req, res, next){
  const token = req.headers['x-access-token']
  jwt.verify(token, segredo, (err, decoded) => {
    if (err) return res.status(401).end()
    req.userId = decoded.userId
    next()
  })
}

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
  const id = await Cliente.findAll({attributes:['id'], where: {email, password}})

  if(logado){
    const token = jwt.sign({userId: id}, segredo, {expiresIn: 30})
    res.json({ success: true, token })
  }
  else{
    res.json({ success: false })
  }
})

app.post('/verify', verifyJWT, async (req, res) => {
  res.json({ success: true })
})

