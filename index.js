const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const connection = require('./database/database')

const categoriesController = require('./categories/categoriesController')
const articlesController = require('./articles/articlesController')
const usersController = require('./users/usersController')

const Article = require('./articles/Article')
const Category = require('./categories/Category')
const User = require('./users/Users')

//View engine
app.set('view engine', 'ejs')


//Sessions

app.use(session({
    secret: 'qualquercoisa', cookie: {maxAge: 30000}
}))

//Static
app.use(express.static('public'))

//Body Parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//Database
connection.authenticate()
.then(()=> {
    console.log('Authentication successful')
}).catch((error)=> {
    console.log(error)
})

//Rotas
app.use('/', categoriesController)
app.use('/', articlesController)
app.use('/', usersController)

app.get('/session', (req, res)=> {
    req.session.treinamento = 'formação node.js'
    req.session.ano = 2022
    req.session.email = 'rian@udemy.com'
    req.session.user = {
        username: 'rianlucas',
        email: 'email@example.com',
        id: 10,
    }
})

app.get('/leitura', (req, res)=> {
    res.json({
        treinamento: req.session.treinamento,
        ano: req.session.ano,   
        email: req.session.email,
        user: req.session.user,
    })
})


app.get('/', (req, res)=> {

    Article.findAll({
        order:[
            ['id', 'desc']
        ],
        limit: 4
    }).then((articles) => {
        Category.findAll().then(categories => {
        res.render('index', {articles, categories})
        })
    })
})

app.get('/:slug', (req, res)=> {
    let slug = req.params.slug
    Article.findOne({
        where: {
            slug,
        },
    }).then((article)=> {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render('article', {article, categories})
                })
        } else {
            res.redirect('/')
        }
    }).catch(error => {
        res.redirect('/')
    })
})

app.get('/category/:slug', (req, res)=> {
    let slug = req.params.slug
    Category.findOne({
        where: {
            slug,
        },
        include: [{model: Article}]
    }).then(category => {
        if (category != undefined) {
            Category.findAll().then(categories => {
                res.render('index', {
                    articles: category.articles,
                    categories,
                })
            })
        } else {
            res.redirect('/')
        }
    }).catch(error => {
        res.redirect('/')
    })
})

app.listen('8080', ()=> {
    console.log('Listening on port 8080')
})