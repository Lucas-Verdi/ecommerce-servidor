const decrypt = require('./decrypt')
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const { Sequelize, DataTypes } = require('sequelize')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const segredo = 'yN5"xD7!dM9<fF8!eO6!tF5}sD9"kZ0,'


function verifyJWT(req, res, next) {
  const token = req.headers['x-access-token']
  jwt.verify(token, segredo, (err, decoded) => {
    if (err) {
      return res.status(401).end()
    }
    else {
      req.userId = decoded.userId
      next()
    }

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

const Produto = sequelize.define('produtos', {
  nome: {
    type: DataTypes.STRING
  },
  valor: {
    type: DataTypes.DECIMAL
  }
})

const MaisVendido = sequelize.define('maisvendidos', {
  nome: {
    type: DataTypes.STRING
  },
  valor: {
    type: DataTypes.DECIMAL
  }
})

app.post('/cadastro', async (req, res) => {
  try {
    const data = req.headers['credentials']
    const decryptedData = await decrypt(data)
    const novoCliente = await Cliente.create({
      nome: decryptedData[0].nome,
      sobrenome: decryptedData[0].sobrenome,
      dtnascimento: decryptedData[0].dtnascimento,
      cpf: decryptedData[0].cpf,
      email: decryptedData[0].email,
      celular: decryptedData[0].celular,
      password: decryptedData[0].password
    })
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
    res.status(500).json({ error: 'Erro ao inserir usuário' });
  }
});

app.post('/login', async (req, res) => {
  const data = req.headers['credentials']
  const decryptedData = await decrypt(data)
  const { email, password } = decryptedData[0]
  const logado = await Cliente.findOne({ where: { email, password } })
  const id = await Cliente.findAll({ attributes: ['id'], where: { email, password } })

  if (logado) {
    const token = jwt.sign({ userId: id[0].id }, segredo, { expiresIn: 86400 })
    res.json({ success: true, token })
  }
  else {
    res.status(401).end()
  }
})

app.post('/verify', verifyJWT, async (req, res) => {
  console.log('Usuário de ID ' + req.userId + ' Fez login.')
  res.json({ success: true })
})

app.post('/produtos', async (req, res) => {
    const produtos = await Produto.findAll({ attributes: ['nomeproduto', 'valorproduto'] })
    res.send(produtos)
})

app.post('/maisvendidos', async (req, res) => {
  const maisvendido = await MaisVendido.findAll({ attributes: ['maisvendidonome', 'maisvendidovalor'] })
  res.send(maisvendido)
})
