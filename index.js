const decrypt = require('./decrypt')
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const { Sequelize, DataTypes, Op } = require('sequelize')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const segredo = 'yN5"xD7!dM9<fF8!eO6!tF5}sD9"kZ0,'

//Middleware de verificação de token
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

//Instância do express
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use(express.json());
app.use(cors({
  origin: true,
}))

//Modelagem do banco de dados
const sequelize = new Sequelize('ecommerce', 'root', 'root', {
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
    type: DataTypes.STRING
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

const Carrinho = sequelize.define('carrinho', {
  idcliente: {
    type: DataTypes.INTEGER
  },
  idproduto: {
    type: DataTypes.INTEGER
  },
  idmaisvendido: {
    type: DataTypes.INTEGER
  }
})

//Rota para cadastro
app.post('/cadastro', async (req, res) => {
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
});

//Rota para login
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

//Rota para verificação de autenticação ao entrar no site
app.post('/verify', verifyJWT, async (req, res) => {
  console.log('Usuário de ID ' + req.userId + ' Fez login.')
  res.json({ success: true })
})

//Rota para trazer os produtos para a index page
app.post('/produtos', async (req, res) => {
  const produtos = await Produto.findAll({ attributes: ['nomeproduto', 'valorproduto', 'imgproduto'] })
  res.send(produtos)
})

//Rota para adicionar ao carrinho
app.post('/cartadd', verifyJWT, async (req, res) => {
  const idcliente = `${req.userId}`
  const idproduto = req.headers['idproduto']
  const novoCarrinho = await Carrinho.create({
    idcliente: idcliente,
    idproduto: idproduto
  })
  res.json({ success: true })
})

//Rota para verificar qual produto será adicionado ao carrinho
app.post('/productverify', async (req, res) => {
  const nomeproduto = req.headers['nomeproduto']
  const valorproduto = req.headers['valorproduto']
  const produto = await Produto.findAll({ attributes: ['id'], where: { nomeproduto, valorproduto } })
  res.json(produto[0].id)
})

//Rota para verificar os id's de produtos inseridos no carrinho
app.post('/cartverify', verifyJWT, async (req, res) => {
  const idcliente = `${req.userId}`
  const carrinho = await Carrinho.findAll({ attributes: ['idproduto'], where: { idcliente } })
  res.json(carrinho)
})

//Rota para exibir produtos no carrinho
app.post('/cartshow', verifyJWT, async (req, res) => {
  const idmaisvendidos = req.body
  let final = []
  for (let i = 0; i < idmaisvendidos.length; i++) {
    let id = idmaisvendidos[i].idproduto
    let produtos = await Produto.findAll({ attributes: ['nomeproduto', 'valorproduto'], where: { id } })
    final.push(produtos)
  }
  res.json(final)
})

//Rota para remover item do carrinho
app.post('/removeritemcarrinho', verifyJWT, async (req, res) => {
  const nomeproduto = req.headers['nomeproduto']
  const valorproduto = req.headers['valorproduto']
  let produtoId = await Produto.findOne({ attributes: ['id'], where:  {nomeproduto, valorproduto } })
  await Carrinho.destroy({
    where: {
      idproduto: produtoId.dataValues.id
    }
  })
  res.send('success')
})

//Rota para verificar o produto e exibir os dados na página do produto em questão
app.post('/toPage', async (req, res) => {
  const id = req.headers['idproduto']
  let produto = await Produto.findAll({attributes: ['nomeproduto', 'valorproduto', 'descricao', 'imgproduto'], where: {id}})
  res.json(produto)
})

app.post('/produtopcategoria', async (req, res) => {
  const categoria = req.headers['idcategoria']
  let produtos = await Produto.findAll({attributes: ['nomeproduto', 'valorproduto', 'descricao', 'imgproduto'], where: {categoria}})
  res.json(produtos)
})

app.post('/pesquisa', async (req, res) => {
  const pesquisa = req.headers['pesquisa']
  let produtos = await Produto.findAll({attributes: ['nomeproduto', 'valorproduto', 'descricao', 'imgproduto'], where: { nomeproduto: { [Op.like]: '%' + pesquisa + '%' } }})
  res.json(produtos)
})

