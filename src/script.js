const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")

const app = express()
const PORT = 3030

app.use(cors())
app.use(express.json())

let users = []
let mensagens = []

                     //Bem-vindo
app.get("/", (req, res) => {
  if (req.url !== "/") {
    return res.status(404).send("Página não encontrada")
  }
  res.status(200).send("Seja bem-vindo!")
})

                    //Criar usuário
app.post("/signup", async (req, res) => {
  const {name, email, password} = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Ops! Algo deu errado, verifique os dados e tente novamente.",
    })
  }

  if (users.some((user) => user.email === email)) {
    return res
      .status(400)
      .json({error: "Email já cadastrado!"})
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({error: "Erro ao criar usuário."})
    }

    const id = Math.floor(Math.random() * 1000) + 1

    const newUser = {id, name, email, password: hashedPassword}
    users.push(newUser)

    return res.status(201).json({
      message: `Seja bem-vindo(a) ${name}! Registro criado com sucesso!`,
    })
  })
})

              //Página de login
app.post("/login", async (req, res) => {
  const {email, password} = req.body

  if (!email || !password) {
    return res
      .status(400)
      .json({error: "Insira um e-mail e uma senha válida."})
  }

  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(404).json({
      error: "Usuário não encontrado. Verifique as informações de login.",
    })
  }

  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao fazer login." })
    }

    if (!isMatch) {
      return res.status(400).json({ error: "Senha incorreta." })
    }

    return res.status(200).json({
      message: `Seja bem-vindo(a) ${user.name}!`,
    })
  })
})

                    //Criar mensagem
app.post("/mensagem", (req, res) => {
  const {title, description, email} = req.body

  if (!title || !description || !email) {
    return res.status(400).json({
      error: "Por favor, verifique as informações novamente.",
    })
  }

  if (!users.some((user) => user.email === email)) {
    return res
      .status(404)
      .json({error: "Email não encontrado, verifique ou crie uma conta."})
  }

  const id = Math.floor(Math.random() * 1000) + 1;

                     //Nova mensagem
  const novaMensagem = {id, title, description, email}
  mensagens.push(novaMensagem)

  return res
    .status(201)
    .json({message: "Mensagem criada com sucesso!", novaMensagem})
})

                    //Ler as mensagens de um usuário
app.get("/mensagem/:email", (req, res) => {
  const {email} = req.params

  if (!users.some((user) => user.email === email)) {
    return res
      .status(404)
      .json({error: "Email não encontrado, verifique ou crie uma conta."})
  }

  const userMensagens = mensagens.filter(
    (mensagem) => mensagem.email === email
  )

  return res.status(200).json({
    mensagem: `Mensagens: ${JSON.stringify(userMensagens)}`,
  })
})

              //Atualizar mensagem pelo id 
app.put("/mensagem/:id", (req, res) => {
  const {id} = req.params
  const {title, description} = req.body

  if (!title || !description) {
    return res.status(400).json({
      error: "Por favor, verifique as informações novamente.",
    })
  }

  const mensagem = mensagens.find((mensagem) => mensagem.id === parseInt(id))

  if (!mensagem) {
    return res.status(404).json({
      error:
        "Mensagem não encontrada, verifique se o identificador existe.",
    })
  }

  mensagem.title = title
  mensagem.description = description

  return res.status(200).json({
    mensagem: `Mensagem atualizada com sucesso!`,
    updatedMensagem: mensagem,
  })
})

            //Deletar mensagem pelo id
app.delete("/mensagem/:id", (req, res) => {
  const { id } = req.params

  const mensagemIndex = mensagens.findIndex(
    (mensagem) => mensagem.id === parseInt(id)
  )

  if (mensagemIndex === -1) {
    return res.status(404).json({
      error:
        "Mensagem não encontrada, verifique se o identificador existe.",
    })
  }

  mensagens.splice(mensagemIndex, 1)

  return res.status(200).json({ mensagem: "Mensagem apagada com sucesso" })
});

       //Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});